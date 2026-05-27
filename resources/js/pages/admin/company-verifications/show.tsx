import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Ban, Clock3 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
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
    adminCompanyVerificationUpdatePath,
    adminCompanyVerificationsIndexPath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface Company {
    id: number;
    name: string;
    email: string;
    company_name: string | null;
    company_description: string | null;
    company_website: string | null;
    company_logo: string | null;
    company_phone: string | null;
    company_contact_email: string | null;
    company_tin_number: string | null;
    business_license_path: string | null;
    business_license_status: VerificationStatus;
    company_verification_status: VerificationStatus;
    company_verification_notes: string | null;
    company_submitted_at: string | null;
    company_verified_at: string | null;
    kyc_verified: boolean;
    tin_verified: boolean;
    company_info_verified: boolean;
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
    company: Company;
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

export default function CompanyVerificationShow() {
    const { company, stats, recentJobs } = usePage().props as Props;

    const [companyStatus, setCompanyStatus] = useState<VerificationStatus>(
        company.company_verification_status,
    );
    const [licenseStatus, setLicenseStatus] = useState<VerificationStatus>(
        company.business_license_status,
    );
    const [kycVerified, setKycVerified] = useState(company.kyc_verified);
    const [tinVerified, setTinVerified] = useState(company.tin_verified);
    const [companyInfoVerified, setCompanyInfoVerified] = useState(
        company.company_info_verified,
    );
    const [companyTinNumber, setCompanyTinNumber] = useState(
        company.company_tin_number ?? '',
    );
    const [companyPhone, setCompanyPhone] = useState(company.company_phone ?? '');
    const [companyContactEmail, setCompanyContactEmail] = useState(
        company.company_contact_email ?? '',
    );
    const [notes, setNotes] = useState(company.company_verification_notes ?? '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Company Verification', href: adminCompanyVerificationsIndexPath() },
        { title: company.company_name || company.name, href: '#' },
    ];

    const submit = () => {
        if (!confirm('Save company verification review updates?')) return;

        router.patch(adminCompanyVerificationUpdatePath(company.id), {
            company_verification_status: companyStatus,
            business_license_status: licenseStatus,
            kyc_verified: kycVerified,
            tin_verified: tinVerified,
            company_info_verified: companyInfoVerified,
            company_verification_notes: notes,
            company_tin_number: companyTinNumber,
            company_phone: companyPhone,
            company_contact_email: companyContactEmail,
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Company Verification — ${company.company_name || company.name}`} />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Link
                    href={adminCompanyVerificationsIndexPath()}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to company verification
                </Link>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {company.company_name || company.name}
                            </h1>
                            <p className="mt-0.5 text-[13px] text-slate-500">
                                {company.name} · {company.email}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span
                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[companyStatus].color}`}
                                >
                                    Company: {STATUS_CFG[companyStatus].label}
                                </span>
                                <span
                                    className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[licenseStatus].color}`}
                                >
                                    License: {STATUS_CFG[licenseStatus].label}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                                <p className="font-semibold text-slate-900">{stats.jobs_posted}</p>
                                <p className="text-slate-500">Jobs posted</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                                <p className="font-semibold text-slate-900">{stats.open_jobs}</p>
                                <p className="text-slate-500">Open jobs</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="company_name">Company name</Label>
                                    <Input
                                        id="company_name"
                                        value={company.company_name ?? ''}
                                        readOnly
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="company_website">Website</Label>
                                    <Input
                                        id="company_website"
                                        value={company.company_website ?? ''}
                                        readOnly
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="company_phone">Phone</Label>
                                    <Input
                                        id="company_phone"
                                        value={companyPhone}
                                        onChange={(e) => setCompanyPhone(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="company_contact_email">Company email</Label>
                                    <Input
                                        id="company_contact_email"
                                        value={companyContactEmail}
                                        onChange={(e) =>
                                            setCompanyContactEmail(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="company_tin_number">TIN number</Label>
                                    <Input
                                        id="company_tin_number"
                                        value={companyTinNumber}
                                        onChange={(e) => setCompanyTinNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="business_license_path">Business license file</Label>
                                    <Input
                                        id="business_license_path"
                                        value={company.business_license_path ?? ''}
                                        readOnly
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Company verification status</Label>
                                    <Select
                                        value={companyStatus}
                                        onValueChange={(value: VerificationStatus) =>
                                            setCompanyStatus(value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Business license review</Label>
                                    <Select
                                        value={licenseStatus}
                                        onValueChange={(value: VerificationStatus) =>
                                            setLicenseStatus(value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[13px]">
                                    <input
                                        type="checkbox"
                                        checked={kycVerified}
                                        onChange={(e) => setKycVerified(e.target.checked)}
                                    />
                                    KYC verified
                                </label>
                                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[13px]">
                                    <input
                                        type="checkbox"
                                        checked={tinVerified}
                                        onChange={(e) => setTinVerified(e.target.checked)}
                                    />
                                    TIN verified
                                </label>
                                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[13px]">
                                    <input
                                        type="checkbox"
                                        checked={companyInfoVerified}
                                        onChange={(e) =>
                                            setCompanyInfoVerified(e.target.checked)
                                        }
                                    />
                                    Company info validated
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="verification_notes">Review notes</Label>
                                <textarea
                                    id="verification_notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                    placeholder="Document checks, concerns, and decision rationale."
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={submit}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800"
                                >
                                    <BadgeCheck className="h-4 w-4" />
                                    Save review
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCompanyStatus('approved')}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                >
                                    <BadgeCheck className="h-4 w-4" />
                                    Mark approved
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCompanyStatus('rejected')}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-100"
                                >
                                    <Ban className="h-4 w-4" />
                                    Mark rejected
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCompanyStatus('pending')}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700 hover:bg-amber-100"
                                >
                                    <Clock3 className="h-4 w-4" />
                                    Mark pending
                                </button>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-3 text-[13px] font-semibold text-slate-700">
                                Recent jobs
                            </h2>
                            {recentJobs.length === 0 ? (
                                <p className="text-[12px] text-slate-400">No jobs posted yet.</p>
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
                                Submitted:{' '}
                                <span className="font-medium text-slate-800">
                                    {formatDate(company.company_submitted_at)}
                                </span>
                                <br />
                                Verified:{' '}
                                <span className="font-medium text-slate-800">
                                    {formatDate(company.company_verified_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
