<?php

use App\Models\Announcement;
use App\Models\Assessment;
use App\Models\Cv;
use App\Models\User;
use App\Models\Vacancy;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

function createAdminFixtures(User $admin): array
{
    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $jobSeeker = User::factory()->create();
    $jobSeeker->assignRole('job_seeker');

    $vacancy = Vacancy::factory()->create(['user_id' => $employer->id]);

    $cv = Cv::create([
        'user_id' => $jobSeeker->id,
        'title' => 'Main CV',
        'summary' => 'Experienced software engineer.',
    ]);

    $assessment = Assessment::create([
        'user_id' => $jobSeeker->id,
        'title' => 'AI Quiz',
        'description' => 'Generated quiz',
        'skill_name' => 'Laravel',
        'category' => 'backend',
        'difficulty' => 'intermediate',
        'time_limit_minutes' => 15,
        'pass_score' => 70,
        'is_active' => false,
        'is_ai_generated' => true,
        'approval_status' => 'pending',
    ]);

    $announcement = Announcement::create([
        'title' => 'System notice',
        'body' => 'General update.',
        'audience' => 'all',
        'is_visible' => true,
        'created_by' => $admin->id,
        'published_at' => now(),
        'recipients_count' => 0,
    ]);

    return compact('employer', 'jobSeeker', 'vacancy', 'cv', 'assessment', 'announcement');
}

test('non-admin users are forbidden from protected admin endpoints', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $fixtures = createAdminFixtures($admin);

    $nonAdmin = User::factory()->create();
    $nonAdmin->assignRole('employer');

    $requests = [
        ['get', route('admin.dashboard')],
        ['get', route('admin.users.index')],
        ['get', route('admin.users.show', $fixtures['jobSeeker'])],
        ['patch', route('admin.users.status', $fixtures['jobSeeker']), ['account_status' => 'suspended']],
        ['get', route('admin.employer-verifications.index')],
        ['get', route('admin.company-verifications.index')],
        ['get', route('admin.job-moderation.index')],
        ['get', route('admin.suspicious-users.index')],
        ['get', route('admin.content-approval.index')],
        ['get', route('admin.announcements.index')],
        ['post', route('admin.announcements.store'), [
            'title' => 'Blocked action',
            'body' => 'Should be forbidden',
            'audience' => 'all',
        ]],
        ['get', route('admin.reports.index')],
    ];

    foreach ($requests as $request) {
        $method = $request[0];
        $url = $request[1];
        $payload = $request[2] ?? [];

        $response = $this->actingAs($nonAdmin)->{$method}($url, $payload);
        $response->assertForbidden();
    }
});

test('admin can access all admin index pages', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    createAdminFixtures($admin);

    $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($admin)->get(route('admin.users.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.employer-verifications.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.company-verifications.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.job-moderation.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.suspicious-users.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.content-approval.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.announcements.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.reports.index'))->assertOk();
});

