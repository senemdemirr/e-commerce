'use client';

import SearchIcon from '@mui/icons-material/Search';
import { useAdminSession } from '@/context/AdminSessionContext';

const Header = () => {
    const { admin, loading } = useAdminSession();

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
