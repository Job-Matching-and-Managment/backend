<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vacancy>
 */
class VacancyFactory extends Factory
{
    protected $model = Vacancy::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $salaryMin = fake()->numberBetween(5000, 15000);

        return [
            'user_id' => User::factory(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraph(),
            'requirements' => fake()->sentence(),
            'location' => fake()->randomElement(['Addis Ababa', 'Remote', 'Hybrid']),
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMin + fake()->numberBetween(2000, 10000),
            'employment_type' => fake()->randomElement([
                'full_time',
                'part_time',
                'contract',
                'temporary',
                'internship',
            ]),
            'status' => 'open',
            'work_type' => fake()->randomElement(['remote', 'on_site', 'hybrid']),
            'application_deadline' => now()->addDays(30),
            'moderation_status' => 'approved',
            'is_archived' => false,
            'is_flagged_suspicious' => false,
        ];
    }
}
