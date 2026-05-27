<?php

use App\Models\Application;
use App\Models\Cv;
use App\Models\User;
use App\Models\Vacancy;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

test('admin can access reports and analytics page', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create();
    $employer->assignRole('employer');
    $jobSeeker = User::factory()->create();
    $jobSeeker->assignRole('job_seeker');

    $vacancy = Vacancy::factory()->create(['user_id' => $employer->id]);
    $cv = Cv::create(['user_id' => $jobSeeker->id, 'title' => 'Main CV']);
    Application::create([
        'vacancy_id' => $vacancy->id,
        'cv_id' => $cv->id,
        'user_id' => $jobSeeker->id,
        'status' => 'applied',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.reports.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->has('highlights')
            ->has('series')
            ->has('breakdowns')
            ->has('tables'));
});

test('non-admin cannot access reports and analytics page', function () {
    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $this->actingAs($employer)
        ->get(route('admin.reports.index'))
        ->assertForbidden();
});

