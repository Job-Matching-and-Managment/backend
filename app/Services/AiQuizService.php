<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Cv;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiQuizService
{
    private string $apiKey;
    private string $apiUrl;
    private string $model;
    private bool   $configured;

    public function __construct()
    {
        // Prefer Groq (free & fast); fall back to OpenAI
        if ($key = config('services.groq.key')) {
            $this->apiKey     = $key;
            $this->apiUrl     = 'https://api.groq.com/openai/v1/chat/completions';
            $this->model      = config('services.groq.model', 'llama-3.1-8b-instant');
            $this->configured = true;
        } elseif ($key = config('services.openai.key')) {
            $this->apiKey     = $key;
            $this->apiUrl     = 'https://api.openai.com/v1/chat/completions';
            $this->model      = 'gpt-4o-mini';
            $this->configured = true;
        } else {
            $this->apiKey     = '';
            $this->apiUrl     = '';
            $this->model      = '';
            $this->configured = false;
        }
    }

    public function isConfigured(): bool
    {
        return $this->configured;
    }

    /**
     * Return the cached AI quiz for this user, or null if none exists.
     */
    public function getCached(int $userId): ?Assessment
    {
        return Assessment::where('user_id', $userId)
            ->where('is_ai_generated', true)
            ->where('approval_status', 'approved')
            ->withCount('questions')
            ->first();
    }

    /**
     * Generate a fresh quiz (deletes previous one for this user first).
     * Returns the new Assessment or null on failure.
     */
    public function generate(int $userId): ?Assessment
    {
        if (!$this->configured) {
            Log::warning('AiQuizService: No LLM API key configured. Set GROQ_API_KEY or OPENAI_API_KEY in .env');
            return null;
        }

        // Load user CV
        $cv = Cv::where('user_id', $userId)->where('is_default', true)->with(['skills', 'experiences'])->first()
            ?? Cv::where('user_id', $userId)->with(['skills', 'experiences'])->first();

        if (!$cv || $cv->skills->isEmpty()) {
            return null;
        }

        $prompt   = $this->buildPrompt($cv);
        $data     = $this->callLlm($prompt);

        if (!$data) {
            return null;
        }

        // Delete previous AI quiz for this user before saving the new one
        Assessment::where('user_id', $userId)->where('is_ai_generated', true)->delete();

        return $this->persist($userId, $data);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function buildPrompt(Cv $cv): string
    {
        $skills   = $cv->skills->map(fn($s) =>
            $s->skill_name . ($s->proficiency_level ? " ({$s->proficiency_level})" : '')
        )->implode(', ');

        $jobTitle = $cv->experiences->first()?->job_title ?? 'Software Professional';
        $name     = $cv->full_name ?? 'the candidate';

        return <<<PROMPT
You are a professional technical quiz generator.

Generate exactly 10 multiple-choice questions for a skills assessment.

CANDIDATE PROFILE
- Name: {$name}
- Role: {$jobTitle}
- Skills: {$skills}

RULES
1. Exactly 10 questions.
2. Each question has exactly 4 answer options.
3. Exactly ONE option per question has "is_correct": true.
4. Mix difficulty: 3 beginner, 4 intermediate, 3 advanced.
5. Questions should be practical and scenario-based.
6. Focus on the 2–3 most prominent skills.

Return ONLY a JSON object — no markdown, no extra text:
{
  "title": "e.g. PHP & Laravel Skills Assessment",
  "description": "One sentence describing the assessment.",
  "skill_name": "the primary skill",
  "category": "backend|frontend|database|general",
  "questions": [
    {
      "question": "Question text here",
      "explanation": "Why the correct answer is right",
      "options": [
        {"text": "Option A", "is_correct": false},
        {"text": "Option B", "is_correct": true},
        {"text": "Option C", "is_correct": false},
        {"text": "Option D", "is_correct": false}
      ]
    }
  ]
}
PROMPT;
    }

    private function callLlm(string $prompt): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type'  => 'application/json',
            ])->timeout(60)->post($this->apiUrl, [
                'model'           => $this->model,
                'messages'        => [
                    ['role' => 'system', 'content' => 'You are a professional quiz generator. Return only valid JSON, no markdown.'],
                    ['role' => 'user',   'content' => $prompt],
                ],
                'temperature'     => 0.7,
                'max_tokens'      => 3500,
                'response_format' => ['type' => 'json_object'],
            ]);

            if (!$response->successful()) {
                Log::error('AiQuizService: LLM API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            $content = $response->json('choices.0.message.content');
            $decoded = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('AiQuizService: LLM returned invalid JSON');
                return null;
            }

            return $decoded;

        } catch (\Exception $e) {
            Log::error('AiQuizService: HTTP call failed — ' . $e->getMessage());
            return null;
        }
    }

    private function persist(int $userId, array $data): ?Assessment
    {
        $questions = $data['questions'] ?? [];

        if (count($questions) < 5) {
            Log::warning('AiQuizService: Generated quiz has fewer than 5 questions, discarding.');
            return null;
        }

        $assessment = Assessment::create([
            'user_id'            => $userId,
            'title'              => $data['title']       ?? 'Personalized Skills Assessment',
            'description'        => $data['description'] ?? null,
            'skill_name'         => $data['skill_name']  ?? 'General',
            'category'           => $data['category']    ?? 'general',
            'difficulty'         => 'intermediate',
            'time_limit_minutes' => 15,
            'pass_score'         => 70,
            'is_active'          => false,
            'is_ai_generated'    => true,
            'approval_status'    => 'pending',
        ]);

        foreach (array_slice($questions, 0, 10) as $sortOrder => $q) {
            $question = $assessment->questions()->create([
                'question'    => $q['question']    ?? '',
                'explanation' => $q['explanation'] ?? null,
                'sort_order'  => $sortOrder,
            ]);

            foreach (($q['options'] ?? []) as $optOrder => $opt) {
                $question->options()->create([
                    'option_text' => $opt['text']       ?? '',
                    'is_correct'  => (bool) ($opt['is_correct'] ?? false),
                    'sort_order'  => $optOrder,
                ]);
            }
        }

        return $assessment->loadCount('questions');
    }
}
