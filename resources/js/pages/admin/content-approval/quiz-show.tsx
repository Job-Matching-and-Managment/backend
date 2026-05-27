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
    adminContentApprovalQuizUpdatePath,
} from '@/lib/admin-path';
import type { BreadcrumbItem } from '@/types';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface QuizOption {
    id: number;
    option_text: string;
    is_correct: boolean;
}

interface QuizQuestion {
    id: number;
    question: string;
    explanation: string | null;
    options: QuizOption[];
}

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    skill_name: string;
    category: string;
    difficulty: string;
    approval_status: ApprovalStatus;
    is_ai_generated: boolean;
    questions_count: number;
    owner_name: string | null;
    owner_email: string | null;
    content_moderation_notes: string | null;
    content_moderated_at: string | null;
    questions: QuizQuestion[];
}

interface Props {
    quiz: Quiz;
    contentType: 'ai_quiz' | 'platform_quiz';
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

export default function ContentApprovalQuizShow() {
    const { quiz, contentType } = usePage().props as Props;
    const listType = contentType === 'ai_quiz' ? 'quizzes' : 'platform';

    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(
        quiz.approval_status,
    );
    const [notes, setNotes] = useState(quiz.content_moderation_notes ?? '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        {
            title: 'Content Approval',
            href: adminContentApprovalIndexPath(listType),
        },
        { title: quiz.title, href: '#' },
    ];

    const submit = () => {
        if (!confirm('Save content approval for this quiz?')) return;

        router.patch(adminContentApprovalQuizUpdatePath(quiz.id), {
            approval_status: approvalStatus,
            content_moderation_notes: notes,
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Content Approval — ${quiz.title}`} />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Link
                    href={adminContentApprovalIndexPath(listType)}
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to content approval
                </Link>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {quiz.title}
                            </h1>
                            <p className="mt-1 text-[13px] text-slate-500">
                                {quiz.is_ai_generated ? 'AI-generated quiz' : 'Platform quiz'}{' '}
                                · {quiz.skill_name}
                            </p>
                            {quiz.owner_name && (
                                <p className="mt-1 text-[12px] text-slate-400">
                                    Owner: {quiz.owner_name} ({quiz.owner_email})
                                </p>
                            )}
                        </div>
                        <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-[12px] font-semibold ${STATUS_CFG[quiz.approval_status].color}`}
                        >
                            {STATUS_CFG[quiz.approval_status].label}
                        </span>
                    </div>

                    {quiz.description && (
                        <p className="mt-4 text-[13px] leading-relaxed text-slate-700">
                            {quiz.description}
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">
                        Questions ({quiz.questions.length})
                    </h2>
                    <div className="mt-4 space-y-6">
                        {quiz.questions.map((question, index) => (
                            <div
                                key={question.id}
                                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                            >
                                <p className="text-[12px] font-semibold text-slate-500">
                                    Question {index + 1}
                                </p>
                                <p className="mt-1 font-medium text-slate-900">
                                    {question.question}
                                </p>
                                <ul className="mt-3 space-y-1">
                                    {question.options.map((option) => (
                                        <li
                                            key={option.id}
                                            className={`rounded-lg px-3 py-1.5 text-[13px] ${
                                                option.is_correct
                                                    ? 'bg-emerald-50 font-semibold text-emerald-800'
                                                    : 'text-slate-700'
                                            }`}
                                        >
                                            {option.option_text}
                                            {option.is_correct && ' ✓'}
                                        </li>
                                    ))}
                                </ul>
                                {question.explanation && (
                                    <p className="mt-2 text-[12px] text-slate-500">
                                        {question.explanation}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">Moderation review</h2>
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
                        <Label htmlFor="quiz-notes" className="text-[12px] text-slate-600">
                            Moderation notes
                        </Label>
                        <textarea
                            id="quiz-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                            placeholder="Reason for approval or rejection…"
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
