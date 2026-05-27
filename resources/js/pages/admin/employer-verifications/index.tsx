import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
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
    adminEmployerVerificationShowPath,
    adminEmployerVerificationsIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface EmployerRow {
    id: number;
    name: string;
    email: string;
    company_name: string | null;
    company_website: string | null;
    verification_status: VerificationStatus;
    submitted_at: string | null;
    verified_at: string | null;
    created_at: string | null;
}

interface PaginatedEmployers {
    data: EmployerRow[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    last_page: number;
}

interface Props {
    employers: PaginatedEmployers;
    filters: { search: string; status: string };
    statusOptions: VerificationStatus[];
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

const selectTriggerClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300';

const selectContentClass =
    'border border-slate-200 bg-white text-slate-900 shadow-lg';

const selectItemClass =
    'cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Employer Verification', href: '/admin/employer-verifications' },
];

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function EmployerVerificationsIndex() {
    const { employers, filters, statusOptions } = usePage().props as Props;

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    const applyFilters = (e?: FormEvent) => {
        e?.preventDefault();
        router.get(
            adminEmployerVerificationsIndexPath(),
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get(adminEmployerVerificationsIndexPath(), {}, { replace: true });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Employer Verification" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Employer verification
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                        {employers.total} employer request
                        {employers.total !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form onSubmit={applyFilters} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-2">
                                <label
                                    htmlFor="employer-search"
                                    className="text-[12px] font-medium text-slate-600"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="employer-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Employer, email, or company"
                                        className="h-10 border-slate-200 bg-white pl-9 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Verification status
                                </label>
                                <Select
                                    value={status || 'all'}
                                    onValueChange={(value) =>
                                        setStatus(value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        <SelectItem value="all" className={selectItemClass}>
                                            All statuses
                                        </SelectItem>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className={selectItemClass}
                                            >
                                                {STATUS_CFG[option].label}
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
                                className="h-10 rounded-lg border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50 focus-visible:ring-1 focus-visible:ring-slate-300"
                            >
                                Clear
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-sidebar">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-5 py-3">Employer</th>
                                    <th className="px-5 py-3">Company</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Submitted</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employers.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            No employer requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    employers.data.map((employer) => (
                                        <tr
                                            key={employer.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {employer.name}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    {employer.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-700">
                                                    {employer.company_name || '—'}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    {employer.company_website || '—'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[employer.verification_status].color}`}
                                                >
                                                    {STATUS_CFG[employer.verification_status].label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {formatDate(employer.submitted_at)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={adminEmployerVerificationShowPath(
                                                        employer.id,
                                                    )}
                                                    className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {employers.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-3">
                            {employers.links.map((link, i) =>
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
