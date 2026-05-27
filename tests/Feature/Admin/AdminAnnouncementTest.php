<?php

use App\Models\Announcement;
use App\Models\AppNotification;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

test('admin can list announcements', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Announcement::create([
        'title' => 'Maintenance Window',
        'body' => 'The platform will be unavailable tonight.',
        'audience' => 'all',
        'is_visible' => true,
        'created_by' => $admin->id,
        'published_at' => now(),
        'recipients_count' => 0,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/announcements/index')
            ->has('announcements')
            ->has('stats'));
});

test('admin can publish announcement to job seekers only', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $jobSeeker = User::factory()->create();
    $jobSeeker->assignRole('job_seeker');
    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $this->actingAs($admin)
        ->post(route('admin.announcements.store'), [
            'title' => 'Quiz feature update',
            'body' => 'New quiz modules are now available.',
            'audience' => 'job_seeker',
        ])
        ->assertRedirect();

    $announcement = Announcement::latest()->first();
    expect($announcement)->not->toBeNull();
    expect($announcement->audience)->toBe('job_seeker');
    expect($announcement->recipients_count)->toBe(1);

    expect(AppNotification::where('announcement_id', $announcement->id)->count())->toBe(1);
    expect(AppNotification::where('announcement_id', $announcement->id)->first()->user_id)->toBe($jobSeeker->id);
});

test('admin can toggle announcement visibility', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $announcement = Announcement::create([
        'title' => 'Policy Reminder',
        'body' => 'Please review platform guidelines.',
        'audience' => 'all',
        'is_visible' => true,
        'created_by' => $admin->id,
        'published_at' => now(),
        'recipients_count' => 0,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.announcements.visibility', $announcement))
        ->assertRedirect();

    expect($announcement->fresh()->is_visible)->toBeFalse();
});

test('non-admin cannot access announcements routes', function () {
    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $this->actingAs($employer)
        ->get(route('admin.announcements.index'))
        ->assertForbidden();
});

