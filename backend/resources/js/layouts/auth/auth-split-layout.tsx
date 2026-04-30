import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh grid-cols-1 lg:grid-cols-2">
            {/* LEFT SIDE - IMAGE SHOWCASE */}
            <div className="hidden lg:flex relative flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-md">
                    {/* Logo and brand */}
                    <Link
                        href={home()}
                        className="mb-16 flex items-center gap-2 text-lg font-semibold text-white transition-opacity hover:opacity-80"
                    >
                        <AppLogoIcon className="size-8 fill-current text-white" />
                        <span>{name}</span>
                    </Link>

                    {/* Image container with modern styling */}
                    <div className="relative mb-12 w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-20"></div>
                        <div className="relative rounded-2xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-lg p-8 border border-white/20 shadow-2xl">
                            <img 
                                src='/images/register-image.svg' 
                                alt="Register" 
                                className="w-full h-auto object-contain rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Decorative text or features */}
                    <div className="text-center text-white/70 space-y-2">
                        <p className="text-sm font-medium">Join thousands of satisfied users</p>
                        <p className="text-xs">Experience seamless registration and authentication</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="flex items-center justify-center w-full px-6 py-12 sm:px-8 lg:px-12">
                <div className="w-full max-w-2xl">
                    {/* Mobile logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden mb-8"
                    >
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    
                    {/* Form header */}
                    <div className="flex flex-col gap-2 mb-8">
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground text-balance">
                            {description}
                        </p>
                    </div>

                    {/* Form content */}
                    <div className="space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
