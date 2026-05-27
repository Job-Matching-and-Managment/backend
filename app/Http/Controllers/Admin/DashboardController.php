<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::count();
        $employerCount = User::role('employer')->count();
        $jobSeekerCount = User::role('job_seeker')->count();
        $adminCount = User::role('admin')->count();

        $totalJobs = Vacancy::count();
        $openJobs = Vacancy::where('status', 'open')->count();
        $closedJobs = Vacancy::where('status', 'closed')->count();
        $totalApplications = Application::count();

        $newUsersThisWeek = User::where('created_at', '>=', now()->subDays(7))->count();
        $newJobsThisWeek = Vacancy::where('created_at', '>=', now()->subDays(7))->count();
        $newApplicationsThisWeek = Application::where('created_at', '>=', now()->subDays(7))->count();

        $usersByRole = collect([
            ['role' => 'employer', 'count' => $employerCount],
            ['role' => 'job_seeker', 'count' => $jobSeekerCount],
            ['role' => 'admin', 'count' => $adminCount],
        ])->filter(fn ($row) => $row['count'] > 0)->values();

        $statusBreakdown = Application::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status, 'count' => (int) $row->count])
            ->values();

        $usersOverTime = $this->dailyCounts(User::query(), 29);
        $applicationsOverTime = $this->dailyCounts(Application::query(), 29);

        $jobsPerStatus = collect([
            ['status' => 'open', 'count' => $openJobs],
            ['status' => 'closed', 'count' => $closedJobs],
        ])->filter(fn ($row) => $row['count'] > 0)->values();

        $recentUsers = User::query()
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        $recentJobs = Vacancy::query()
            ->with('user:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'status', 'user_id', 'created_at'])
            ->map(fn (Vacancy $vacancy) => [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'status' => $vacancy->status,
                'employer_name' => $vacancy->user?->name,
                'created_at' => $vacancy->created_at?->toIso8601String(),
            ]);

        $recentApplications = Application::query()
            ->with(['user:id,name', 'vacancy:id,title'])
            ->latest()
            ->take(5)
            ->get(['id', 'status', 'user_id', 'vacancy_id', 'created_at'])
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'status' => $application->status,
                'applicant_name' => $application->user?->name,
                'job_title' => $application->vacancy?->title,
                'created_at' => $application->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'employerCount' => $employerCount,
                'jobSeekerCount' => $jobSeekerCount,
                'adminCount' => $adminCount,
                'totalJobs' => $totalJobs,
                'openJobs' => $openJobs,
                'closedJobs' => $closedJobs,
                'totalApplications' => $totalApplications,
                'newUsersThisWeek' => $newUsersThisWeek,
                'newJobsThisWeek' => $newJobsThisWeek,
                'newApplicationsThisWeek' => $newApplicationsThisWeek,
            ],
            'usersByRole' => $usersByRole,
            'statusBreakdown' => $statusBreakdown,
            'usersOverTime' => $usersOverTime,
            'applicationsOverTime' => $applicationsOverTime,
            'jobsPerStatus' => $jobsPerStatus,
            'recentActivity' => [
                'users' => $recentUsers,
                'jobs' => $recentJobs,
                'applications' => $recentApplications,
            ],
        ]);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<\Illuminate\Database\Eloquent\Model>  $query
     * @return \Illuminate\Support\Collection<int, array{date: string, count: int}>
     */
    private function dailyCounts($query, int $daysBack): \Illuminate\Support\Collection
    {
        $raw = (clone $query)
            ->where('created_at', '>=', now()->subDays($daysBack)->startOfDay())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $series = collect();
        for ($i = $daysBack; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $series->push([
                'date' => now()->subDays($i)->format('M d'),
                'count' => (int) ($raw[$date]->count ?? 0),
            ]);
        }

        return $series->values();
    }
}
