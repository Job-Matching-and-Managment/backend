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
    adminCompanyVerificationShowPath,
    adminCompanyVerificationsIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface CompanyRow {
    id: number;
    name: string;
    email: string;
    company_name: string | null;
    company_phone: string | null;
    company_contact_email: string | null;
    company_tin_number: string | null;
    company_verification_status: VerificationStatus;
    business_license_status: VerificationStatus;
    company_submitted_at: string | null;
}

interface PaginatedCompanies {
    data: CompanyRow[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    last_page: number;
}

interface Props {
    companies: PaginatedCompanies;
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
    { title: 'Company Verification', href: '/admin/company-verifications' },
];

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function CompanyVerificationsIndex() {
    const { companies, filters, statusOptions } = usePage().props as Props;
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    const applyFilters = (e?: FormEvent) => {
        e?.preventDefault();
        router.get(
            adminCompanyVerificationsIndexPath(),
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get(adminCompanyVerificationsIndexPath(), {}, { replace: true });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Company Verification" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Company verification
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                        {companies.total} company profile
                        {companies.total !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form onSubmit={applyFilters} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5 md:col-span-2">
                                <label
                                    htmlFor="company-search"
                                    className="text-[12px] font-medium text-slate-600"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="company-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Company, email, or TIN"
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
                        <table className="w-full min-w-[900px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-5 py-3">Company</th>
                                    <th className="px-5 py-3">Contact</th>
                                    <th className="px-5 py-3">TIN</th>
                                    <th className="px-5 py-3">Company status</th>
                                    <th className="px-5 py-3">License</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            No company verification requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    companies.data.map((company) => (
                                        <tr
                                            key={company.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {company.company_name || company.name}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    Owner: {company.name}
                                                </p>
                                                <p className="text-[12px] text-slate-400">
                                                    Submitted: {formatDate(company.company_submitted_at)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-[12px] text-slate-700">
                                                    {company.company_phone || '—'}
                                                </p>
                                                <p className="text-[12px] text-slate-500">
                                                    {company.company_contact_email || company.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] text-slate-700">
                                                {company.company_tin_number || '—'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[company.company_verification_status].color}`}
                                                >
                                                    {STATUS_CFG[company.company_verification_status].label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[company.business_license_status].color}`}
                                                >
                                                    {STATUS_CFG[company.business_license_status].label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={adminCompanyVerificationShowPath(
                                                        company.id,
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

                    {companies.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-3">
                            {companies.links.map((link, i) =>
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
