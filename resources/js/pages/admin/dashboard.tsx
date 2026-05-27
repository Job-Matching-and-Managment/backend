import { Head, usePage } from '@inertiajs/react';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Area,
    AreaChart,
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
import {
    Briefcase,
    Building2,
    CheckCircle,
    UserCircle,
    Users,
    XCircle,
} from 'lucide-react';

interface Stats {
    totalUsers: number;
    employerCount: number;
    jobSeekerCount: number;
    adminCount: number;
    totalJobs: number;
    openJobs: number;
    closedJobs: number;
    totalApplications: number;
    newUsersThisWeek: number;
    newJobsThisWeek: number;
    newApplicationsThisWeek: number;
}

interface CountItem {
    status?: string;
    role?: string;
    count: number;
}

interface TimeItem {
    date: string;
    count: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at: string | null;
}

interface RecentJob {
    id: number;
    title: string;
    status: string;
    employer_name: string | null;
    created_at: string | null;
}

interface RecentApplication {
    id: number;
    status: string;
    applicant_name: string | null;
    job_title: string | null;
    created_at: string | null;
}

interface Props {
    stats: Stats;
    usersByRole: CountItem[];
    statusBreakdown: CountItem[];
    usersOverTime: TimeItem[];
    applicationsOverTime: TimeItem[];
    jobsPerStatus: CountItem[];
    recentActivity: {
        users: RecentUser[];
        jobs: RecentJob[];
        applications: RecentApplication[];
    };
}

const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    applied: '#3b82f6',
    shortlisted: '#8b5cf6',
    hired: '#10b981',
    rejected: '#ef4444',
};

const ROLE_COLORS: Record<string, string> = {
    employer: '#3b82f6',
    job_seeker: '#10b981',
    admin: '#8b5cf6',
};

const JOB_STATUS_COLORS: Record<string, string> = {
    open: '#10b981',
    closed: '#94a3b8',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    hired: 'Hired',
    rejected: 'Rejected',
};

const ROLE_LABELS: Record<string, string> = {
    employer: 'Employers',
    job_seeker: 'Job seekers',
    admin: 'Admins',
};

const JOB_STATUS_LABELS: Record<string, string> = {
    open: 'Open',
    closed: 'Closed',
};

const AREA_COLOR = '#6366f1';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
];

function StatCard({
    label,
    value,
    icon: Icon,
    accent,
    sub,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    accent: string;
    sub?: string;
}) {
    return (
        <div className="flex items-center gap-5 rounded-2xl border border-sidebar-border/70 bg-white px-6 py-5 shadow-sm dark:border-sidebar-border dark:bg-sidebar">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-2xl leading-tight font-bold text-slate-900 dark:text-white">
                    {value}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
                    {label}
                </p>
                {sub && (
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                        {sub}
                    </p>
                )}
            </div>
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
        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-sidebar">
            <h2 className="mb-5 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                {title}
            </h2>
            {children}
        </div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {label && (
                <p className="mb-1 text-slate-500 dark:text-slate-400">
                    {label}
                </p>
            )}
            {payload.map((p: any, i: number) => (
                <p
                    key={i}
                    style={{ color: p.color ?? p.fill }}
                    className="font-semibold"
                >
                    {p.name ? `${p.name}: ` : ''}
                    {p.value}
                </p>
            ))}
        </div>
    );
}

function PieLabel({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: any) {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex h-[180px] items-center justify-center text-[13px] text-slate-400 dark:text-slate-500">
            {label}
        </div>
    );
}

function formatWhen(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function ActivityList({
    title,
    rows,
    emptyLabel,
}: {
    title: string;
    rows: { primary: string; secondary: string; meta: string }[];
    emptyLabel: string;
}) {
    return (
        <div>
            <h3 className="mb-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                {title}
            </h3>
            {rows.length === 0 ? (
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                    {emptyLabel}
                </p>
            ) : (
                <ul className="space-y-3">
                    {rows.map((row, i) => (
                        <li
                            key={i}
                            className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                        >
                            <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100">
                                {row.primary}
                            </p>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400">
                                {row.secondary}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                                {row.meta}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function AdminDashboard() {
    const {
        stats,
        usersByRole,
        statusBreakdown,
        usersOverTime,
        applicationsOverTime,
        jobsPerStatus,
        recentActivity,
    } = usePage().props as unknown as Props;

    const hasUsers = stats.totalUsers > 0;
    const hasApplications = stats.totalApplications > 0;
    const hasJobs = stats.totalJobs > 0;

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                        label="Total Users"
                        value={stats.totalUsers}
                        icon={Users}
                        accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                        sub={
                            stats.newUsersThisWeek > 0
                                ? `+${stats.newUsersThisWeek} this week`
                                : undefined
                        }
                    />
                    <StatCard
                        label="Employers"
                        value={stats.employerCount}
                        icon={Building2}
                        accent="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                        sub={`${stats.jobSeekerCount} job seekers`}
                    />
                    <StatCard
                        label="Open Jobs"
                        value={stats.openJobs}
                        icon={CheckCircle}
                        accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                        sub={`${stats.totalJobs} total · +${stats.newJobsThisWeek} this week`}
                    />
                    <StatCard
                        label="Applications"
                        value={stats.totalApplications}
                        icon={Briefcase}
                        accent="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                        sub={`+${stats.newApplicationsThisWeek} this week`}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ChartCard title="New Users — Last 30 Days">
                        {hasUsers ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart
                                    data={usersOverTime}
                                    margin={{
                                        top: 4,
                                        right: 4,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="adminUserGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor={AREA_COLOR}
                                                stopOpacity={0.25}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={AREA_COLOR}
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={4}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        name="Users"
                                        stroke={AREA_COLOR}
                                        strokeWidth={2}
                                        fill="url(#adminUserGrad)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: AREA_COLOR }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState label="No users registered yet." />
                        )}
                    </ChartCard>

                    <ChartCard title="Applications — Last 30 Days">
                        {hasApplications ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart
                                    data={applicationsOverTime}
                                    margin={{
                                        top: 4,
                                        right: 4,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="adminAppGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#8b5cf6"
                                                stopOpacity={0.25}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#8b5cf6"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={4}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        name="Applications"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#adminAppGrad)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: '#8b5cf6' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState label="No applications yet." />
                        )}
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <ChartCard title="Users by Role">
                        {usersByRole.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={usersByRole}
                                            dataKey="count"
                                            nameKey="role"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={48}
                                            outerRadius={78}
                                            paddingAngle={2}
                                            labelLine={false}
                                            label={PieLabel}
                                        >
                                            {usersByRole.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        ROLE_COLORS[
                                                            entry.role ?? ''
                                                        ] ?? '#cbd5e1'
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload?.length)
                                                    return null;
                                                const d = payload[0]
                                                    .payload as CountItem;
                                                return (
                                                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                                        <p
                                                            style={{
                                                                color: ROLE_COLORS[
                                                                    d.role ?? ''
                                                                ],
                                                            }}
                                                            className="font-semibold"
                                                        >
                                                            {ROLE_LABELS[
                                                                d.role ?? ''
                                                            ] ?? d.role}
                                                        </p>
                                                        <p className="text-slate-500">
                                                            {d.count} user
                                                            {d.count !== 1
                                                                ? 's'
                                                                : ''}
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
                                    {usersByRole.map((s) => (
                                        <span
                                            key={s.role}
                                            className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400"
                                        >
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{
                                                    background:
                                                        ROLE_COLORS[
                                                            s.role ?? ''
                                                        ] ?? '#cbd5e1',
                                                }}
                                            />
                                            {ROLE_LABELS[s.role ?? ''] ??
                                                s.role}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState label="No users yet." />
                        )}
                    </ChartCard>

                    <ChartCard title="Application Status">
                        {hasApplications ? (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={statusBreakdown}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={48}
                                            outerRadius={78}
                                            paddingAngle={2}
                                            labelLine={false}
                                            label={PieLabel}
                                        >
                                            {statusBreakdown.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        STATUS_COLORS[
                                                            entry.status ?? ''
                                                        ] ?? '#cbd5e1'
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload?.length)
                                                    return null;
                                                const d = payload[0]
                                                    .payload as CountItem;
                                                return (
                                                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                                        <p
                                                            style={{
                                                                color: STATUS_COLORS[
                                                                    d.status ?? ''
                                                                ],
                                                            }}
                                                            className="font-semibold"
                                                        >
                                                            {STATUS_LABELS[
                                                                d.status ?? ''
                                                            ] ?? d.status}
                                                        </p>
                                                        <p className="text-slate-500">
                                                            {d.count}{' '}
                                                            application
                                                            {d.count !== 1
                                                                ? 's'
                                                                : ''}
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
                                    {statusBreakdown.map((s) => (
                                        <span
                                            key={s.status}
                                            className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400"
                                        >
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{
                                                    background:
                                                        STATUS_COLORS[
                                                            s.status ?? ''
                                                        ] ?? '#cbd5e1',
                                                }}
                                            />
                                            {STATUS_LABELS[s.status ?? ''] ??
                                                s.status}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState label="No applications yet." />
                        )}
                    </ChartCard>

                    <ChartCard title="Jobs by Status">
                        {hasJobs ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart
                                    data={jobsPerStatus}
                                    margin={{
                                        top: 4,
                                        right: 4,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="status"
                                        tickFormatter={(v: string) =>
                                            JOB_STATUS_LABELS[v] ?? v
                                        }
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        name="Jobs"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={48}
                                    >
                                        {jobsPerStatus.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    JOB_STATUS_COLORS[
                                                        entry.status ?? ''
                                                    ] ?? '#6366f1'
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState label="No jobs posted yet." />
                        )}
                    </ChartCard>
                </div>

                <ChartCard title="System Activity">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <ActivityList
                            title="Recent users"
                            emptyLabel="No recent sign-ups."
                            rows={recentActivity.users.map((u) => ({
                                primary: u.name,
                                secondary: u.email,
                                meta: `${u.roles.join(', ') || 'no role'} · ${formatWhen(u.created_at)}`,
                            }))}
                        />
                        <ActivityList
                            title="Recent jobs"
                            emptyLabel="No recent job posts."
                            rows={recentActivity.jobs.map((j) => ({
                                primary: j.title,
                                secondary: j.employer_name ?? 'Unknown employer',
                                meta: `${JOB_STATUS_LABELS[j.status] ?? j.status} · ${formatWhen(j.created_at)}`,
                            }))}
                        />
                        <ActivityList
                            title="Recent applications"
                            emptyLabel="No recent applications."
                            rows={recentActivity.applications.map((a) => ({
                                primary: a.applicant_name ?? 'Unknown applicant',
                                secondary: a.job_title ?? 'Unknown job',
                                meta: `${STATUS_LABELS[a.status] ?? a.status} · ${formatWhen(a.created_at)}`,
                            }))}
                        />
                    </div>
                </ChartCard>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                        label="Closed Jobs"
                        value={stats.closedJobs}
                        icon={XCircle}
                        accent="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    />
                    <StatCard
                        label="Admins"
                        value={stats.adminCount}
                        icon={UserCircle}
                        accent="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                    />
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
