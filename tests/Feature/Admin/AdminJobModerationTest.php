<?php

use App\Models\User;
use App\Models\Vacancy;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

function createVacancyForEmployer(User $employer, array $overrides = []): Vacancy
{
    $employer->assignRole('employer');

    return Vacancy::factory()->create(array_merge(['user_id' => $employer->id], $overrides));
}

test('admin can list job posts for moderation', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create();
    createVacancyForEmployer($employer);

    $this->actingAs($admin)
        ->get(route('admin.job-moderation.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/job-moderation/index')
            ->has('jobs')
            ->has('stats'));
});

test('admin can view a job moderation detail page', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create();
    $vacancy = createVacancyForEmployer($employer, ['moderation_status' => 'pending']);

    $this->actingAs($admin)
        ->get(route('admin.job-moderation.show', $vacancy))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/job-moderation/show')
            ->where('job.id', $vacancy->id));
});

test('admin can approve and archive a job post', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create();
    $vacancy = createVacancyForEmployer($employer, [
        'moderation_status' => 'pending',
        'status' => 'open',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.job-moderation.update', $vacancy), [
            'moderation_status' => 'approved',
            'is_archived' => true,
            'is_flagged_suspicious' => false,
            'moderation_notes' => 'Duplicate listing removed.',
        ])
        ->assertRedirect();

    $fresh = $vacancy->fresh();
    expect($fresh->moderation_status)->toBe('approved');
    expect($fresh->is_archived)->toBeTrue();
    expect($fresh->status)->toBe('closed');
    expect($fresh->moderated_by)->toBe($admin->id);
    expect($fresh->moderated_at)->not->toBeNull();
});

test('admin can reject and flag a suspicious job post', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create();
    $vacancy = createVacancyForEmployer($employer);

    $this->actingAs($admin)
        ->patch(route('admin.job-moderation.update', $vacancy), [
            'moderation_status' => 'rejected',
            'is_archived' => false,
            'is_flagged_suspicious' => true,
            'moderation_notes' => 'Misleading salary information.',
        ])
        ->assertRedirect();

    $fresh = $vacancy->fresh();
    expect($fresh->moderation_status)->toBe('rejected');
    expect($fresh->is_flagged_suspicious)->toBeTrue();
});

test('non-admin cannot access job moderation routes', function () {
    $jobSeeker = User::factory()->create();
    $jobSeeker->assignRole('job_seeker');

    $employer = User::factory()->create();
    $vacancy = createVacancyForEmployer($employer);

    $this->actingAs($jobSeeker)
        ->get(route('admin.job-moderation.index'))
        ->assertForbidden();

    $this->actingAs($jobSeeker)
        ->get(route('admin.job-moderation.show', $vacancy))
        ->assertForbidden();
});
