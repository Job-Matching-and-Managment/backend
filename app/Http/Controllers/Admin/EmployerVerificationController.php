<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployerVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $employers = User::query()
            ->role('employer')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                });
            })
            ->when(
                $status !== '',
                fn ($query) => $query->where('employer_verification_status', $status)
            )
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => $this->employerSummary($user));

        return Inertia::render('admin/employer-verifications/index', [
            'employers' => $employers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statusOptions' => ['pending', 'approved', 'rejected'],
        ]);
    }

    public function show(User $user): Response
    {
        if (! $user->hasRole('employer')) {
            abort(404);
        }

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

        return Inertia::render('admin/employer-verifications/show', [
            'employer' => $this->employerDetails($user),
            'stats' => [
                'jobs_posted' => Vacancy::where('user_id', $user->id)->count(),
                'open_jobs' => Vacancy::where('user_id', $user->id)
                    ->where('status', 'open')
                    ->count(),
            ],
            'recentJobs' => $recentJobs,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        if (! $user->hasRole('employer')) {
            abort(404);
        }

        $validated = $request->validate([
            'verification_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'verification_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $status = $validated['verification_status'];

        $user->forceFill([
            'employer_verification_status' => $status,
            'employer_verified_at' => $status === 'approved' ? now() : null,
            'employer_verified_by' => $status === 'pending' ? null : Auth::id(),
            'employer_verification_notes' => $validated['verification_notes'] ?? null,
            'employer_submitted_at' => $user->employer_submitted_at ?? $user->created_at,
        ])->save();

        return back()->with('success', 'Employer verification status updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function employerSummary(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'company_name' => $user->company_name,
            'company_website' => $user->company_website,
            'verification_status' => $user->employer_verification_status ?? 'pending',
            'submitted_at' => $user->employer_submitted_at?->toIso8601String() ?? $user->created_at?->toIso8601String(),
            'verified_at' => $user->employer_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function employerDetails(User $user): array
    {
        return [
            ...$this->employerSummary($user),
            'company_description' => $user->company_description,
            'company_logo' => $user->company_logo,
            'location' => $user->location,
            'verification_notes' => $user->employer_verification_notes,
            'reviewed_by' => $user->employer_verified_by,
        ];
    }
}
