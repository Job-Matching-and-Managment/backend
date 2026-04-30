import { usePage } from '@inertiajs/react';

import UserLayout from '@/layouts/app/app-header-layout';
import AdminLayout from '@/layouts/app/app-sidebar-layout';


import type { AppLayoutProps } from '@/types';

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { auth } = usePage().props as any;

    const isAdmin = auth?.roles?.includes('admin');

    const Layout = isAdmin ? AdminLayout : UserLayout;

    return (
        <Layout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </Layout>
    );
}