<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vacancy extends Model
{
    /** @use HasFactory<\Database\Factories\VacancyFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'requirements',
        'location',
        'salary_min',
        'salary_max',
        'employment_type',
        'status',
        'work_type',
        'application_deadline',
        'moderation_status',
        'is_archived',
        'is_flagged_suspicious',
        'moderation_notes',
        'moderated_at',
        'moderated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_archived' => 'boolean',
            'is_flagged_suspicious' => 'boolean',
            'moderated_at' => 'datetime',
            'application_deadline' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
