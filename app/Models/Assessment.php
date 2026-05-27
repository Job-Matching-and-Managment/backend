<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'skill_name',
        'category',
        'difficulty',
        'time_limit_minutes',
        'pass_score',
        'is_active',
        'is_ai_generated',
        'approval_status',
        'content_moderation_notes',
        'content_moderated_at',
        'content_moderated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_ai_generated' => 'boolean',
        'content_moderated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order');
    }

    public function results()
    {
        return $this->hasMany(AssessmentResult::class);
    }
}
