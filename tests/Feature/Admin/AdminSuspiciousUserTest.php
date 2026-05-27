<?php

use App\Models\Cv;
use App\Models\User;
use App\Models\Vacancy;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

test('admin can list suspicious user monitoring', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create(['is_flagged_suspicious' => true]);
    $seeker->assignRole('job_seeker');

    $this->actingAs($admin)
        ->get(route('admin.suspicious-users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/suspicious-users/index')
            ->has('users')
            ->has('stats'));
});

test('admin can view suspicious user detail with signals', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create([
        'is_flagged_suspicious' => true,
        'account_status' => 'suspended',
    ]);
    $seeker->assignRole('job_seeker');

    $this->actingAs($admin)
        ->get(route('admin.suspicious-users.show', $seeker))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/suspicious-users/show')
            ->where('user.id', $seeker->id)
            ->has('signals')
            ->has('risk_level'));
});

test('admin can flag and block a suspicious user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create();
    $seeker->assignRole('job_seeker');

    $this->actingAs($admin)
        ->patch(route('admin.suspicious-users.update', $seeker), [
            'is_flagged_suspicious' => true,
            'security_notes' => 'Spam applications reported.',
            'account_status' => 'blocked',
        ])
        ->assertRedirect();

    $fresh = $seeker->fresh();
    expect($fresh->is_flagged_suspicious)->toBeTrue();
    expect($fresh->account_status)->toBe('blocked');
    expect($fresh->security_notes)->toBe('Spam applications reported.');
    expect($fresh->security_flagged_by)->toBe($admin->id);
});

test('detected view includes manually flagged users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create(['is_flagged_suspicious' => true]);
    $seeker->assignRole('job_seeker');

    User::factory()->create()->assignRole('job_seeker');

    $this->actingAs($admin)
        ->get(route('admin.suspicious-users.index', ['view' => 'detected']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/suspicious-users/index')
            ->where('filters.view', 'detected')
            ->where('users.data.0.id', $seeker->id));
});

test('burst applications raise risk signals on show page', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $seeker = User::factory()->create(['created_at' => now()->subDays(2)]);
    $seeker->assignRole('job_seeker');

    $cv = Cv::create([
        'user_id' => $seeker->id,
        'title' => 'Primary CV',
    ]);

    foreach (range(1, 11) as $i) {
        $vacancy = Vacancy::factory()->create();
        \App\Models\Application::create([
            'user_id' => $seeker->id,
            'vacancy_id' => $vacancy->id,
            'cv_id' => $cv->id,
            'status' => 'pending',
        ]);
    }

    $this->actingAs($admin)
        ->get(route('admin.suspicious-users.show', $seeker))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('risk_level', 'high')
            ->where('signals', fn ($signals) => collect($signals)
                ->contains('id', 'burst_applications')));
});

test('non-admin cannot access suspicious user routes', function () {
    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $target = User::factory()->create();
    $target->assignRole('job_seeker');

    $this->actingAs($employer)
        ->get(route('admin.suspicious-users.index'))
        ->assertForbidden();

    $this->actingAs($employer)
        ->get(route('admin.suspicious-users.show', $target))
        ->assertForbidden();
});
