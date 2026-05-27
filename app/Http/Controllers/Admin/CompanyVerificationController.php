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

class CompanyVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $companies = User::query()
            ->role('employer')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('company_tin_number', 'like', "%{$search}%");
                });
            })
            ->when(
                $status !== '',
                fn ($query) => $query->where('company_verification_status', $status)
            )
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => $this->companySummary($user));

        return Inertia::render('admin/company-verifications/index', [
            'companies' => $companies,
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

        return Inertia::render('admin/company-verifications/show', [
            'company' => $this->companyDetails($user),
            'stats' => [
                'jobs_posted' => Vacancy::where('user_id', $user->id)->count(),
                'open_jobs' => Vacancy::where('user_id', $user->id)->where('status', 'open')->count(),
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
            'company_verification_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'business_license_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'kyc_verified' => ['required', 'boolean'],
            'tin_verified' => ['required', 'boolean'],
            'company_info_verified' => ['required', 'boolean'],
            'company_verification_notes' => ['nullable', 'string', 'max:5000'],
            'company_tin_number' => ['nullable', 'string', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_contact_email' => ['nullable', 'email', 'max:255'],
        ]);

        $status = $validated['company_verification_status'];

        $user->forceFill([
            'company_verification_status' => $status,
            'business_license_status' => $validated['business_license_status'],
            'kyc_verified' => (bool) $validated['kyc_verified'],
            'tin_verified' => (bool) $validated['tin_verified'],
            'company_info_verified' => (bool) $validated['company_info_verified'],
            'company_verification_notes' => $validated['company_verification_notes'] ?? null,
            'company_tin_number' => $validated['company_tin_number'] ?? $user->company_tin_number,
            'company_phone' => $validated['company_phone'] ?? $user->company_phone,
            'company_contact_email' => $validated['company_contact_email'] ?? $user->company_contact_email,
            'company_verified_at' => $status === 'approved' ? now() : null,
            'company_verified_by' => $status === 'pending' ? null : Auth::id(),
            'company_submitted_at' => $user->company_submitted_at ?? $user->created_at,
        ])->save();

        return back()->with('success', 'Company verification updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function companySummary(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'company_name' => $user->company_name,
            'company_phone' => $user->company_phone,
            'company_contact_email' => $user->company_contact_email,
            'company_tin_number' => $user->company_tin_number,
            'company_verification_status' => $user->company_verification_status ?? 'pending',
            'business_license_status' => $user->business_license_status ?? 'pending',
            'company_submitted_at' => $user->company_submitted_at?->toIso8601String() ?? $user->created_at?->toIso8601String(),
            'company_verified_at' => $user->company_verified_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function companyDetails(User $user): array
    {
        return [
            ...$this->companySummary($user),
            'company_description' => $user->company_description,
            'company_website' => $user->company_website,
            'company_logo' => $user->company_logo,
            'business_license_path' => $user->business_license_path,
            'kyc_verified' => (bool) $user->kyc_verified,
            'tin_verified' => (bool) $user->tin_verified,
            'company_info_verified' => (bool) $user->company_info_verified,
            'company_verification_notes' => $user->company_verification_notes,
            'reviewed_by' => $user->company_verified_by,
        ];
    }
}
