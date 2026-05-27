<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cv extends Model
{
    protected $fillable = [
        'user_id', 'title', 'is_default',
        'full_name', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'summary',
        'summary_approval_status', 'summary_moderation_notes', 'summary_moderated_at', 'summary_moderated_by',
        'template', 'accent_color', 'section_order',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'section_order' => 'array',
        'summary_moderated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(CvExperience::class)->orderBy('sort_order');
    }

    public function educations(): HasMany
    {
        return $this->hasMany(CvEducation::class)->orderBy('sort_order');
    }

    public function skills(): HasMany
    {
        return $this->hasMany(CvSkill::class)->orderBy('sort_order');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(CvProject::class)->orderBy('sort_order');
    }
}