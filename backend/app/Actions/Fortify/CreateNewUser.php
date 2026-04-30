<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Illuminate\Validation\Rule;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),

            'password' => $this->passwordRules(),

            // ✅ Role validation
            'role' => ['required', 'string', Rule::in(['admin', 'employer', 'job_seeker'])],

            // ✅ Job seeker fields (optional at registration)
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'experience_years' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],

            // ✅ Employer fields (optional at registration)
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_description' => ['nullable', 'string'],
            'company_website' => ['nullable', 'url'],
        ])->validate();

        // ✅ Create user
        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => bcrypt($input['password']),

            // Job seeker fields
            'headline' => $input['headline'] ?? null,
            'bio' => $input['bio'] ?? null,
            'experience_years' => $input['experience_years'] ?? null,
            'location' => $input['location'] ?? null,

            // Employer fields
            'company_name' => $input['company_name'] ?? null,
            'company_description' => $input['company_description'] ?? null,
            'company_website' => $input['company_website'] ?? null,
        ]);

        // ✅ Assign role (Spatie)
        $user->assignRole($input['role']);

        return $user;
    }
}