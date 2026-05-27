import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, ShieldAlert } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import {
    adminSuspiciousUserShowPath,
    adminSuspiciousUsersIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type RiskLevel = 'low' | 'medium' | 'high';

interface UserRow {
    id: number;
    name: string;
    email: string;
    roles: string[];
    account_status: string;
    is_flagged_suspicious: boolean;
    signal_count: number;
    risk_level: RiskLevel;
    applications_count: number;
    jobs_posted_count: number;
    created_at: string | null;
}

interface PaginatedUsers {
    data: UserRow[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    last_page: number;
}

interface Props {
    users: PaginatedUsers;
    filters: { search: string; role: string; view: string };
    roleOptions: string[];
    viewOptions: string[];
    stats: {
        flagged: number;
        blocked: number;
        detected: number;
        new_accounts_week: number;
    };
}

const RISK_CFG: Record<RiskLevel, { label: string; color: string }> = {
    low: {
        label: 'Low',
        color: 'bg-slate-50 text-slate-600 border-slate-200',
    },
    medium: {
        label: 'Medium',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    high: {
        label: 'High',
        color: 'bg-red-50 text-red-600 border-red-200',
    },
};

const selectTriggerClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300';

const selectContentClass =
    'border border-slate-200 bg-white text-slate-900 shadow-lg';

const selectItemClass =
    'cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Suspicious Users', href: '/admin/suspicious-users' },
];

const VIEW_LABELS: Record<string, string> = {
    all: 'All users',
    flagged: 'Manually flagged',
    detected: 'Auto-detected risk',
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function SuspiciousUsersIndex() {
    const { users, filters, roleOptions, viewOptions, stats } =
        usePage().props as Props;
    const [search, setSearch] = useState(filters.search);
    const [role, setRole] = useState(filters.role);
    const [view, setView] = useState(filters.view);

    const applyFilters = (e?: FormEvent) => {
        e?.preventDefault();
        router.get(
            adminSuspiciousUsersIndexPath(),
            { search, role, view },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setRole('');
        setView('all');
        router.get(
            adminSuspiciousUsersIndexPath(),
            { view: 'all' },
            { replace: true },
        );
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Suspicious Users" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Suspicious user monitoring
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                        Security signals, flagged accounts, and moderation actions
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4">
                        <div className="flex items-center gap-2 text-red-700">
                            <ShieldAlert className="h-4 w-4" />
                            <span className="text-[12px] font-semibold uppercase tracking-wide">
                                Flagged
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.flagged}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
                            Auto-detected
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.detected}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
                            Blocked accounts
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.blocked}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-indigo-700">
                            New accounts (7d)
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.new_accounts_week}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form onSubmit={applyFilters} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1.5 lg:col-span-2">
                                <label
                                    htmlFor="security-search"
                                    className="text-[12px] font-medium text-slate-600"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="security-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Name or email"
                                        className="h-10 border-slate-200 bg-white pl-9 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    View
                                </label>
                                <Select
                                    value={view || 'all'}
                                    onValueChange={setView}
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        {viewOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className={selectItemClass}
                                            >
                                                {VIEW_LABELS[option] ?? option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Role
                                </label>
                                <Select
                                    value={role || 'all'}
                                    onValueChange={(value) =>
                                        setRole(value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        <SelectItem value="all" className={selectItemClass}>
                                            All roles
                                        </SelectItem>
                                        {roleOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className={selectItemClass}
                                            >
                                                {option === 'job_seeker'
                                                    ? 'Job seeker'
                                                    : 'Employer'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-none hover:bg-slate-800"
                            >
                                Apply filters
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="h-10 rounded-lg border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50"
                            >
                                Clear
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Role</th>
                                    <th className="px-5 py-3">Risk</th>
                                    <th className="px-5 py-3">Signals</th>
                                    <th className="px-5 py-3">Activity</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            No users match this security view.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {user.name}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    {user.email}
                                                </p>
                                                <p className="text-[12px] text-slate-400">
                                                    Joined {formatDate(user.created_at)}
                                                </p>
                                                {user.is_flagged_suspicious && (
                                                    <span className="mt-1 inline-flex rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                                                        Flagged
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 capitalize text-[12px] text-slate-700">
                                                {user.roles.join(', ').replace('_', ' ')}
                                                <p className="mt-1 text-slate-500 capitalize">
                                                    {user.account_status}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${RISK_CFG[user.risk_level].color}`}
                                                >
                                                    {RISK_CFG[user.risk_level].label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-700">
                                                {user.signal_count} signal
                                                {user.signal_count !== 1 ? 's' : ''}
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-600">
                                                {user.applications_count} applications
                                                <br />
                                                {user.jobs_posted_count} jobs posted
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={adminSuspiciousUserShowPath(
                                                        user.id,
                                                    )}
                                                    className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Investigate
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-3">
                            {users.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`rounded-lg px-3 py-1.5 text-[12px] font-medium ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                        preserveScroll
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        key={i}
                                        className="px-2 text-slate-300"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
