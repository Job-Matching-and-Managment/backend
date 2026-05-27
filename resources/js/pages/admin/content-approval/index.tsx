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
    adminContentApprovalIndexPath,
    adminContentApprovalQuizShowPath,
    adminContentApprovalSummaryShowPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type ContentType = 'quizzes' | 'summaries' | 'platform';

interface QuizItem {
    id: number;
    title: string;
    skill_name: string;
    category: string;
    difficulty: string;
    approval_status: ApprovalStatus;
    is_ai_generated: boolean;
    questions_count: number;
    owner_name: string | null;
    owner_email: string | null;
    created_at: string | null;
}

interface SummaryItem {
    id: number;
    title: string;
    full_name: string | null;
    summary_preview: string;
    summary_approval_status: ApprovalStatus;
    owner_name: string | null;
    owner_email: string | null;
    updated_at: string | null;
}

interface PaginatedItems<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    last_page: number;
}

interface Props {
    type: ContentType;
    items: PaginatedItems<QuizItem> | PaginatedItems<SummaryItem>;
    filters: { search: string; status: string };
    statusOptions: ApprovalStatus[];
    stats: Record<string, number>;
}

const STATUS_CFG: Record<
    ApprovalStatus,
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

const TAB_LABELS: Record<ContentType, string> = {
    quizzes: 'AI quizzes',
    summaries: 'CV summaries',
    platform: 'Platform quizzes',
};

const selectTriggerClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300';

const selectContentClass =
    'border border-slate-200 bg-white text-slate-900 shadow-lg';

const selectItemClass =
    'cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Content Approval', href: '/admin/content-approval' },
];

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ContentApprovalIndex() {
    const { type, items, filters, statusOptions, stats } = usePage().props as Props;
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    const switchTab = (tab: ContentType) => {
        router.get(
            adminContentApprovalIndexPath(tab),
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const applyFilters = (e?: FormEvent) => {
        e?.preventDefault();
        router.get(
            adminContentApprovalIndexPath(type),
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get(adminContentApprovalIndexPath(type), {}, { replace: true });
    };

    const isSummaries = type === 'summaries';

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Content Approval" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Content approval
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                        Review AI quizzes, CV summaries, and platform quiz content
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(['quizzes', 'summaries', 'platform'] as ContentType[]).map(
                        (tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => switchTab(tab)}
                                className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
                                    type === tab
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {TAB_LABELS[tab]}
                            </button>
                        ),
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-700">
                            Pending
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.pending ?? 0}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-emerald-700">
                            Approved
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.approved ?? 0}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-red-700">
                            Rejected
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.rejected ?? 0}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form onSubmit={applyFilters} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-2">
                                <label
                                    htmlFor="content-search"
                                    className="text-[12px] font-medium text-slate-600"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="content-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={
                                            isSummaries
                                                ? 'CV title, name, or owner'
                                                : 'Quiz title, skill, or owner'
                                        }
                                        className="h-10 border-slate-200 bg-white pl-9 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Status
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
                                className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Apply filters
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="h-10 rounded-lg border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Clear
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[880px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-5 py-3">
                                        {isSummaries ? 'CV / summary' : 'Quiz'}
                                    </th>
                                    <th className="px-5 py-3">Owner</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            No content items found.
                                        </td>
                                    </tr>
                                ) : isSummaries ? (
                                    (items.data as SummaryItem[]).map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-[12px] text-slate-600">
                                                    {item.summary_preview}
                                                </p>
                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    Updated {formatDate(item.updated_at)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-700">
                                                {item.owner_name || item.full_name || '—'}
                                                <p className="text-slate-500">
                                                    {item.owner_email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[item.summary_approval_status].color}`}
                                                >
                                                    {
                                                        STATUS_CFG[
                                                            item.summary_approval_status
                                                        ].label
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={adminContentApprovalSummaryShowPath(
                                                        item.id,
                                                    )}
                                                    className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    (items.data as QuizItem[]).map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {item.title}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    {item.skill_name} · {item.questions_count}{' '}
                                                    questions
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {formatDate(item.created_at)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-700">
                                                {item.owner_name || 'Platform'}
                                                {item.owner_email && (
                                                    <p className="text-slate-500">
                                                        {item.owner_email}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[item.approval_status].color}`}
                                                >
                                                    {STATUS_CFG[item.approval_status].label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={adminContentApprovalQuizShowPath(
                                                        item.id,
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

                    {items.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-3">
                            {items.links.map((link, i) =>
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
