<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Admin\EmployerVerificationController as AdminEmployerVerificationController;
use App\Http\Controllers\Admin\CompanyVerificationController as AdminCompanyVerificationController;
use App\Http\Controllers\Admin\JobModerationController as AdminJobModerationController;
use App\Http\Controllers\Admin\ContentApprovalController as AdminContentApprovalController;
use App\Http\Controllers\Admin\SuspiciousUserController as AdminSuspiciousUserController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\QuizController;
use App\Services\AiMatchingService;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\CvController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\VacancyController;


Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'employer'])->name('dashboard');
});

// Local preview — must be registered BEFORE admin/users/{user} (not available in production)
if (app()->environment('local')) {
    Route::middleware(\App\Http\Middleware\PreviewAdminUser::class)->group(function () {
        Route::get('/admin/dashboard/preview', [AdminDashboardController::class, 'index'])
            ->name('admin.dashboard.preview');
        Route::get('/admin/company-verifications/preview', [AdminCompanyVerificationController::class, 'index'])
            ->name('admin.company-verifications.preview.index');
        Route::get('/admin/company-verifications/{user}/preview', [AdminCompanyVerificationController::class, 'show'])
            ->whereNumber('user')
            ->name('admin.company-verifications.preview.show');
        Route::patch('/admin/company-verifications/{user}/preview', [AdminCompanyVerificationController::class, 'update'])
            ->whereNumber('user')
            ->name('admin.company-verifications.preview.update');
        Route::get('/admin/employer-verifications/preview', [AdminEmployerVerificationController::class, 'index'])
            ->name('admin.employer-verifications.preview.index');
        Route::get('/admin/employer-verifications/{user}/preview', [AdminEmployerVerificationController::class, 'show'])
            ->whereNumber('user')
            ->name('admin.employer-verifications.preview.show');
        Route::patch('/admin/employer-verifications/{user}/preview', [AdminEmployerVerificationController::class, 'update'])
            ->whereNumber('user')
            ->name('admin.employer-verifications.preview.update');
        Route::get('/admin/users/preview', [AdminUserController::class, 'index'])
            ->name('admin.users.preview.index');
        Route::get('/admin/users/{user}/preview', [AdminUserController::class, 'show'])
            ->whereNumber('user')
            ->name('admin.users.preview.show');
        Route::patch('/admin/users/{user}/status/preview', [AdminUserController::class, 'updateStatus'])
            ->whereNumber('user')
            ->name('admin.users.preview.status');
        Route::delete('/admin/users/{user}/preview', [AdminUserController::class, 'destroy'])
            ->whereNumber('user')
            ->name('admin.users.preview.destroy');
        Route::get('/admin/job-moderation/preview', [AdminJobModerationController::class, 'index'])
            ->name('admin.job-moderation.preview.index');
        Route::get('/admin/job-moderation/{vacancy}/preview', [AdminJobModerationController::class, 'show'])
            ->whereNumber('vacancy')
            ->name('admin.job-moderation.preview.show');
        Route::patch('/admin/job-moderation/{vacancy}/preview', [AdminJobModerationController::class, 'update'])
            ->whereNumber('vacancy')
            ->name('admin.job-moderation.preview.update');
        Route::get('/admin/suspicious-users/preview', [AdminSuspiciousUserController::class, 'index'])
            ->name('admin.suspicious-users.preview.index');
        Route::get('/admin/suspicious-users/{user}/preview', [AdminSuspiciousUserController::class, 'show'])
            ->whereNumber('user')
            ->name('admin.suspicious-users.preview.show');
        Route::patch('/admin/suspicious-users/{user}/preview', [AdminSuspiciousUserController::class, 'update'])
            ->whereNumber('user')
            ->name('admin.suspicious-users.preview.update');
        Route::get('/admin/content-approval/preview', [AdminContentApprovalController::class, 'index'])
            ->name('admin.content-approval.preview.index');
        Route::get('/admin/content-approval/quizzes/{assessment}/preview', [AdminContentApprovalController::class, 'showQuiz'])
            ->whereNumber('assessment')
            ->name('admin.content-approval.preview.quiz.show');
        Route::patch('/admin/content-approval/quizzes/{assessment}/preview', [AdminContentApprovalController::class, 'updateQuiz'])
            ->whereNumber('assessment')
            ->name('admin.content-approval.preview.quiz.update');
        Route::get('/admin/content-approval/summaries/{cv}/preview', [AdminContentApprovalController::class, 'showSummary'])
            ->whereNumber('cv')
            ->name('admin.content-approval.preview.summary.show');
        Route::patch('/admin/content-approval/summaries/{cv}/preview', [AdminContentApprovalController::class, 'updateSummary'])
            ->whereNumber('cv')
            ->name('admin.content-approval.preview.summary.update');
        Route::get('/admin/announcements/preview', [AdminAnnouncementController::class, 'index'])
            ->name('admin.announcements.preview.index');
        Route::post('/admin/announcements/preview', [AdminAnnouncementController::class, 'store'])
            ->name('admin.announcements.preview.store');
        Route::patch('/admin/announcements/{announcement}/visibility/preview', [AdminAnnouncementController::class, 'toggleVisibility'])
            ->whereNumber('announcement')
            ->name('admin.announcements.preview.visibility');
        Route::get('/admin/reports/preview', [AdminReportController::class, 'index'])
            ->name('admin.reports.preview.index');
    });
}

// ── Admin routes (role: admin) ───────────────────────────────────────────────
Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/company-verifications', [AdminCompanyVerificationController::class, 'index'])->name('company-verifications.index');
        Route::get('/company-verifications/{user}', [AdminCompanyVerificationController::class, 'show'])
            ->whereNumber('user')
            ->name('company-verifications.show');
        Route::patch('/company-verifications/{user}', [AdminCompanyVerificationController::class, 'update'])
            ->whereNumber('user')
            ->name('company-verifications.update');
        Route::get('/employer-verifications', [AdminEmployerVerificationController::class, 'index'])->name('employer-verifications.index');
        Route::get('/employer-verifications/{user}', [AdminEmployerVerificationController::class, 'show'])
            ->whereNumber('user')
            ->name('employer-verifications.show');
        Route::patch('/employer-verifications/{user}', [AdminEmployerVerificationController::class, 'update'])
            ->whereNumber('user')
            ->name('employer-verifications.update');
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [AdminUserController::class, 'show'])
            ->whereNumber('user')
            ->name('users.show');
        Route::patch('/users/{user}/status', [AdminUserController::class, 'updateStatus'])
            ->whereNumber('user')
            ->name('users.status');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])
            ->whereNumber('user')
            ->name('users.destroy');
        Route::get('/job-moderation', [AdminJobModerationController::class, 'index'])->name('job-moderation.index');
        Route::get('/job-moderation/{vacancy}', [AdminJobModerationController::class, 'show'])
            ->whereNumber('vacancy')
            ->name('job-moderation.show');
        Route::patch('/job-moderation/{vacancy}', [AdminJobModerationController::class, 'update'])
            ->whereNumber('vacancy')
            ->name('job-moderation.update');
        Route::get('/suspicious-users', [AdminSuspiciousUserController::class, 'index'])->name('suspicious-users.index');
        Route::get('/suspicious-users/{user}', [AdminSuspiciousUserController::class, 'show'])
            ->whereNumber('user')
            ->name('suspicious-users.show');
        Route::patch('/suspicious-users/{user}', [AdminSuspiciousUserController::class, 'update'])
            ->whereNumber('user')
            ->name('suspicious-users.update');
        Route::get('/content-approval', [AdminContentApprovalController::class, 'index'])->name('content-approval.index');
        Route::get('/content-approval/quizzes/{assessment}', [AdminContentApprovalController::class, 'showQuiz'])
            ->whereNumber('assessment')
            ->name('content-approval.quiz.show');
        Route::patch('/content-approval/quizzes/{assessment}', [AdminContentApprovalController::class, 'updateQuiz'])
            ->whereNumber('assessment')
            ->name('content-approval.quiz.update');
        Route::get('/content-approval/summaries/{cv}', [AdminContentApprovalController::class, 'showSummary'])
            ->whereNumber('cv')
            ->name('content-approval.summary.show');
        Route::patch('/content-approval/summaries/{cv}', [AdminContentApprovalController::class, 'updateSummary'])
            ->whereNumber('cv')
            ->name('content-approval.summary.update');
        Route::get('/announcements', [AdminAnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/announcements', [AdminAnnouncementController::class, 'store'])->name('announcements.store');
        Route::patch('/announcements/{announcement}/visibility', [AdminAnnouncementController::class, 'toggleVisibility'])
            ->whereNumber('announcement')
            ->name('announcements.visibility');
        Route::get('/reports', [AdminReportController::class, 'index'])->name('reports.index');
    });

// ── Employer routes (role: employer) ─────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/employer/jobs',          [VacancyController::class, 'index'])->name('employer.jobs.index');
    Route::post('/employer/jobs',         [VacancyController::class, 'store'])->name('employer.jobs.store');
    Route::put('/employer/jobs/{vacancy}', [VacancyController::class, 'update'])->name('employer.jobs.update');
    Route::delete('/employer/jobs/{vacancy}', [VacancyController::class, 'destroy'])->name('employer.jobs.destroy');
});


// ── Job seeker routes (role: job_seeker) ─────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Browse all open jobs — pass CVs so the apply dialog can pick one
    Route::get('/jobs', function (AiMatchingService $aiService) {
        $vacancies = \App\Models\Vacancy::where('status', 'open')->latest()->get();

        // Build the simple vacancy array for the AI service
        $vacancyData = $vacancies->map(fn($v) => [
            'id'           => $v->id,
            'title'        => $v->title,
            'description'  => $v->description,
            'requirements' => $v->requirements,
        ])->toArray();

        // Get AI match scores (gracefully returns [] if service is down)
        $aiMatches = $aiService->matchForUser(auth()->id(), $vacancyData);

        return inertia('vacancy/index', [
            'vacancies'   => $vacancies,
            'applied_ids' => \App\Models\Application::where('user_id', auth()->id())
                                 ->pluck('vacancy_id'),
            'user_cvs'    => \App\Models\Cv::where('user_id', auth()->id())
                                 ->select('id', 'title', 'full_name', 'is_default')
                                 ->get(),
            'ai_matches'  => $aiMatches,  // Record<vacancy_id, score>
            'sidebar_stats' => [
                'applied'       => \App\Models\Application::where('user_id', auth()->id())->count(),
                'interviews'    => \App\Models\Interview::where('job_seeker_id', auth()->id())->count(),
                'skills_earned' => \App\Models\AssessmentResult::where('user_id', auth()->id())
                                       ->where('passed', true)
                                       ->distinct('assessment_id')
                                       ->count('assessment_id'),
                'cvs_count'     => \App\Models\Cv::where('user_id', auth()->id())->count(),
            ],
            'profile_completion' => (function () {
                $cv = \App\Models\Cv::where('user_id', auth()->id())
                    ->where('is_default', true)
                    ->with(['skills', 'experiences'])
                    ->first()
                    ?? \App\Models\Cv::where('user_id', auth()->id())
                        ->with(['skills', 'experiences'])
                        ->first();

                $score = 20; // base for account existence
                if ($cv) {
                    $score += 30;
                    if (!empty($cv->summary)) $score += 15;
                    if ($cv->skills->count() > 0) $score += 20;
                    if ($cv->experiences->count() > 0) $score += 15;
                }
                return $score;
            })(),
        ]);
    })->name('jobs.index');

// ── Job seeker ────────────────────────────────────────────────────────────
    Route::get('/my-applications',  [ApplicationController::class, 'index'])->name('applications.index');
    Route::post('/applications',    [ApplicationController::class, 'store'])->name('applications.store');
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy'])->name('applications.destroy');

    Route::get('/my-interviews',    [InterviewController::class, 'jobSeekerIndex'])->name('interviews.index');
    Route::delete('/interviews/{interview}', [InterviewController::class, 'destroy'])->name('interviews.destroy');
    Route::get('/interviews/{interview}/join', [InterviewController::class, 'join'])->name('interviews.join');

    // ── Employer ──────────────────────────────────────────────────────────────
    Route::prefix('employer')->name('employer.')->group(function () {

        // Applications management
        Route::get('/applications',  [ApplicationController::class, 'employerIndex'])->name('applications.index');
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus'])->name('applications.status');

        // Interview scheduling
        Route::get('/interviews',    [InterviewController::class, 'employerIndex'])->name('interviews.index');
        Route::post('/applications/{application}/interview', [InterviewController::class, 'store'])->name('interviews.store');
        Route::patch('/interviews/{interview}/reschedule',   [InterviewController::class, 'reschedule'])->name('interviews.reschedule');
        Route::patch('/interviews/{interview}/complete',     [InterviewController::class, 'complete'])->name('interviews.complete');
        Route::delete('/interviews/{interview}',             [InterviewController::class, 'destroy'])->name('interviews.destroy');
    });

    Route::get('/employer/jobs/{vacancy}/applications', [VacancyController::class, 'applications'])
    ->name('employer.jobs.applications');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/cv',              [CvController::class, 'index'])->name('cv.index');
    Route::get('/cv/create',       [CvController::class, 'create'])->name('cv.create');
    Route::post('/cv',             [CvController::class, 'store'])->name('cv.store');
    Route::get('/cv/{id}',         [CvController::class, 'show'])->name('cv.show');
    Route::put('/cv/{id}',         [CvController::class, 'update'])->name('cv.update');
    Route::delete('/cv/{id}',      [CvController::class, 'destroy'])->name('cv.destroy');

    // Experiences
    Route::post('/cv/{cvId}/experiences',          [CvController::class, 'storeExperience'])->name('cv.experience.store');
    Route::put('/cv/{cvId}/experiences/{expId}',   [CvController::class, 'updateExperience'])->name('cv.experience.update');
    Route::delete('/cv/{cvId}/experiences/{expId}',[CvController::class, 'destroyExperience'])->name('cv.experience.destroy');

    // Education
    Route::post('/cv/{cvId}/education',            [CvController::class, 'storeEducation'])->name('cv.education.store');
    Route::put('/cv/{cvId}/education/{eduId}',     [CvController::class, 'updateEducation'])->name('cv.education.update');
    Route::delete('/cv/{cvId}/education/{eduId}',  [CvController::class, 'destroyEducation'])->name('cv.education.destroy');

    // Skills
    Route::post('/cv/{cvId}/skills',               [CvController::class, 'storeSkill'])->name('cv.skill.store');
    Route::put('/cv/{cvId}/skills/{skillId}',      [CvController::class, 'updateSkill'])->name('cv.skill.update');
    Route::delete('/cv/{cvId}/skills/{skillId}',   [CvController::class, 'destroySkill'])->name('cv.skill.destroy');

    // Projects
    Route::post('/cv/{cvId}/projects',             [CvController::class, 'storeProject'])->name('cv.project.store');
    Route::put('/cv/{cvId}/projects/{projectId}',  [CvController::class, 'updateProject'])->name('cv.project.update');
    Route::delete('/cv/{cvId}/projects/{projectId}',[CvController::class, 'destroyProject'])->name('cv.project.destroy');

    // Reorder
    Route::post('/cv/{cvId}/reorder',              [CvController::class, 'reorder'])->name('cv.reorder');
});


// ── Notifications ─────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notifications',                          [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/api/notifications',                      [NotificationController::class, 'apiIndex'])->name('notifications.api');
    Route::patch('/notifications/{notification}/read',    [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all',                [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::delete('/notifications/{notification}',        [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Vacancy preview — JSON endpoint for the notification drawer.
    // Lives here (not api.php) so the web session resolves auth()->user() correctly.
    Route::get('/api/vacancies/{vacancy}/preview', function (\App\Models\Vacancy $vacancy) {
        $userId = auth()->id();
        return response()->json([
            'vacancy'     => $vacancy,
            'has_applied' => \App\Models\Application::where('user_id', $userId)
                                 ->where('vacancy_id', $vacancy->id)
                                 ->exists(),
            'user_cvs'    => \App\Models\Cv::where('user_id', $userId)
                                 ->select('id', 'title', 'full_name', 'is_default')
                                 ->get(),
        ]);
    })->name('api.vacancy.preview');

    // AI suggestions + invite (employer only)
    Route::get('/employer/jobs/{vacancy}/ai-suggestions', [VacancyController::class, 'aiSuggestions'])->name('employer.jobs.ai-suggestions');
    Route::post('/employer/jobs/{vacancy}/invite/{userId}', [VacancyController::class, 'inviteUser'])->name('employer.jobs.invite');

    // Quiz / Assessments
    Route::get('/quiz',                        [QuizController::class, 'index'])->name('quiz.index');
    Route::post('/quiz/generate',               [QuizController::class, 'generate'])->name('quiz.generate');
    Route::get('/quiz/{assessment}',            [QuizController::class, 'show'])->name('quiz.show');
    Route::post('/quiz/{assessment}/submit',    [QuizController::class, 'submit'])->name('quiz.submit');
});

require __DIR__.'/settings.php';
