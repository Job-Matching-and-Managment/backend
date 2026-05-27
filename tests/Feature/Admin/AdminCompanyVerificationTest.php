<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

test('admin can list company verification requests', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory()->create()->assignRole('employer');

    $this->actingAs($admin)
        ->get(route('admin.company-verifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/company-verifications/index')
            ->has('companies'));
});

test('admin can view a company verification request', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create();
    $employer->assignRole('employer');

    $this->actingAs($admin)
        ->get(route('admin.company-verifications.show', $employer))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/company-verifications/show')
            ->where('company.id', $employer->id));
});

test('admin can approve company verification', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $employer = User::factory()->create([
        'company_verification_status' => 'pending',
        'business_license_status' => 'pending',
    ]);
    $employer->assignRole('employer');

    $this->actingAs($admin)
        ->patch(route('admin.company-verifications.update', $employer), [
            'company_verification_status' => 'approved',
            'business_license_status' => 'approved',
            'kyc_verified' => true,
            'tin_verified' => true,
            'company_info_verified' => true,
            'company_verification_notes' => 'All documents verified.',
            'company_tin_number' => 'TIN-123456',
            'company_phone' => '+251900000000',
            'company_contact_email' => 'company@example.com',
        ])
        ->assertRedirect();

    $fresh = $employer->fresh();
    expect($fresh->company_verification_status)->toBe('approved');
    expect($fresh->business_license_status)->toBe('approved');
    expect((bool) $fresh->kyc_verified)->toBeTrue();
    expect((bool) $fresh->tin_verified)->toBeTrue();
    expect((bool) $fresh->company_info_verified)->toBeTrue();
});

test('non-admin cannot access company verification routes', function () {
    $jobSeeker = User::factory()->create();
    $jobSeeker->assignRole('job_seeker');

    $this->actingAs($jobSeeker)
        ->get(route('admin.company-verifications.index'))
        ->assertForbidden();
});
