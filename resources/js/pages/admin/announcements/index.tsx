import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Megaphone, Search } from 'lucide-react';
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
    adminAnnouncementVisibilityPath,
    adminAnnouncementsIndexPath,
    adminAnnouncementsStorePath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type Audience = 'all' | 'employer' | 'job_seeker';

interface AnnouncementRow {
    id: number;
    title: string;
    body: string;
    audience: Audience;
    is_visible: boolean;
    recipients_count: number;
    creator_name: string | null;
    published_at: string | null;
}

interface Props {
    announcements: {
        data: AnnouncementRow[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        last_page: number;
    };
    filters: { search: string; audience: string; visibility: string };
    audienceOptions: Audience[];
    stats: { visible: number; hidden: number; sent_today: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Announcements', href: '/admin/announcements' },
];

const selectTriggerClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus:border-slate-400 focus:ring-1 focus:ring-slate-300';
const selectContentClass =
    'border border-slate-200 bg-white text-slate-900 shadow-lg';
const selectItemClass =
    'cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900';

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function AnnouncementIndex() {
    const { announcements, filters, audienceOptions, stats } =
        usePage().props as Props;
    const [search, setSearch] = useState(filters.search);
    const [audience, setAudience] = useState(filters.audience);
    const [visibility, setVisibility] = useState(filters.visibility);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [newAudience, setNewAudience] = useState<Audience>('all');

    const applyFilters = (e?: FormEvent) => {
        e?.preventDefault();
        router.get(
            adminAnnouncementsIndexPath(),
            { search, audience, visibility },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setAudience('');
        setVisibility('');
        router.get(adminAnnouncementsIndexPath(), {}, { replace: true });
    };

    const publishAnnouncement = (e: FormEvent) => {
        e.preventDefault();
        router.post(adminAnnouncementsStorePath(), {
            title,
            body,
            audience: newAudience,
        });
        setTitle('');
        setBody('');
        setNewAudience('all');
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Announcements
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                        Publish system announcements and control alert visibility.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-emerald-700">
                            Visible
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.visible}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
                            Hidden
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.hidden}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-indigo-700">
                            Sent today
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.sent_today}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Megaphone className="h-4 w-4" />
                        Publish announcement
                    </h2>
                    <form onSubmit={publishAnnouncement} className="mt-4 space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title"
                            className="h-10 border-slate-200 bg-white text-slate-900 shadow-sm"
                            required
                        />
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                            placeholder="Announcement content..."
                            required
                        />
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="w-full max-w-xs space-y-1">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Audience
                                </label>
                                <Select
                                    value={newAudience}
                                    onValueChange={(value) =>
                                        setNewAudience(value as Audience)
                                    }
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        <SelectItem value="all" className={selectItemClass}>
                                            All users
                                        </SelectItem>
                                        <SelectItem
                                            value="employer"
                                            className={selectItemClass}
                                        >
                                            Employers
                                        </SelectItem>
                                        <SelectItem
                                            value="job_seeker"
                                            className={selectItemClass}
                                        >
                                            Job seekers
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                type="submit"
                                className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Publish
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form onSubmit={applyFilters} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-2">
                                <label
                                    htmlFor="announcement-search"
                                    className="text-[12px] font-medium text-slate-600"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="announcement-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search title or body"
                                        className="h-10 border-slate-200 bg-white pl-9 text-slate-900 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Audience
                                </label>
                                <Select
                                    value={audience || 'all_audience'}
                                    onValueChange={(value) =>
                                        setAudience(
                                            value === 'all_audience' ? '' : value,
                                        )
                                    }
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        <SelectItem
                                            value="all_audience"
                                            className={selectItemClass}
                                        >
                                            All audiences
                                        </SelectItem>
                                        {audienceOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className={selectItemClass}
                                            >
                                                {option === 'all'
                                                    ? 'All users'
                                                    : option === 'job_seeker'
                                                      ? 'Job seekers'
                                                      : 'Employers'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-slate-600">
                                    Visibility
                                </label>
                                <Select
                                    value={visibility || 'all_visibility'}
                                    onValueChange={(value) =>
                                        setVisibility(
                                            value === 'all_visibility' ? '' : value,
                                        )
                                    }
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClass}>
                                        <SelectItem
                                            value="all_visibility"
                                            className={selectItemClass}
                                        >
                                            All
                                        </SelectItem>
                                        <SelectItem
                                            value="visible"
                                            className={selectItemClass}
                                        >
                                            Visible
                                        </SelectItem>
                                        <SelectItem
                                            value="hidden"
                                            className={selectItemClass}
                                        >
                                            Hidden
                                        </SelectItem>
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
                        <table className="w-full min-w-[980px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-5 py-3">Announcement</th>
                                    <th className="px-5 py-3">Audience</th>
                                    <th className="px-5 py-3">Recipients</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            No announcements found.
                                        </td>
                                    </tr>
                                ) : (
                                    announcements.data.map((announcement) => (
                                        <tr
                                            key={announcement.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {announcement.title}
                                                </p>
                                                <p className="line-clamp-2 text-[12px] text-slate-600">
                                                    {announcement.body}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {formatDate(announcement.published_at)} · by{' '}
                                                    {announcement.creator_name || 'Admin'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-700">
                                                {announcement.audience === 'all'
                                                    ? 'All users'
                                                    : announcement.audience === 'job_seeker'
                                                      ? 'Job seekers'
                                                      : 'Employers'}
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-700">
                                                {announcement.recipients_count}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                                                        announcement.is_visible
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            : 'border-slate-200 bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {announcement.is_visible
                                                        ? 'Visible'
                                                        : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.patch(
                                                            adminAnnouncementVisibilityPath(
                                                                announcement.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                    className="h-8 rounded-md border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50"
                                                >
                                                    {announcement.is_visible
                                                        ? 'Hide'
                                                        : 'Show'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {announcements.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-3">
                            {announcements.links.map((link, i) =>
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
