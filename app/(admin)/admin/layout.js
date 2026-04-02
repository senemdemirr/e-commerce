'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
                <Header />

                {/* Content */}
                <div className="min-w-0 p-4 sm:p-6 lg:p-8 h-vh">
                    {children}
                </div>
            </main>
        </div>
    );
}
