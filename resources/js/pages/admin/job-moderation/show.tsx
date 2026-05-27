import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Archive } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import {
    adminJobModerationIndexPath,
    adminJobModerationUpdatePath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type ModerationStatus = 'pending' | 'approved' | 'rejected';

interface Job {
    id: number;
    title: string;
    location: string;
    status: string;
    work_type: string;
    employment_type: string;
    moderation_status: ModerationStatus;
    is_archived: boolean;
    is_flagged_suspicious: boolean;
    applications_count: number;
    employer_name: string | null;
    company_name: string | null;
    employer_email: string | null;
    company_website: string | null;
    description: string;
    requirements: string;
    salary_min: number | null;
    salary_max: number | null;
    application_deadline: string | null;
    moderation_notes: string | null;
    moderated_at: string | null;
    created_at: string | null;
}

interface RecentApplication {
    id: number;
    status: string;
    applicant_name: string | null;
    applicant_email: string | null;
    created_at: string | null;
}

interface Props {
    job: Job;
    recentApplications: RecentApplication[];
}

const STATUS_CFG: Record<
    ModerationStatus,
    { label: string; color: string }
> = {
    pending: {
        label: 'Pending',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    approved: {
        label: 'Approved',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-50 text-red-600 border-red-200',
    },
};

const selectTriggerClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300';

const selectContentClass =
    'border border-slate-200 bg-white text-slate-900 shadow-lg';

const selectItemClass =
    'cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900';

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function JobModerationShow() {
    const { job, recentApplications } = usePage().props as Props;

    const [moderationStatus, setModerationStatus] = useState<ModerationStatus>(
        job.moderation_status,
    );
    const [isArchived, setIsArchived] = useState(job.is_archived);
    const [isFlagged, setIsFlagged] = useState(job.is_flagged_suspicious);
    const [notes, setNotes] = useState(job.moderation_notes ?? '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Job Moderation', href: adminJobModerationIndexPath() },
        { title: job.title, href: '#' },
    ];

    const submit = () => {
        if (!confirm('Save job moderation updates?')) return;

        router.patch(adminJobModerationUpdatePath(job.id), {
            moderation_status: moderationStatus,
            is_archived: isArchived,
            is_flagged_suspicious: isFlagged,
            moderation_notes: notes,
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Job Moderation — ${job.title}`} />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Link
                    href={adminJobModerationIndexPath()}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to job moderation
                </Link>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {job.title}
                            </h1>
                            <p className="mt-1 text-[13px] text-slate-500">
                                {job.company_name || job.employer_name} ·{' '}
                                {job.employer_email}
                            </p>
                            <p className="mt-1 text-[12px] text-slate-400">
                                Posted {formatDate(job.created_at)}
                                {job.moderated_at &&
                                    ` · Last reviewed ${formatDate(job.moderated_at)}`}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span
                                className={`inline-flex rounded-lg border px-2.5 py-1 text-[12px] font-semibold ${STATUS_CFG[job.moderation_status].color}`}
                            >
                                {STATUS_CFG[job.moderation_status].label}
                            </span>
                            {job.is_flagged_suspicious && (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-600">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Suspicious
                                </span>
                            )}
                            {job.is_archived && (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-600">
                                    <Archive className="h-3.5 w-3.5" />
                                    Archived
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 md:grid-cols-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Location
                            </p>
                            <p className="mt-1 text-[13px] text-slate-900">{job.location}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Work type
                            </p>
                            <p className="mt-1 text-[13px] capitalize text-slate-900">
                                {job.work_type}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Employment
                            </p>
                            <p className="mt-1 text-[13px] capitalize text-slate-900">
                                {job.employment_type}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Listing status
                            </p>
                            <p className="mt-1 text-[13px] capitalize text-slate-900">
                                {job.status}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Salary range
                            </p>
                            <p className="mt-1 text-[13px] text-slate-900">
                                {job.salary_min != null && job.salary_max != null
                                    ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Deadline
                            </p>
                            <p className="mt-1 text-[13px] text-slate-900">
                                {job.application_deadline || '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Applications
                            </p>
                            <p className="mt-1 text-[13px] text-slate-900">
                                {job.applications_count}
                            </p>
                        </div>
                        {job.company_website && (
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    Website
                                </p>
                                <a
                                    href={job.company_website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 block truncate text-[13px] text-indigo-600 hover:underline"
                                >
                                    {job.company_website}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Description
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">
                                {job.description}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Requirements
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">
                                {job.requirements}
                            </p>
                        </div>
                    </div>
                </div>

                {recentApplications.length > 0 && (
                    <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900">
                            Recent applications
                        </h2>
                        <ul className="mt-4 divide-y divide-slate-100">
                            {recentApplications.map((app) => (
                                <li
                                    key={app.id}
                                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-[13px]"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {app.applicant_name || 'Unknown'}
                                        </p>
                                        <p className="text-[12px] text-slate-500">
                                            {app.applicant_email}
                                        </p>
                                    </div>
                                    <div className="text-right text-[12px] text-slate-500">
                                        <span className="capitalize">{app.status}</span>
                                        <p>{formatDate(app.created_at)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">Moderation review</h2>
                    <p className="mt-1 text-[13px] text-slate-500">
                        Approve or reject this post, flag suspicious content, or archive it.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[12px] text-slate-600">
                                Moderation status
                            </Label>
                            <Select
                                value={moderationStatus}
                                onValueChange={(v) =>
                                    setModerationStatus(v as ModerationStatus)
                                }
                            >
                                <SelectTrigger className={selectTriggerClass}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass}>
                                    {(['pending', 'approved', 'rejected'] as const).map(
                                        (option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className={selectItemClass}
                                            >
                                                {STATUS_CFG[option].label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isFlagged}
                                    onChange={(e) => setIsFlagged(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="text-[13px] font-medium text-slate-800">
                                    Flag as suspicious
                                </span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isArchived}
                                    onChange={(e) => setIsArchived(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="text-[13px] font-medium text-slate-800">
                                    Archive job (closes listing)
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <Label htmlFor="moderation-notes" className="text-[12px] text-slate-600">
                            Moderation notes
                        </Label>
                        <textarea
                            id="moderation-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                            placeholder="Internal notes for this review…"
                        />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
                        <Button
                            type="button"
                            onClick={submit}
                            className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-none hover:bg-slate-800"
                        >
                            Save moderation
                        </Button>
                    </div>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
