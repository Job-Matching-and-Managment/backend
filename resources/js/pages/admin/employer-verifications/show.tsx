import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Ban, Clock3 } from 'lucide-react';
import { useState } from 'react';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import {
    adminEmployerVerificationUpdatePath,
    adminEmployerVerificationsIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface Employer {
    id: number;
    name: string;
    email: string;
    company_name: string | null;
    company_description: string | null;
    company_website: string | null;
    company_logo: string | null;
    location: string | null;
    verification_status: VerificationStatus;
    verification_notes: string | null;
    submitted_at: string | null;
    verified_at: string | null;
}

interface Stats {
    jobs_posted: number;
    open_jobs: number;
}

interface RecentJob {
    id: number;
    title: string;
    status: string;
    created_at: string | null;
}

interface Props {
    employer: Employer;
    stats: Stats;
    recentJobs: RecentJob[];
}

const STATUS_CFG: Record<
    VerificationStatus,
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

export default function EmployerVerificationShow() {
    const { employer, stats, recentJobs } = usePage().props as Props;
    const [notes, setNotes] = useState(employer.verification_notes ?? '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        {
            title: 'Employer Verification',
            href: adminEmployerVerificationsIndexPath(),
        },
        { title: employer.name, href: '#' },
    ];

    const submit = (verificationStatus: VerificationStatus) => {
        const label = STATUS_CFG[verificationStatus].label;
        if (!confirm(`Set employer verification to "${label}"?`)) return;

        router.patch(adminEmployerVerificationUpdatePath(employer.id), {
            verification_status: verificationStatus,
            verification_notes: notes,
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verify Employer — ${employer.name}`} />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Link
                    href={adminEmployerVerificationsIndexPath()}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to employer verification
                </Link>

                <div className="flex flex-col gap-4 rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {employer.company_name || employer.name}
                            </h1>
                            <p className="mt-0.5 text-[13px] text-slate-500">
                                {employer.name} · {employer.email}
                            </p>
                            <div className="mt-2">
                                <span
                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[employer.verification_status].color}`}
                                >
                                    {STATUS_CFG[employer.verification_status].label}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                                <p className="font-semibold text-slate-900">
                                    {stats.jobs_posted}
                                </p>
                                <p className="text-slate-500">Jobs posted</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                                <p className="font-semibold text-slate-900">
                                    {stats.open_jobs}
                                </p>
                                <p className="text-slate-500">Open jobs</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <h2 className="mb-3 text-[13px] font-semibold text-slate-700">
                                Company information
                            </h2>
                            <dl className="grid grid-cols-1 gap-3 text-[13px] md:grid-cols-2">
                                <div>
                                    <dt className="text-slate-400">Company name</dt>
                                    <dd className="font-medium text-slate-800">
                                        {employer.company_name || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Website</dt>
                                    <dd className="font-medium text-slate-800">
                                        {employer.company_website || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Location</dt>
                                    <dd className="font-medium text-slate-800">
                                        {employer.location || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Submitted</dt>
                                    <dd className="font-medium text-slate-800">
                                        {formatDate(employer.submitted_at)}
                                    </dd>
                                </div>
                                <div className="md:col-span-2">
                                    <dt className="text-slate-400">Description</dt>
                                    <dd className="font-medium text-slate-800">
                                        {employer.company_description || '—'}
                                    </dd>
                                </div>
                                <div className="md:col-span-2">
                                    <dt className="text-slate-400">
                                        Verification notes
                                    </dt>
                                    <dd>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add review notes (why approved/rejected)."
                                            className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                        />
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => submit('approved')}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                >
                                    <BadgeCheck className="h-4 w-4" />
                                    Approve employer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submit('rejected')}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-100"
                                >
                                    <Ban className="h-4 w-4" />
                                    Reject employer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submit('pending')}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700 hover:bg-amber-100"
                                >
                                    <Clock3 className="h-4 w-4" />
                                    Set as pending
                                </button>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-3 text-[13px] font-semibold text-slate-700">
                                Recent jobs
                            </h2>
                            {recentJobs.length === 0 ? (
                                <p className="text-[12px] text-slate-400">
                                    No jobs posted yet.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {recentJobs.map((job) => (
                                        <li
                                            key={job.id}
                                            className="rounded-xl border border-slate-100 px-3 py-2 text-[12px]"
                                        >
                                            <p className="font-medium text-slate-800">
                                                {job.title}
                                            </p>
                                            <p className="text-slate-500">
                                                {job.status} · {formatDate(job.created_at)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
                                Last verified:{' '}
                                <span className="font-medium text-slate-800">
                                    {formatDate(employer.verified_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
