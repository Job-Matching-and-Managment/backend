/** Build admin URLs; use /preview suffix when browsing local preview routes. */
export function adminUsersIndexPath(): string {
    return isAdminPreview() ? '/admin/users/preview' : '/admin/users';
}

export function adminEmployerVerificationsIndexPath(): string {
    return isAdminPreview()
        ? '/admin/employer-verifications/preview'
        : '/admin/employer-verifications';
}

export function adminEmployerVerificationShowPath(userId: number): string {
    return isAdminPreview()
        ? `/admin/employer-verifications/${userId}/preview`
        : `/admin/employer-verifications/${userId}`;
}

export function adminEmployerVerificationUpdatePath(userId: number): string {
    return isAdminPreview()
        ? `/admin/employer-verifications/${userId}/preview`
        : `/admin/employer-verifications/${userId}`;
}

export function adminCompanyVerificationsIndexPath(): string {
    return isAdminPreview()
        ? '/admin/company-verifications/preview'
        : '/admin/company-verifications';
}

export function adminCompanyVerificationShowPath(userId: number): string {
    return isAdminPreview()
        ? `/admin/company-verifications/${userId}/preview`
        : `/admin/company-verifications/${userId}`;
}

export function adminCompanyVerificationUpdatePath(userId: number): string {
    return isAdminPreview()
        ? `/admin/company-verifications/${userId}/preview`
        : `/admin/company-verifications/${userId}`;
}

export function adminUserShowPath(userId: number): string {
    return isAdminPreview()
        ? `/admin/users/${userId}/preview`
        : `/admin/users/${userId}`;
}

export function adminUserStatusPath(userId: number): string {
    return isAdminPreview()
        ? `/admin/users/${userId}/status/preview`
        : `/admin/users/${userId}/status`;
}

export function adminUserDestroyPath(userId: number): string {
    return isAdminPreview()
        ? `/admin/users/${userId}/preview`
        : `/admin/users/${userId}`;
}

export function adminJobModerationIndexPath(): string {
    return isAdminPreview()
        ? '/admin/job-moderation/preview'
        : '/admin/job-moderation';
}

export function adminJobModerationShowPath(vacancyId: number): string {
    return isAdminPreview()
        ? `/admin/job-moderation/${vacancyId}/preview`
        : `/admin/job-moderation/${vacancyId}`;
}

export function adminJobModerationUpdatePath(vacancyId: number): string {
    return isAdminPreview()
        ? `/admin/job-moderation/${vacancyId}/preview`
        : `/admin/job-moderation/${vacancyId}`;
}

export function adminSuspiciousUsersIndexPath(): string {
    return isAdminPreview()
        ? '/admin/suspicious-users/preview'
        : '/admin/suspicious-users';
}

export function adminSuspiciousUserShowPath(userId: number): string {
    return isAdminPreview()
        ? `/admin/suspicious-users/${userId}/preview`
        : `/admin/suspicious-users/${userId}`;
}

export function adminSuspiciousUserUpdatePath(userId: number): string {
    return isAdminPreview()
        ? `/admin/suspicious-users/${userId}/preview`
        : `/admin/suspicious-users/${userId}`;
}

export function adminContentApprovalIndexPath(type = 'quizzes'): string {
    const base = isAdminPreview()
        ? '/admin/content-approval/preview'
        : '/admin/content-approval';
    return `${base}?type=${type}`;
}

export function adminContentApprovalQuizShowPath(assessmentId: number): string {
    return isAdminPreview()
        ? `/admin/content-approval/quizzes/${assessmentId}/preview`
        : `/admin/content-approval/quizzes/${assessmentId}`;
}

export function adminContentApprovalQuizUpdatePath(assessmentId: number): string {
    return adminContentApprovalQuizShowPath(assessmentId);
}

export function adminContentApprovalSummaryShowPath(cvId: number): string {
    return isAdminPreview()
        ? `/admin/content-approval/summaries/${cvId}/preview`
        : `/admin/content-approval/summaries/${cvId}`;
}

export function adminContentApprovalSummaryUpdatePath(cvId: number): string {
    return adminContentApprovalSummaryShowPath(cvId);
}

export function adminAnnouncementsIndexPath(): string {
    return isAdminPreview()
        ? '/admin/announcements/preview'
        : '/admin/announcements';
}

export function adminAnnouncementsStorePath(): string {
    return adminAnnouncementsIndexPath();
}

export function adminAnnouncementVisibilityPath(announcementId: number): string {
    return isAdminPreview()
        ? `/admin/announcements/${announcementId}/visibility/preview`
        : `/admin/announcements/${announcementId}/visibility`;
}

export function adminReportsIndexPath(): string {
    return isAdminPreview()
        ? '/admin/reports/preview'
        : '/admin/reports';
}

function isAdminPreview(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.location.pathname.includes('/preview')
    );
}
