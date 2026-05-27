<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'notifications';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'announcement_id',
        'type',
        'title',
        'body',
        'data',
        'read_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Scope a query to only include unread notifications.
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Determine whether the notification has been read.
     */
    public function isRead(): bool
    {
        return ! is_null($this->read_at);
    }

    /**
     * Mark the notification as read by setting read_at to now.
     */
    public function markAsRead(): bool
    {
        return $this->update(['read_at' => now()]);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }
}
