<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'body',
        'audience',
        'is_visible',
        'created_by',
        'published_at',
        'recipients_count',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function notifications(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
