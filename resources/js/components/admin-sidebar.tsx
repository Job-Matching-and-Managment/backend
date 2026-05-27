import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Briefcase,
    Building2,
    ClipboardCheck,
    LayoutGrid,
    LineChart,
    Megaphone,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

export function AdminSidebar() {
    const { url } = usePage();
    const isPreview = url.includes('/preview');

    const mainNavItems: NavItem[] = useMemo(
        () => [
            {
                title: 'Dashboard',
                href: isPreview
                    ? '/admin/dashboard/preview'
                    : '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Users',
                href: isPreview ? '/admin/users/preview' : '/admin/users',
                icon: Users,
            },
            {
                title: 'Employer Verification',
                href: isPreview
                    ? '/admin/employer-verifications/preview'
                    : '/admin/employer-verifications',
                icon: Building2,
            },
            {
                title: 'Company Verification',
                href: isPreview
                    ? '/admin/company-verifications/preview'
                    : '/admin/company-verifications',
                icon: BadgeCheck,
            },
            {
                title: 'Job Moderation',
                href: isPreview
                    ? '/admin/job-moderation/preview'
                    : '/admin/job-moderation',
                icon: Briefcase,
            },
            {
                title: 'Suspicious Users',
                href: isPreview
                    ? '/admin/suspicious-users/preview'
                    : '/admin/suspicious-users',
                icon: ShieldAlert,
            },
            {
                title: 'Content Approval',
                href: isPreview
                    ? '/admin/content-approval/preview'
                    : '/admin/content-approval',
                icon: ClipboardCheck,
            },
            {
                title: 'Announcements',
                href: isPreview
                    ? '/admin/announcements/preview'
                    : '/admin/announcements',
                icon: Megaphone,
            },
            {
                title: 'Reports',
                href: isPreview ? '/admin/reports/preview' : '/admin/reports',
                icon: LineChart,
            },
        ],
        [isPreview],
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    isPreview
                                        ? '/admin/dashboard/preview'
                                        : '/admin/dashboard'
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
