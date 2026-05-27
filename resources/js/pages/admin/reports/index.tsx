import { Head, usePage } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

interface CountItem {
    name: string;
    count: number;
}

interface JobRow {
    id: number;
    title: string;
    employer: string | null;
    applications_count: number;
    status: string;
}

interface EmployerRow {
    id: number;
    name: string;
    company_name: string | null;
    vacancies_count: number;
}

interface Props {
    highlights: {
        total_users: number;
        total_jobs: number;
        total_applications: number;
        hired_count: number;
    };
    series: {
        users_monthly: CountItem[];
        jobs_monthly: CountItem[];
        applications_monthly: CountItem[];
        hiring_funnel: CountItem[];
    };
    breakdowns: {
        jobs_by_work_type: CountItem[];
        jobs_by_employment_type: CountItem[];
    };
    tables: {
        applications_per_job: JobRow[];
        employer_activity: EmployerRow[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-[13px] text-slate-500">{label}</p>
        </div>
    );
}

function ChartCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-[14px] font-semibold text-slate-700">{title}</h2>
            {children}
        </div>
    );
}

export default function AdminReportsPage() {
    const { highlights, series, breakdowns, tables } = usePage().props as unknown as Props;

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />
            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard label="Total users" value={highlights.total_users} />
                    <StatCard label="Total jobs" value={highlights.total_jobs} />
                    <StatCard
                        label="Total applications"
                        value={highlights.total_applications}
                    />
                    <StatCard label="Hired candidates" value={highlights.hired_count} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ChartCard title="Users by month">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={series.users_monthly}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Jobs by month">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={series.jobs_monthly}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <ChartCard title="Applications by month">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={series.applications_monthly}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Hiring funnel">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={series.hiring_funnel}
                                    dataKey="count"
                                    nameKey="name"
                                    outerRadius={82}
                                >
                                    {series.hiring_funnel.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Work type split">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={breakdowns.jobs_by_work_type}
                                    dataKey="count"
                                    nameKey="name"
                                    outerRadius={82}
                                >
                                    {breakdowns.jobs_by_work_type.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-[14px] font-semibold text-slate-700">
                            Top jobs by applications
                        </h2>
                        <div className="space-y-3">
                            {tables.applications_per_job.map((row) => (
                                <div key={row.id} className="rounded-lg border border-slate-100 p-3">
                                    <p className="font-medium text-slate-900">{row.title}</p>
                                    <p className="text-[12px] text-slate-500">
                                        {row.employer ?? 'Unknown employer'} · {row.applications_count}{' '}
                                        applications
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-[14px] font-semibold text-slate-700">
                            Employer activity
                        </h2>
                        <div className="space-y-3">
                            {tables.employer_activity.map((row) => (
                                <div key={row.id} className="rounded-lg border border-slate-100 p-3">
                                    <p className="font-medium text-slate-900">
                                        {row.company_name || row.name}
                                    </p>
                                    <p className="text-[12px] text-slate-500">
                                        {row.vacancies_count} job posts
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
