<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $audience = $request->string('audience')->toString();
        $visibility = $request->string('visibility')->toString();

        $announcements = Announcement::query()
            ->with('creator:id,name,email')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('body', 'like', "%{$search}%");
                });
            })
            ->when($audience !== '', fn ($query) => $query->where('audience', $audience))
            ->when($visibility === 'visible', fn ($query) => $query->where('is_visible', true))
            ->when($visibility === 'hidden', fn ($query) => $query->where('is_visible', false))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Announcement $announcement) => $this->summary($announcement));

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements,
            'filters' => [
                'search' => $search,
                'audience' => $audience,
                'visibility' => $visibility,
            ],
            'audienceOptions' => ['all', 'employer', 'job_seeker'],
            'stats' => [
                'visible' => Announcement::where('is_visible', true)->count(),
                'hidden' => Announcement::where('is_visible', false)->count(),
                'sent_today' => Announcement::whereDate('created_at', now()->toDateString())->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:4000'],
            'audience' => ['required', Rule::in(['all', 'employer', 'job_seeker'])],
        ]);

        $recipients = User::query()
            ->when($validated['audience'] !== 'all', fn ($query) => $query->role($validated['audience']))
            ->pluck('id');

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'audience' => $validated['audience'],
            'is_visible' => true,
            'created_by' => Auth::id(),
            'published_at' => now(),
            'recipients_count' => $recipients->count(),
        ]);

        if ($recipients->isNotEmpty()) {
            $rows = $recipients->map(fn ($userId) => [
                'user_id' => $userId,
                'announcement_id' => $announcement->id,
                'type' => 'admin_announcement',
                'title' => $announcement->title,
                'body' => $announcement->body,
                'data' => json_encode([
                    'announcement_id' => $announcement->id,
                    'audience' => $announcement->audience,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            AppNotification::insert($rows);
        }

        return back()->with('success', 'Announcement published.');
    }

    public function toggleVisibility(Announcement $announcement): RedirectResponse
    {
        $announcement->update([
            'is_visible' => ! $announcement->is_visible,
        ]);

        return back()->with('success', 'Announcement visibility updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(Announcement $announcement): array
    {
        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'body' => $announcement->body,
            'audience' => $announcement->audience,
            'is_visible' => (bool) $announcement->is_visible,
            'published_at' => $announcement->published_at?->toIso8601String(),
            'recipients_count' => $announcement->recipients_count,
            'creator_name' => $announcement->creator?->name,
        ];
    }
}
