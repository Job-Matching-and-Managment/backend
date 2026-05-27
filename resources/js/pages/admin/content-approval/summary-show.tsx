import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
    adminContentApprovalIndexPath,
    adminContentApprovalSummaryUpdatePath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface CvSummary {
    id: number;
    title: string;
    full_name: string | null;
    summary: string;
    summary_approval_status: ApprovalStatus;
    summary_moderation_notes: string | null;
    summary_moderated_at: string | null;
    owner_name: string | null;
    owner_email: string | null;
    updated_at: string | null;
}

interface Props {
    cv: CvSummary;
}

const STATUS_CFG: Record<ApprovalStatus, { label: string; color: string }> = {
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
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm';

const selectContentClass = 'border border-slate-200 bg-white text-slate-900 shadow-lg';

const selectItemClass =
    'cursor-pointer text-slate-900 focus:bg-slate-100 focus:text-slate-900';

export default function ContentApprovalSummaryShow() {
    const { cv } = usePage().props as Props;

    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(
        cv.summary_approval_status,
    );
    const [notes, setNotes] = useState(cv.summary_moderation_notes ?? '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        {
            title: 'Content Approval',
            href: adminContentApprovalIndexPath('summaries'),
        },
        { title: cv.title, href: '#' },
    ];

    const submit = () => {
        if (!confirm('Save CV summary approval?')) return;

        router.patch(adminContentApprovalSummaryUpdatePath(cv.id), {
            summary_approval_status: approvalStatus,
            summary_moderation_notes: notes,
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`CV Summary — ${cv.title}`} />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Link
                    href={adminContentApprovalIndexPath('summaries')}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to CV summaries
                </Link>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{cv.title}</h1>
                            <p className="mt-1 text-[13px] text-slate-500">
                                {cv.full_name || cv.owner_name} · {cv.owner_email}
                            </p>
                        </div>
                        <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-[12px] font-semibold ${STATUS_CFG[cv.summary_approval_status].color}`}
                        >
                            {STATUS_CFG[cv.summary_approval_status].label}
                        </span>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Professional summary
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800">
                            {cv.summary}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">Summary moderation</h2>
                    <div className="mt-6 max-w-md space-y-2">
                        <Label className="text-[12px] text-slate-600">Approval status</Label>
                        <Select
                            value={approvalStatus}
                            onValueChange={(v) => setApprovalStatus(v as ApprovalStatus)}
                        >
                            <SelectTrigger className={selectTriggerClass}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={selectContentClass}>
                                {(['pending', 'approved', 'rejected'] as const).map(
                                    (option) => (
                                        <SelectItem
                                            key={option}
                                            value={option}
                                            className={selectItemClass}
                                        >
                                            {STATUS_CFG[option].label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-6 space-y-2">
                        <Label htmlFor="summary-notes" className="text-[12px] text-slate-600">
                            Moderation notes
                        </Label>
                        <textarea
                            id="summary-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                            placeholder="Policy issues, edits required, etc."
                        />
                    </div>
                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <Button
                            type="button"
                            onClick={submit}
                            className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Save review
                        </Button>
                    </div>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
