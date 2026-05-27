<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $applicationsPerJob = Vacancy::query()
            ->withCount('applications')
            ->with('user:id,name,company_name')
            ->orderByDesc('applications_count')
            ->take(8)
            ->get()
            ->map(fn (Vacancy $vacancy) => [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'employer' => $vacancy->user?->company_name ?: $vacancy->user?->name,
                'applications_count' => $vacancy->applications_count,
                'status' => $vacancy->status,
            ]);

        $employerActivity = User::role('employer')
            ->withCount('vacancies')
            ->orderByDesc('vacancies_count')
            ->take(8)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'company_name' => $user->company_name,
                'vacancies_count' => $user->vacancies_count,
            ]);

        $hiringFunnel = [
            ['name' => 'Applied', 'count' => Application::where('status', 'applied')->count()],
            ['name' => 'Shortlisted', 'count' => Application::where('status', 'shortlisted')->count()],
            ['name' => 'Hired', 'count' => Application::where('status', 'hired')->count()],
            ['name' => 'Rejected', 'count' => Application::where('status', 'rejected')->count()],
        ];

        $usersMonthly = $this->monthlyCounts(User::query(), 11);
        $jobsMonthly = $this->monthlyCounts(Vacancy::query(), 11);
        $applicationsMonthly = $this->monthlyCounts(Application::query(), 11);

        $jobsByWorkType = Vacancy::query()
            ->select('work_type', DB::raw('count(*) as count'))
            ->groupBy('work_type')
            ->get()
            ->map(fn ($row) => ['name' => $row->work_type, 'count' => (int) $row->count]);

        $jobsByEmploymentType = Vacancy::query()
            ->select('employment_type', DB::raw('count(*) as count'))
            ->groupBy('employment_type')
            ->get()
            ->map(fn ($row) => ['name' => $row->employment_type, 'count' => (int) $row->count]);

        return Inertia::render('admin/reports/index', [
            'highlights' => [
                'total_users' => User::count(),
                'total_jobs' => Vacancy::count(),
                'total_applications' => Application::count(),
                'hired_count' => Application::where('status', 'hired')->count(),
            ],
            'series' => [
                'users_monthly' => $usersMonthly,
                'jobs_monthly' => $jobsMonthly,
                'applications_monthly' => $applicationsMonthly,
                'hiring_funnel' => $hiringFunnel,
            ],
            'breakdowns' => [
                'jobs_by_work_type' => $jobsByWorkType,
                'jobs_by_employment_type' => $jobsByEmploymentType,
            ],
            'tables' => [
                'applications_per_job' => $applicationsPerJob,
                'employer_activity' => $employerActivity,
            ],
        ]);
    }

    /**
     * @param \Illuminate\Database\Eloquent\Builder<\Illuminate\Database\Eloquent\Model> $query
     * @return \Illuminate\Support\Collection<int, array{name: string, count: int}>
     */
    private function monthlyCounts($query, int $monthsBack): \Illuminate\Support\Collection
    {
        $raw = (clone $query)
            ->where('created_at', '>=', now()->subMonths($monthsBack)->startOfMonth())
            ->select(DB::raw('strftime("%Y-%m", created_at) as ym'), DB::raw('count(*) as count'))
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->keyBy('ym');

        $series = collect();
        for ($i = $monthsBack; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $series->push([
                'name' => $date->format('M Y'),
                'count' => (int) ($raw[$key]->count ?? 0),
            ]);
        }

        return $series->values();
    }
}
