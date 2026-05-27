<?php

use App\Models\Assessment;
use App\Models\Cv;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

function createAiQuizForUser(User $user, array $overrides = []): Assessment
{
    $assessment = Assessment::create(array_merge([
        'user_id' => $user->id,
        'title' => 'PHP Skills Quiz',
        'description' => 'Generated assessment',
        'skill_name' => 'PHP',
        'category' => 'backend',
        'difficulty' => 'intermediate',
        'time_limit_minutes' => 15,
        'pass_score' => 70,
        'is_active' => false,
        'is_ai_generated' => true,
        'approval_status' => 'pending',
    ], $overrides));

    $question = QuizQuestion::create([
        'assessment_id' => $assessment->id,
        'question' => 'What is PHP?',
        'sort_order' => 0,
    ]);

    QuizOption::create([
        'question_id' => $question->id,
        'option_text' => 'A programming language',
        'is_correct' => true,
        'sort_order' => 0,
    ]);

    return $assessment->load('questions.options');
}

test('admin can list AI quiz content for approval', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create();
    $seeker->assignRole('job_seeker');
    createAiQuizForUser($seeker);

    $this->actingAs($admin)
        ->get(route('admin.content-approval.index', ['type' => 'quizzes']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/content-approval/index')
            ->where('type', 'quizzes')
            ->has('items')
            ->has('stats'));
});

test('admin can approve an AI quiz', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create();
    $seeker->assignRole('job_seeker');
    $quiz = createAiQuizForUser($seeker);

    $this->actingAs($admin)
        ->patch(route('admin.content-approval.quiz.update', $quiz), [
            'approval_status' => 'approved',
            'content_moderation_notes' => 'Questions look accurate.',
        ])
        ->assertRedirect();

    $fresh = $quiz->fresh();
    expect($fresh->approval_status)->toBe('approved');
    expect($fresh->is_active)->toBeTrue();
    expect($fresh->content_moderated_by)->toBe($admin->id);
});

test('admin can review CV summary content', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create();
    $seeker->assignRole('job_seeker');

    $cv = Cv::create([
        'user_id' => $seeker->id,
        'title' => 'Main CV',
        'summary' => 'Experienced developer with a focus on Laravel.',
        'summary_approval_status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.content-approval.summary.show', $cv))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/content-approval/summary-show')
            ->where('cv.id', $cv->id));

    $this->actingAs($admin)
        ->patch(route('admin.content-approval.summary.update', $cv), [
            'summary_approval_status' => 'approved',
            'summary_moderation_notes' => 'Appropriate professional tone.',
        ])
        ->assertRedirect();

    expect($cv->fresh()->summary_approval_status)->toBe('approved');
});

test('non-admin cannot access content approval routes', function () {
    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $this->actingAs($employer)
        ->get(route('admin.content-approval.index'))
        ->assertForbidden();
});

test('job seeker cannot take unapproved AI quiz', function () {
    $seeker = User::factory()->create();
    $seeker->assignRole('job_seeker');
    $quiz = createAiQuizForUser($seeker);

    $this->actingAs($seeker)
        ->get(route('quiz.show', $quiz))
        ->assertNotFound();
});
