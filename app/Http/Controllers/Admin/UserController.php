<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Cv;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $role = $request->string('role')->toString();
        $status = $request->string('status')->toString();

        $users = User::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '', fn ($query) => $query->role($role))
            ->when($status !== '', fn ($query) => $query->where('account_status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => $this->userSummary($user));

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
            'roleOptions' => ['employer', 'job_seeker', 'admin'],
            'statusOptions' => ['active', 'suspended', 'blocked'],
        ]);
    }

    public function show(User $user): Response
    {
        return Inertia::render('admin/users/show', [
            'user' => $this->userDetail($user),
            'activity' => $this->userActivity($user),
        ]);
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'account_status' => ['required', Rule::in(['active', 'suspended', 'blocked'])],
        ]);

        $this->guardTargetUser($user);

        $user->forceFill([
            'account_status' => $validated['account_status'],
            'status_changed_at' => now(),
        ])->save();

        return back()->with('success', 'User status updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->guardTargetUser($user);

        if ($user->hasRole('admin')) {
            return back()->withErrors(['user' => 'Admin accounts cannot be deleted.']);
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User account deleted.');
    }

    private function guardTargetUser(User $user): void
    {
        if ($user->id === Auth::id()) {
            abort(403, 'You cannot modify your own account from this screen.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function userSummary(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames(),
            'account_status' => $user->account_status ?? 'active',
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'company_name' => $user->company_name,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userDetail(User $user): array
    {
        return [
            ...$this->userSummary($user),
            'headline' => $user->headline,
            'bio' => $user->bio,
            'location' => $user->location,
            'experience_years' => $user->experience_years,
            'company_description' => $user->company_description,
            'company_website' => $user->company_website,
            'status_changed_at' => $user->status_changed_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userActivity(User $user): array
    {
        $recentApplications = Application::query()
            ->where('user_id', $user->id)
            ->with('vacancy:id,title')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'status' => $application->status,
                'job_title' => $application->vacancy?->title,
                'created_at' => $application->created_at?->toIso8601String(),
            ]);

        $recentJobs = Vacancy::query()
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'status', 'created_at'])
            ->map(fn (Vacancy $vacancy) => [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'status' => $vacancy->status,
                'created_at' => $vacancy->created_at?->toIso8601String(),
            ]);

        return [
            'counts' => [
                'applications' => Application::where('user_id', $user->id)->count(),
                'jobs_posted' => Vacancy::where('user_id', $user->id)->count(),
                'cvs' => Cv::where('user_id', $user->id)->count(),
            ],
            'recent_applications' => $recentApplications,
            'recent_jobs' => $recentJobs,
        ];
    }
}
