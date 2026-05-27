<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'employer', 'job_seeker'] as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
});

test('admin can list users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory()->create()->assignRole('employer');

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/index')->has('users'));
});

test('admin can view a user profile', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $target = User::factory()->create();
    $target->assignRole('job_seeker');

    $this->actingAs($admin)
        ->get(route('admin.users.show', $target))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/show')
            ->where('user.id', $target->id));
});

test('admin can suspend a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $target = User::factory()->create(['account_status' => 'active']);
    $target->assignRole('employer');

    $this->actingAs($admin)
        ->patch(route('admin.users.status', $target), [
            'account_status' => 'suspended',
        ])
        ->assertRedirect();

    expect($target->fresh()->account_status)->toBe('suspended');
});

test('admin cannot modify their own account status', function () {
    $admin = User::factory()->create(['account_status' => 'active']);
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->patch(route('admin.users.status', $admin), [
            'account_status' => 'blocked',
        ])
        ->assertForbidden();
});

test('admin cannot delete admin users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $otherAdmin = User::factory()->create();
    $otherAdmin->assignRole('admin');

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $otherAdmin))
        ->assertRedirect()
        ->assertSessionHasErrors('user');

    expect(User::find($otherAdmin->id))->not->toBeNull();
});
