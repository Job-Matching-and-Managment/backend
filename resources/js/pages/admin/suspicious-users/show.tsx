import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';
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
    adminSuspiciousUserUpdatePath,
    adminSuspiciousUsersIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type AccountStatus = 'active' | 'suspended' | 'blocked';
type RiskLevel = 'low' | 'medium' | 'high';

interface Signal {
    id: string;
    label: string;
    severity: 'low' | 'medium' | 'high';
}

interface UserDetail {
    id: number;
    name: string;
    email: string;
    roles: string[];
    account_status: AccountStatus;
    is_flagged_suspicious: boolean;
    security_notes: string | null;
    security_flagged_at: string | null;
    employer_verification_status: string | null;
    headline: string | null;
    bio: string | null;
    company_name: string | null;
    created_at: string | null;
    applications_count: number;
    jobs_posted_count: number;
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
    signals: Signal[];
    risk_level: RiskLevel;
    activity: Activity;
}

const RISK_CFG: Record<RiskLevel, { label: string; color: string }> = {
    low: {
        label: 'Low risk',
        color: 'bg-slate-50 text-slate-600 border-slate-200',
    },
    medium: {
        label: 'Medium risk',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    high: {
        label: 'High risk',
        color: 'bg-red-50 text-red-600 border-red-200',
    },
};

const SEVERITY_CFG: Record<string, string> = {
    low: 'border-slate-200 bg-slate-50 text-slate-600',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    high: 'border-red-200 bg-red-50 text-red-600',
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

export default function SuspiciousUserShow() {
    const { user, signals, risk_level, activity } = usePage().props as Props;

    const [isFlagged, setIsFlagged] = useState(user.is_flagged_suspicious);
    const [notes, setNotes] = useState(user.security_notes ?? '');
    const [accountStatus, setAccountStatus] = useState<AccountStatus>(
        user.account_status,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        {
            title: 'Suspicious Users',
            href: adminSuspiciousUsersIndexPath(),
        },
        { title: user.name, href: '#' },
    ];

    const submit = () => {
        if (!confirm('Save security review for this user?')) return;

        router.patch(adminSuspiciousUserUpdatePath(user.id), {
            is_flagged_suspicious: isFlagged,
            security_notes: notes,
            account_status: accountStatus,
        });
    };

    const blockUser = () => {
        if (!confirm('Block this user account?')) return;
        setAccountStatus('blocked');
        router.patch(adminSuspiciousUserUpdatePath(user.id), {
            is_flagged_suspicious: true,
            security_notes: notes || 'Blocked from security monitoring.',
            account_status: 'blocked',
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Security — ${user.name}`} />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Link
                    href={adminSuspiciousUsersIndexPath()}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to suspicious users
                </Link>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {user.name}
                            </h1>
                            <p className="mt-1 text-[13px] text-slate-500">
                                {user.email}
                            </p>
                            <p className="mt-1 text-[12px] capitalize text-slate-400">
                                {user.roles.join(', ').replace('_', ' ')} · Joined{' '}
                                {formatDate(user.created_at)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span
                                className={`inline-flex rounded-lg border px-2.5 py-1 text-[12px] font-semibold ${RISK_CFG[risk_level].color}`}
                            >
                                {RISK_CFG[risk_level].label}
                            </span>
                            {user.is_flagged_suspicious && (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-600">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    Flagged
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 md:grid-cols-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Account status
                            </p>
                            <p className="mt-1 text-[13px] capitalize text-slate-900">
                                {user.account_status}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Applications
                            </p>
                            <p className="mt-1 text-[13px] text-slate-900">
                                {activity.counts.applications}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Jobs posted
                            </p>
                            <p className="mt-1 text-[13px] text-slate-900">
                                {activity.counts.jobs_posted}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                CVs
                            </p>
                            <p className="mt-1 text-[13px] text-slate-900">
                                {activity.counts.cvs}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Detected signals ({signals.length})
                    </h2>
                    {signals.length === 0 ? (
                        <p className="mt-4 text-[13px] text-slate-500">
                            No automated risk signals for this account.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {signals.map((signal) => (
                                <li
                                    key={signal.id}
                                    className={`rounded-lg border px-3 py-2 text-[13px] font-medium ${SEVERITY_CFG[signal.severity]}`}
                                >
                                    {signal.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {(activity.recent_applications.length > 0 ||
                    activity.recent_jobs.length > 0) && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {activity.recent_applications.length > 0 && (
                            <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                                <h2 className="text-sm font-bold text-slate-900">
                                    Recent applications
                                </h2>
                                <ul className="mt-4 divide-y divide-slate-100">
                                    {activity.recent_applications.map((app) => (
                                        <li
                                            key={app.id}
                                            className="flex justify-between gap-2 py-3 text-[13px]"
                                        >
                                            <span className="font-medium text-slate-800">
                                                {app.job_title || 'Unknown job'}
                                            </span>
                                            <span className="text-[12px] text-slate-500 capitalize">
                                                {app.status} · {formatDate(app.created_at)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {activity.recent_jobs.length > 0 && (
                            <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                                <h2 className="text-sm font-bold text-slate-900">
                                    Recent job posts
                                </h2>
                                <ul className="mt-4 divide-y divide-slate-100">
                                    {activity.recent_jobs.map((job) => (
                                        <li
                                            key={job.id}
                                            className="flex justify-between gap-2 py-3 text-[13px]"
                                        >
                                            <span className="font-medium text-slate-800">
                                                {job.title}
                                            </span>
                                            <span className="text-[12px] text-slate-500 capitalize">
                                                {job.status} · {formatDate(job.created_at)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">
                        Security actions
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-500">
                        Flag malicious accounts, add internal notes, or restrict access.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
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
                            {user.security_flagged_at && (
                                <p className="text-[12px] text-slate-500">
                                    Last flagged {formatDate(user.security_flagged_at)}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[12px] text-slate-600">
                                Account status
                            </Label>
                            <Select
                                value={accountStatus}
                                onValueChange={(v) =>
                                    setAccountStatus(v as AccountStatus)
                                }
                            >
                                <SelectTrigger className={selectTriggerClass}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass}>
                                    <SelectItem value="active" className={selectItemClass}>
                                        Active
                                    </SelectItem>
                                    <SelectItem
                                        value="suspended"
                                        className={selectItemClass}
                                    >
                                        Suspended
                                    </SelectItem>
                                    <SelectItem value="blocked" className={selectItemClass}>
                                        Blocked
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <Label htmlFor="security-notes" className="text-[12px] text-slate-600">
                            Security notes
                        </Label>
                        <textarea
                            id="security-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                            placeholder="Report details, investigation notes…"
                        />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
                        <Button
                            type="button"
                            onClick={submit}
                            className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Save review
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={blockUser}
                            className="h-10 rounded-lg border-red-200 bg-white px-5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            Block user
                        </Button>
                    </div>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
