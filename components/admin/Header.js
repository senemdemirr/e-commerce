'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useSnackbar } from 'notistack';
import { useAdminSession } from '@/context/AdminSessionContext';

const Header = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { admin, loading, refreshAdmin } = useAdminSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // İsmin baş harflerini al (avatar fallback için)
    const getInitials = (name) => {
        if (!name) return 'A';
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        try {
            setIsLoggingOut(true);

            const response = await fetch('/api/admin/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                enqueueSnackbar('Çıkış işlemi tamamlanamadı.', { variant: 'error' });
                return;
            }

            await refreshAdmin();
            router.replace('/admin/login');
            router.refresh();
        } catch {
            enqueueSnackbar('Çıkış sırasında bağlantı hatası oluştu.', { variant: 'error' });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between px-8 py-4 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-xl" />
                    <input
                        className="w-full bg-background-light dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary text-sm outline-none"
                        placeholder="Search orders, customers, items..."
                        type="text"
                    />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading || isLoggingOut || !admin}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/15 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>{isLoggingOut ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}</span>
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
                    <div className="text-right">
                        <p className="text-sm font-bold">
                            {admin ? admin.name : loading ? '...' : 'Unknown'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                            {admin
                                ? admin.role === 'superadmin'
                                    ? 'Superadmin'
                                    : 'Read-Only Admin'
                                : loading
                                    ? '...'
                                    : 'No Session'}
                        </p>
                    </div>
                    <div className="size-10 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {admin ? getInitials(admin.name) : loading ? '...' : '?'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
