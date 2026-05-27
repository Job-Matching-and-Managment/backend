import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Archive, Clock3, Search } from 'lucide-react';
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
    adminJobModerationIndexPath,
    adminJobModerationShowPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type ModerationStatus = 'pending' | 'approved' | 'rejected';

interface JobRow {
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
    created_at: string | null;
}

interface PaginatedJobs {
    data: JobRow[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    last_page: number;
}

interface Props {
    jobs: PaginatedJobs;
    filters: {
        search: string;
        status: string;
        archived: string;
        suspicious: string;
    };
    statusOptions: ModerationStatus[];
    stats: { pending: number; flagged: number; archived: number };
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Job Moderation', href: '/admin/job-moderation' },
];

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function JobModerationIndex() {
    const { jobs, filters, statusOptions, stats } = usePage().props as Props;
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [archived, setArchived] = useState(filters.archived);
    const [suspicious, setSuspicious] = useState(filters.suspicious);

    const applyFilters = (e?: FormEvent) => {
        e?.preventDefault();
        router.get(
            adminJobModerationIndexPath(),
            { search, status, archived, suspicious },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setArchived('');
        setSuspicious('');
        router.get(adminJobModerationIndexPath(), {}, { replace: true });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Moderation" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Job moderation
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                        {jobs.total} job post{jobs.total !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                        <div className="flex items-center gap-2 text-amber-700">
                            <Clock3 className="h-4 w-4" />
                            <span className="text-[12px] font-semibold uppercase tracking-wide">
                                Pending review
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.pending}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-[12px] font-semibold uppercase tracking-wide">
                                Flagged suspicious
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.flagged}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Archive className="h-4 w-4" />
                            <span className="text-[12px] font-semibold uppercase tracking-wide">
                                Archived
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.archived}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form onSubmit={applyFilters} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1.5 lg:col-span-2">
                                <label
                                    htmlFor="job-search"
                                    className="text-[12px] font-medium text-slate-600"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="job-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Title, location, employer, or company"
                                        className="h-10 border-slate-200 bg-white pl-9 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Moderation status
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
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Archived
                                </label>
                                <Select
                                    value={archived || 'all'}
                                    onValueChange={(value) =>
                                        setArchived(
                                            value === 'all'
                                                ? ''
                                                : value === 'yes'
                                                  ? 'yes'
                                                  : 'no',
                                        )
                                    }
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        <SelectItem value="all" className={selectItemClass}>
                                            All
                                        </SelectItem>
                                        <SelectItem value="yes" className={selectItemClass}>
                                            Archived only
                                        </SelectItem>
                                        <SelectItem value="no" className={selectItemClass}>
                                            Active only
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Suspicious
                                </label>
                                <Select
                                    value={suspicious || 'all'}
                                    onValueChange={(value) =>
                                        setSuspicious(
                                            value === 'all'
                                                ? ''
                                                : value === 'yes'
                                                  ? 'yes'
                                                  : 'no',
                                        )
                                    }
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        <SelectItem value="all" className={selectItemClass}>
                                            All
                                        </SelectItem>
                                        <SelectItem value="yes" className={selectItemClass}>
                                            Flagged only
                                        </SelectItem>
                                        <SelectItem value="no" className={selectItemClass}>
                                            Not flagged
                                        </SelectItem>
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
                        <table className="w-full min-w-[960px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-5 py-3">Job</th>
                                    <th className="px-5 py-3">Employer</th>
                                    <th className="px-5 py-3">Moderation</th>
                                    <th className="px-5 py-3">Flags</th>
                                    <th className="px-5 py-3">Applications</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            No job posts found.
                                        </td>
                                    </tr>
                                ) : (
                                    jobs.data.map((job) => (
                                        <tr
                                            key={job.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {job.title}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    {job.location} · {job.work_type} ·{' '}
                                                    {job.employment_type}
                                                </p>
                                                <p className="text-[12px] text-slate-400">
                                                    Posted {formatDate(job.created_at)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-[12px] text-slate-700">
                                                    {job.company_name || job.employer_name || '—'}
                                                </p>
                                                {job.company_name && job.employer_name && (
                                                    <p className="text-[12px] text-slate-500">
                                                        {job.employer_name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[job.moderation_status].color}`}
                                                >
                                                    {STATUS_CFG[job.moderation_status].label}
                                                </span>
                                                <p className="mt-1 text-[11px] text-slate-500 capitalize">
                                                    Listing: {job.status}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {job.is_flagged_suspicious && (
                                                        <span className="inline-flex rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                                                            Suspicious
                                                        </span>
                                                    )}
                                                    {job.is_archived && (
                                                        <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                            Archived
                                                        </span>
                                                    )}
                                                    {!job.is_flagged_suspicious &&
                                                        !job.is_archived && (
                                                            <span className="text-[12px] text-slate-400">
                                                                —
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-700">
                                                {job.applications_count}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={adminJobModerationShowPath(job.id)}
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

                    {jobs.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-3">
                            {jobs.links.map((link, i) =>
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
