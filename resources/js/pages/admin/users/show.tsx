import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Ban, CheckCircle, Trash2, UserX } from 'lucide-react';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import {
    adminUserDestroyPath,
    adminUserStatusPath,
    adminUsersIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type AccountStatus = 'active' | 'suspended' | 'blocked';

interface UserDetail {
    id: number;
    name: string;
    email: string;
    roles: string[];
    account_status: AccountStatus;
    email_verified_at: string | null;
    created_at: string | null;
    status_changed_at: string | null;
    company_name: string | null;
    headline: string | null;
    bio: string | null;
    location: string | null;
    experience_years: string | null;
    company_description: string | null;
    company_website: string | null;
}

interface Activity {
    counts: {
        applications: number;
        jobs_posted: number;
        cvs: number;
    };
    recent_applications: {
        id: number;
        status: string;
        job_title: string | null;
        created_at: string | null;
    }[];
    recent_jobs: {
        id: number;
        title: string;
        status: string;
        created_at: string | null;
    }[];
}

interface Props {
    user: UserDetail;
    activity: Activity;
}

const STATUS_CFG: Record<
    AccountStatus,
    { label: string; color: string }
> = {
    active: {
        label: 'Active',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    suspended: {
        label: 'Suspended',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    blocked: {
        label: 'Blocked',
        color: 'bg-red-50 text-red-600 border-red-200',
    },
};

const ROLE_LABELS: Record<string, string> = {
    employer: 'Employer',
    job_seeker: 'Job seeker',
    admin: 'Admin',
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

export default function AdminUserShow() {
    const { user, activity } = usePage().props as unknown as Props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Users', href: adminUsersIndexPath() },
        { title: user.name, href: adminUserShowPath(user.id) },
    ];

    const updateStatus = (account_status: AccountStatus) => {
        if (
            !confirm(
                `Change this user's status to "${STATUS_CFG[account_status].label}"?`,
            )
        ) {
            return;
        }
        router.patch(adminUserStatusPath(user.id), { account_status });
    };

    const deleteUser = () => {
        if (
            !confirm(
                `Permanently delete ${user.name}? This cannot be undone.`,
            )
        ) {
            return;
        }
        router.delete(adminUserDestroyPath(user.id));
    };

    const isAdmin = user.roles.includes('admin');

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`User — ${user.name}`} />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Link
                    href={adminUsersIndexPath()}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to users
                </Link>

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {user.name}
                            </h1>
                            <p className="text-[13px] text-slate-500">
                                {user.email}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                    {ROLE_LABELS[user.roles[0] ?? ''] ??
                                        user.roles[0] ??
                                        'No role'}
                                </span>
                                <span
                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[user.account_status].color}`}
                                >
                                    {STATUS_CFG[user.account_status].label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {!isAdmin && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => updateStatus('active')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Activate
                            </button>
                            <button
                                type="button"
                                onClick={() => updateStatus('suspended')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700 hover:bg-amber-100"
                            >
                                <UserX className="h-4 w-4" />
                                Suspend
                            </button>
                            <button
                                type="button"
                                onClick={() => updateStatus('blocked')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-100"
                            >
                                <Ban className="h-4 w-4" />
                                Block
                            </button>
                            <button
                                type="button"
                                onClick={deleteUser}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm lg:col-span-1 dark:border-sidebar-border dark:bg-sidebar">
                        <h2 className="mb-4 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                            Profile
                        </h2>
                        <dl className="space-y-3 text-[13px]">
                            <div>
                                <dt className="text-slate-400">Joined</dt>
                                <dd className="font-medium text-slate-800 dark:text-slate-100">
                                    {formatDate(user.created_at)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-400">
                                    Email verified
                                </dt>
                                <dd className="font-medium text-slate-800 dark:text-slate-100">
                                    {user.email_verified_at ? 'Yes' : 'No'}
                                </dd>
                            </div>
                            {user.location && (
                                <div>
                                    <dt className="text-slate-400">
                                        Location
                                    </dt>
                                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                                        {user.location}
                                    </dd>
                                </div>
                            )}
                            {user.company_name && (
                                <div>
                                    <dt className="text-slate-400">
                                        Company
                                    </dt>
                                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                                        {user.company_name}
                                    </dd>
                                </div>
                            )}
                            {user.status_changed_at && (
                                <div>
                                    <dt className="text-slate-400">
                                        Status updated
                                    </dt>
                                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                                        {formatDate(user.status_changed_at)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm lg:col-span-2 dark:border-sidebar-border dark:bg-sidebar">
                        <h2 className="mb-4 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                            Activity summary
                        </h2>
                        <div className="mb-6 grid grid-cols-3 gap-3">
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-900/40">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {activity.counts.applications}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Applications
                                </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-900/40">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {activity.counts.jobs_posted}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Jobs posted
                                </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-900/40">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {activity.counts.cvs}
                                </p>
                                <p className="text-[11px] text-slate-500">CVs</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-[12px] font-semibold text-slate-500 uppercase">
                                    Recent applications
                                </h3>
                                {activity.recent_applications.length === 0 ? (
                                    <p className="text-[12px] text-slate-400">
                                        None
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {activity.recent_applications.map(
                                            (a) => (
                                                <li
                                                    key={a.id}
                                                    className="rounded-xl border border-slate-100 px-3 py-2 text-[12px] dark:border-slate-800"
                                                >
                                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                                        {a.job_title ?? 'Job'}
                                                    </p>
                                                    <p className="text-slate-500">
                                                        {a.status} ·{' '}
                                                        {formatDate(
                                                            a.created_at,
                                                        )}
                                                    </p>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <h3 className="mb-2 text-[12px] font-semibold text-slate-500 uppercase">
                                    Recent jobs posted
                                </h3>
                                {activity.recent_jobs.length === 0 ? (
                                    <p className="text-[12px] text-slate-400">
                                        None
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {activity.recent_jobs.map((j) => (
                                            <li
                                                key={j.id}
                                                className="rounded-xl border border-slate-100 px-3 py-2 text-[12px] dark:border-slate-800"
                                            >
                                                <p className="font-medium text-slate-800 dark:text-slate-100">
                                                    {j.title}
                                                </p>
                                                <p className="text-slate-500">
                                                    {j.status} ·{' '}
                                                    {formatDate(j.created_at)}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
