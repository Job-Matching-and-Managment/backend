<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Inertia page — paginated notifications for the authenticated user.
     */
    public function index(): Response
    {
        $notifications = AppNotification::where('user_id', auth()->id())
            ->where(function ($query) {
                $query->whereNull('announcement_id')
                    ->orWhereHas('announcement', fn ($announcement) => $announcement->where('is_visible', true));
            })
            ->latest()
            ->paginate(15);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * JSON endpoint — latest 20 notifications + unread count.
     */
    public function apiIndex(): JsonResponse
    {
        $user = auth()->user();

        $notifications = AppNotification::where('user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('announcement_id')
                    ->orWhereHas('announcement', fn ($announcement) => $announcement->where('is_visible', true));
            })
            ->latest()
            ->limit(20)
            ->get();

        $unreadCount = AppNotification::where('user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('announcement_id')
                    ->orWhereHas('announcement', fn ($announcement) => $announcement->where('is_visible', true));
            })
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    /**
     * PATCH — mark a single notification as read.
     * Returns JSON for fetch() callers (bell), redirect for Inertia router callers (notifications page).
     */
    public function markRead(Request $request, AppNotification $notification)
    {
        abort_if($notification->user_id !== auth()->id(), 403);

        $notification->markAsRead();

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    /**
     * POST — mark all unread notifications for the auth user as read.
     */
    public function markAllRead(Request $request)
    {
        AppNotification::where('user_id', auth()->id())
            ->unread()
            ->update(['read_at' => now()]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    /**
     * DELETE — remove a notification (owner only).
     */
    public function destroy(Request $request, AppNotification $notification)
    {
        abort_if($notification->user_id !== auth()->id(), 403);

        $notification->delete();

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }
}
