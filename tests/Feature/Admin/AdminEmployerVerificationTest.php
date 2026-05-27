<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

test('admin can list employer verification requests', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory()->create()->assignRole('employer');

    $this->actingAs($admin)
        ->get(route('admin.employer-verifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/employer-verifications/index')
            ->has('employers'));
});

test('admin can view an employer verification request', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $this->actingAs($admin)
        ->get(route('admin.employer-verifications.show', $employer))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/employer-verifications/show')
            ->where('employer.id', $employer->id));
});

test('admin can approve an employer verification request', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create([
        'employer_verification_status' => 'pending',
    ]);
    $employer->assignRole('employer');

    $this->actingAs($admin)
        ->patch(route('admin.employer-verifications.update', $employer), [
            'verification_status' => 'approved',
            'verification_notes' => 'Company details validated.',
        ])
        ->assertRedirect();

    $fresh = $employer->fresh();
    expect($fresh->employer_verification_status)->toBe('approved');
    expect($fresh->employer_verified_by)->toBe($admin->id);
    expect($fresh->employer_verified_at)->not->toBeNull();
});

test('non-admin cannot access employer verification routes', function () {
    $jobSeeker = User::factory()->create();
    $jobSeeker->assignRole('job_seeker');

    $this->actingAs($jobSeeker)
        ->get(route('admin.employer-verifications.index'))
        ->assertForbidden();
});
