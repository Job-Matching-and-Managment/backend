<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Cv;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->string('type')->toString() ?: 'quizzes';
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        return match ($type) {
            'summaries' => $this->summariesIndex($search, $status),
            'platform' => $this->platformIndex($search, $status),
            default => $this->quizzesIndex($search, $status),
        };
    }

    public function showQuiz(Assessment $assessment): Response
    {
        if (! $assessment->is_ai_generated && $assessment->user_id !== null) {
            abort(404);
        }

        $assessment->load([
            'user:id,name,email',
            'questions.options',
        ]);

        return Inertia::render('admin/content-approval/quiz-show', [
            'quiz' => $this->quizDetails($assessment),
            'contentType' => $assessment->is_ai_generated ? 'ai_quiz' : 'platform_quiz',
        ]);
    }

    public function updateQuiz(Request $request, Assessment $assessment): RedirectResponse
    {
        if (! $assessment->is_ai_generated && $assessment->user_id !== null) {
            abort(404);
        }

        $validated = $request->validate([
            'approval_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'content_moderation_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $approved = $validated['approval_status'] === 'approved';

        $assessment->forceFill([
            'approval_status' => $validated['approval_status'],
            'content_moderation_notes' => $validated['content_moderation_notes'] ?? null,
            'content_moderated_at' => now(),
            'content_moderated_by' => Auth::id(),
            'is_active' => $approved,
        ])->save();

        return back()->with('success', 'Quiz content review saved.');
    }

    public function showSummary(Cv $cv): Response
    {
        if (blank($cv->summary)) {
            abort(404);
        }

        $cv->load('user:id,name,email');

        return Inertia::render('admin/content-approval/summary-show', [
            'cv' => $this->summaryDetails($cv),
        ]);
    }

    public function updateSummary(Request $request, Cv $cv): RedirectResponse
    {
        if (blank($cv->summary)) {
            abort(404);
        }

        $validated = $request->validate([
            'summary_approval_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'summary_moderation_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $cv->forceFill([
            'summary_approval_status' => $validated['summary_approval_status'],
            'summary_moderation_notes' => $validated['summary_moderation_notes'] ?? null,
            'summary_moderated_at' => now(),
            'summary_moderated_by' => Auth::id(),
        ])->save();

        return back()->with('success', 'CV summary review saved.');
    }

    private function quizzesIndex(string $search, string $status): Response
    {
        $quizzes = Assessment::query()
            ->where('is_ai_generated', true)
            ->whereNotNull('user_id')
            ->with('user:id,name,email')
            ->withCount('questions')
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('skill_name', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('approval_status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Assessment $assessment) => $this->quizSummary($assessment));

        return Inertia::render('admin/content-approval/index', [
            'type' => 'quizzes',
            'items' => $quizzes,
            'filters' => ['search' => $search, 'status' => $status],
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => $this->quizStats(true),
        ]);
    }

    private function platformIndex(string $search, string $status): Response
    {
        $quizzes = Assessment::query()
            ->whereNull('user_id')
            ->where('is_ai_generated', false)
            ->withCount('questions')
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('skill_name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('approval_status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Assessment $assessment) => $this->quizSummary($assessment));

        return Inertia::render('admin/content-approval/index', [
            'type' => 'platform',
            'items' => $quizzes,
            'filters' => ['search' => $search, 'status' => $status],
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => $this->quizStats(false),
        ]);
    }

    private function summariesIndex(string $search, string $status): Response
    {
        $summaries = Cv::query()
            ->whereNotNull('summary')
            ->where('summary', '!=', '')
            ->with('user:id,name,email')
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('summary_approval_status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Cv $cv) => $this->summarySummary($cv));

        return Inertia::render('admin/content-approval/index', [
            'type' => 'summaries',
            'items' => $summaries,
            'filters' => ['search' => $search, 'status' => $status],
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => [
                'pending' => Cv::whereNotNull('summary')->where('summary', '!=', '')
                    ->where('summary_approval_status', 'pending')->count(),
                'approved' => Cv::whereNotNull('summary')->where('summary', '!=', '')
                    ->where('summary_approval_status', 'approved')->count(),
                'rejected' => Cv::whereNotNull('summary')->where('summary', '!=', '')
                    ->where('summary_approval_status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function quizStats(bool $aiOnly): array
    {
        $query = Assessment::query();

        if ($aiOnly) {
            $query->where('is_ai_generated', true)->whereNotNull('user_id');
        } else {
            $query->whereNull('user_id')->where('is_ai_generated', false);
        }

        return [
            'pending' => (clone $query)->where('approval_status', 'pending')->count(),
            'approved' => (clone $query)->where('approval_status', 'approved')->count(),
            'rejected' => (clone $query)->where('approval_status', 'rejected')->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function quizSummary(Assessment $assessment): array
    {
        return [
            'id' => $assessment->id,
            'title' => $assessment->title,
            'skill_name' => $assessment->skill_name,
            'category' => $assessment->category,
            'difficulty' => $assessment->difficulty,
            'approval_status' => $assessment->approval_status ?? 'approved',
            'is_ai_generated' => (bool) $assessment->is_ai_generated,
            'questions_count' => $assessment->questions_count ?? 0,
            'owner_name' => $assessment->user?->name,
            'owner_email' => $assessment->user?->email,
            'created_at' => $assessment->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function quizDetails(Assessment $assessment): array
    {
        return [
            ...$this->quizSummary($assessment),
            'description' => $assessment->description,
            'content_moderation_notes' => $assessment->content_moderation_notes,
            'content_moderated_at' => $assessment->content_moderated_at?->toIso8601String(),
            'questions' => $assessment->questions->map(fn ($question) => [
                'id' => $question->id,
                'question' => $question->question,
                'explanation' => $question->explanation,
                'options' => $question->options->map(fn ($option) => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                    'is_correct' => (bool) $option->is_correct,
                ])->values()->all(),
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function summarySummary(Cv $cv): array
    {
        return [
            'id' => $cv->id,
            'title' => $cv->title,
            'full_name' => $cv->full_name,
            'summary_preview' => str($cv->summary)->limit(120)->toString(),
            'summary_approval_status' => $cv->summary_approval_status ?? 'approved',
            'owner_name' => $cv->user?->name,
            'owner_email' => $cv->user?->email,
            'updated_at' => $cv->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function summaryDetails(Cv $cv): array
    {
        return [
            ...$this->summarySummary($cv),
            'summary' => $cv->summary,
            'summary_moderation_notes' => $cv->summary_moderation_notes,
            'summary_moderated_at' => $cv->summary_moderated_at?->toIso8601String(),
        ];
    }
}
