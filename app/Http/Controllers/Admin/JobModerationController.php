<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Vacancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JobModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();
        $archived = $request->string('archived')->toString();
        $suspicious = $request->string('suspicious')->toString();

        $jobs = Vacancy::query()
            ->with('user:id,name,email,company_name')
            ->withCount('applications')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('company_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status !== '', fn ($query) => $query->where('moderation_status', $status))
            ->when($archived === 'yes', fn ($query) => $query->where('is_archived', true))
            ->when($archived === 'no', fn ($query) => $query->where('is_archived', false))
            ->when($suspicious === 'yes', fn ($query) => $query->where('is_flagged_suspicious', true))
            ->when($suspicious === 'no', fn ($query) => $query->where('is_flagged_suspicious', false))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Vacancy $vacancy) => $this->jobSummary($vacancy));

        return Inertia::render('admin/job-moderation/index', [
            'jobs' => $jobs,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'archived' => $archived,
                'suspicious' => $suspicious,
            ],
            'statusOptions' => ['pending', 'approved', 'rejected'],
            'stats' => [
                'pending' => Vacancy::where('moderation_status', 'pending')->where('is_archived', false)->count(),
                'flagged' => Vacancy::where('is_flagged_suspicious', true)->where('is_archived', false)->count(),
                'archived' => Vacancy::where('is_archived', true)->count(),
            ],
        ]);
    }

    public function show(Vacancy $vacancy): Response
    {
        $vacancy->load('user:id,name,email,company_name,company_website');
        $vacancy->loadCount('applications');

        $recentApplications = Application::query()
            ->where('vacancy_id', $vacancy->id)
            ->with('user:id,name,email')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'status' => $application->status,
                'applicant_name' => $application->user?->name,
                'applicant_email' => $application->user?->email,
                'created_at' => $application->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/job-moderation/show', [
            'job' => $this->jobDetails($vacancy),
            'recentApplications' => $recentApplications,
        ]);
    }

    public function update(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $validated = $request->validate([
            'moderation_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'is_archived' => ['required', 'boolean'],
            'is_flagged_suspicious' => ['required', 'boolean'],
            'moderation_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $status = $validated['moderation_status'];

        $vacancy->forceFill([
            'moderation_status' => $status,
            'is_archived' => (bool) $validated['is_archived'],
            'is_flagged_suspicious' => (bool) $validated['is_flagged_suspicious'],
            'moderation_notes' => $validated['moderation_notes'] ?? null,
            'moderated_at' => now(),
            'moderated_by' => Auth::id(),
            'status' => $validated['is_archived'] ? 'closed' : $vacancy->status,
        ])->save();

        return back()->with('success', 'Job moderation updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function jobSummary(Vacancy $vacancy): array
    {
        return [
            'id' => $vacancy->id,
            'title' => $vacancy->title,
            'location' => $vacancy->location,
            'status' => $vacancy->status,
            'work_type' => $vacancy->work_type,
            'employment_type' => $vacancy->employment_type,
            'moderation_status' => $vacancy->moderation_status ?? 'approved',
            'is_archived' => (bool) $vacancy->is_archived,
            'is_flagged_suspicious' => (bool) $vacancy->is_flagged_suspicious,
            'applications_count' => $vacancy->applications_count ?? 0,
            'employer_name' => $vacancy->user?->name,
            'company_name' => $vacancy->user?->company_name,
            'created_at' => $vacancy->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function jobDetails(Vacancy $vacancy): array
    {
        return [
            ...$this->jobSummary($vacancy),
            'description' => $vacancy->description,
            'requirements' => $vacancy->requirements,
            'salary_min' => $vacancy->salary_min,
            'salary_max' => $vacancy->salary_max,
            'application_deadline' => $vacancy->application_deadline,
            'employer_email' => $vacancy->user?->email,
            'company_website' => $vacancy->user?->company_website,
            'moderation_notes' => $vacancy->moderation_notes,
            'moderated_at' => $vacancy->moderated_at?->toIso8601String(),
        ];
    }
}
