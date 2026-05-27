import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    adminUserShowPath,
    adminUsersIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type AccountStatus = 'active' | 'suspended' | 'blocked';

interface UserRow {
    id: number;
    name: string;
    email: string;
    roles: string[];
    account_status: AccountStatus;
    email_verified_at: string | null;
    created_at: string | null;
    company_name: string | null;
}

interface PaginatedUsers {
    data: UserRow[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    users: PaginatedUsers;
    filters: { search: string; role: string; status: string };
    roleOptions: string[];
    statusOptions: AccountStatus[];
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

const selectTriggerClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 dark:border-slate-200 dark:bg-white dark:text-slate-900';

const selectContentClass =
    'border border-slate-200 bg-white text-slate-900 shadow-lg dark:border-slate-200 dark:bg-white dark:text-slate-900';

const selectItemClass =
    'cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-900 dark:focus:bg-slate-100';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function AdminUsersIndex() {
    const { users, filters, roleOptions, statusOptions } =
        usePage().props as unknown as Props;

    const [search, setSearch] = useState(filters.search);
    const [role, setRole] = useState(filters.role);
    const [status, setStatus] = useState(filters.status);

    const applyFilters = (e?: FormEvent) => {
        e?.preventDefault();
        router.get(
            adminUsersIndexPath(),
            { search, role, status },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setRole('');
        setStatus('');
        router.get(adminUsersIndexPath(), {}, { replace: true });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        User management
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                        {users.total} user{users.total !== 1 ? 's' : ''} on the
                        platform
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-200 dark:bg-white">
                    <form
                        onSubmit={applyFilters}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-1">
                                <label
                                    htmlFor="user-search"
                                    className="text-[12px] font-medium text-slate-600"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="user-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Name or email"
                                        className="h-10 border-slate-200 bg-white pl-9 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300 dark:border-slate-200 dark:bg-white dark:text-slate-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Role
                                </label>
                                <Select
                                    value={role || 'all'}
                                    onValueChange={(v) =>
                                        setRole(v === 'all' ? '' : v)
                                    }
                                >
                                    <SelectTrigger
                                        className={selectTriggerClass}
                                    >
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className={selectContentClass}
                                    >
                                        <SelectItem
                                            value="all"
                                            className={selectItemClass}
                                        >
                                            All roles
                                        </SelectItem>
                                        {roleOptions.map((r) => (
                                            <SelectItem
                                                key={r}
                                                value={r}
                                                className={selectItemClass}
                                            >
                                                {ROLE_LABELS[r] ?? r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Status
                                </label>
                                <Select
                                    value={status || 'all'}
                                    onValueChange={(v) =>
                                        setStatus(v === 'all' ? '' : v)
                                    }
                                >
                                    <SelectTrigger
                                        className={selectTriggerClass}
                                    >
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className={selectContentClass}
                                    >
                                        <SelectItem
                                            value="all"
                                            className={selectItemClass}
                                        >
                                            All statuses
                                        </SelectItem>
                                        {statusOptions.map((s) => (
                                            <SelectItem
                                                key={s}
                                                value={s}
                                                className={selectItemClass}
                                            >
                                                {STATUS_CFG[s].label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-none hover:bg-slate-800 focus-visible:ring-1 focus-visible:ring-slate-400"
                            >
                                Apply filters
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="h-10 rounded-lg border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-1 focus-visible:ring-slate-300 dark:border-slate-200 dark:bg-white dark:text-slate-700"
                            >
                                Clear
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-sidebar">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900/40">
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Role</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Joined</th>
                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            No users match your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 dark:border-slate-800/80"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    {user.email}
                                                </p>
                                                {user.company_name && (
                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        {user.company_name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                                    {ROLE_LABELS[
                                                        user.roles[0] ?? ''
                                                    ] ??
                                                        user.roles[0] ??
                                                        '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[user.account_status].color}`}
                                                >
                                                    {
                                                        STATUS_CFG[
                                                            user.account_status
                                                        ].label
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={adminUserShowPath(
                                                        user.id,
                                                    )}
                                                    className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
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
