<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Cv;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SuspiciousUserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $role = $request->string('role')->toString();
        $view = $request->string('view')->toString();

        $users = User::query()
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'admin'))
            ->withCount([
                'applications',
                'vacancies',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '', fn (Builder $query) => $query->role($role))
            ->when($view === 'flagged', fn (Builder $query) => $query->where('is_flagged_suspicious', true))
            ->when($view === 'detected', fn (Builder $query) => $this->applyDetectedScope($query))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => $this->userSummary($user));

        return Inertia::render('admin/suspicious-users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'view' => $view !== '' ? $view : 'all',
            ],
            'roleOptions' => ['employer', 'job_seeker'],
            'viewOptions' => ['all', 'flagged', 'detected'],
            'stats' => [
                'flagged' => User::where('is_flagged_suspicious', true)
                    ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'admin'))
                    ->count(),
                'blocked' => User::where('account_status', 'blocked')
                    ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'admin'))
                    ->count(),
                'detected' => $this->detectedUsersQuery()->count(),
                'new_accounts_week' => User::query()
                    ->where('created_at', '>=', now()->subDays(7))
                    ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'admin'))
                    ->count(),
            ],
        ]);
    }

    public function show(User $user): Response
    {
        if ($user->hasRole('admin')) {
            abort(404);
        }

        $user->loadCount(['applications', 'vacancies', 'cvs']);

        return Inertia::render('admin/suspicious-users/show', [
            'user' => $this->userDetail($user),
            'signals' => $this->detectSignals($user),
            'risk_level' => $this->riskLevel($user),
            'activity' => $this->userActivity($user),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        if ($user->hasRole('admin')) {
            abort(403);
        }

        if ($user->id === Auth::id()) {
            abort(403, 'You cannot modify your own account from this screen.');
        }

        $validated = $request->validate([
            'is_flagged_suspicious' => ['required', 'boolean'],
            'security_notes' => ['nullable', 'string', 'max:5000'],
            'account_status' => ['nullable', Rule::in(['active', 'suspended', 'blocked'])],
        ]);

        $flagged = (bool) $validated['is_flagged_suspicious'];

        $user->forceFill([
            'is_flagged_suspicious' => $flagged,
            'security_notes' => $validated['security_notes'] ?? null,
            'security_flagged_at' => $flagged ? now() : null,
            'security_flagged_by' => $flagged ? Auth::id() : null,
        ]);

        if (! empty($validated['account_status'])) {
            $user->account_status = $validated['account_status'];
            $user->status_changed_at = now();
        }

        $user->save();

        return back()->with('success', 'Security review saved.');
    }

    /**
     * @param  Builder<User>  $query
     */
    private function applyDetectedScope(Builder $query): void
    {
        $query->where(function (Builder $inner) {
            $inner->where('is_flagged_suspicious', true)
                ->orWhereIn('account_status', ['suspended', 'blocked'])
                ->orWhere(function (Builder $q) {
                    $q->where('created_at', '>=', now()->subDays(7))
                        ->has('applications', '>', 10);
                })
                ->orWhere(function (Builder $q) {
                    $q->whereNull('email_verified_at')
                        ->where('created_at', '<=', now()->subDays(7));
                })
                ->orWhere(function (Builder $q) {
                    $q->role('job_seeker')
                        ->where(function (Builder $profile) {
                            $profile->whereNull('headline')
                                ->orWhere('headline', '');
                        })
                        ->has('applications', '>', 5);
                })
                ->orWhere(function (Builder $q) {
                    $q->role('employer')
                        ->where('employer_verification_status', 'rejected');
                })
                ->orWhereExists(function ($sub) {
                    $sub->select(DB::raw(1))
                        ->from('applications')
                        ->whereColumn('applications.user_id', 'users.id')
                        ->where('applications.created_at', '>=', now()->subDay())
                        ->groupBy('applications.user_id')
                        ->havingRaw('COUNT(*) > 20');
                });
        });
    }

    /**
     * @return Builder<User>
     */
    private function detectedUsersQuery(): Builder
    {
        $query = User::query()->whereDoesntHave('roles', fn ($q) => $q->where('name', 'admin'));
        $this->applyDetectedScope($query);

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    private function userSummary(User $user): array
    {
        $signals = $this->detectSignals($user);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames(),
            'account_status' => $user->account_status ?? 'active',
            'is_flagged_suspicious' => (bool) $user->is_flagged_suspicious,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'applications_count' => $user->applications_count ?? 0,
            'jobs_posted_count' => $user->vacancies_count ?? 0,
            'signal_count' => count($signals),
            'risk_level' => $this->riskLevel($user),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userDetail(User $user): array
    {
        return [
            ...$this->userSummary($user),
            'security_notes' => $user->security_notes,
            'security_flagged_at' => $user->security_flagged_at?->toIso8601String(),
            'employer_verification_status' => $user->employer_verification_status ?? null,
            'headline' => $user->headline,
            'bio' => $user->bio,
            'company_name' => $user->company_name,
        ];
    }

    /**
     * @return list<array{id: string, label: string, severity: string}>
     */
    private function detectSignals(User $user): array
    {
        $signals = [];

        if ($user->is_flagged_suspicious) {
            $signals[] = [
                'id' => 'manually_flagged',
                'label' => 'Manually flagged by admin',
                'severity' => 'high',
            ];
        }

        if (in_array($user->account_status, ['suspended', 'blocked'], true)) {
            $signals[] = [
                'id' => 'restricted_account',
                'label' => 'Account is '.$user->account_status,
                'severity' => 'high',
            ];
        }

        if ($user->email_verified_at === null && $user->created_at?->lte(now()->subDays(7))) {
            $signals[] = [
                'id' => 'unverified_email',
                'label' => 'Email unverified for 7+ days',
                'severity' => 'medium',
            ];
        }

        $applicationsCount = $user->applications_count
            ?? Application::where('user_id', $user->id)->count();

        if ($user->created_at?->gte(now()->subDays(7)) && $applicationsCount > 10) {
            $signals[] = [
                'id' => 'burst_applications',
                'label' => 'New account with high application volume ('.$applicationsCount.')',
                'severity' => 'high',
            ];
        }

        $recentApplications = Application::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        if ($recentApplications > 20) {
            $signals[] = [
                'id' => 'application_spam',
                'label' => 'More than 20 applications in the last 24 hours',
                'severity' => 'high',
            ];
        }

        if ($user->hasRole('job_seeker') && blank($user->headline) && $applicationsCount > 5) {
            $signals[] = [
                'id' => 'thin_profile',
                'label' => 'Sparse profile with many applications',
                'severity' => 'medium',
            ];
        }

        if ($user->hasRole('employer') && $user->employer_verification_status === 'rejected') {
            $signals[] = [
                'id' => 'rejected_employer',
                'label' => 'Employer verification was rejected',
                'severity' => 'medium',
            ];
        }

        $duplicateEmailDomain = User::query()
            ->where('id', '!=', $user->id)
            ->where('email', 'like', '%@'.str($user->email)->after('@'))
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        if ($duplicateEmailDomain >= 2) {
            $signals[] = [
                'id' => 'similar_accounts',
                'label' => 'Multiple accounts on same email domain recently',
                'severity' => 'low',
            ];
        }

        return $signals;
    }

    private function riskLevel(User $user): string
    {
        $signals = $this->detectSignals($user);

        if ($signals === []) {
            return 'low';
        }

        $high = collect($signals)->where('severity', 'high')->count();
        $medium = collect($signals)->where('severity', 'medium')->count();

        if ($high >= 2 || ($high >= 1 && $medium >= 1)) {
            return 'high';
        }

        if ($high >= 1 || $medium >= 2) {
            return 'medium';
        }

        return 'low';
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
            ->take(8)
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
                'applications' => $user->applications_count
                    ?? Application::where('user_id', $user->id)->count(),
                'jobs_posted' => $user->vacancies_count
                    ?? Vacancy::where('user_id', $user->id)->count(),
                'cvs' => $user->cvs_count ?? Cv::where('user_id', $user->id)->count(),
            ],
            'recent_applications' => $recentApplications,
            'recent_jobs' => $recentJobs,
        ];
    }
}
