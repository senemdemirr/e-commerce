'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import IronIcon from '@mui/icons-material/Iron';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon sx={{ fontSize: 20 }} /> },
        { name: 'Products', path: '/admin/products', icon: <InventoryIcon sx={{ fontSize: 20 }} /> },
        { name: 'Customers', path: '/admin/customers', icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
    ];

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-primary/10 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <IronIcon />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Iron E-Comm</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Admin Central</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
                        return (
                            <Link
                                href={item.path}
                                key={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary !text-white font-medium shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
                                    }`}
                            >
                                <span className={isActive ? 'text-white flex' : ''}>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 pb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">System</div>
                    <Link
                        href="/admin/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/settings'
                            ? 'bg-primary !text-white font-medium shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
                            }`}
                    >
                        <SettingsIcon sx={{ fontSize: 20, color: pathname === '/admin/settings' ? 'white' : 'inherit' }} />
                        <span>Settings</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between px-8 sticky top-0 z-10">
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
                        <button className="relative text-slate-500 hover:text-primary">
                            <NotificationsIcon />
                            <span className="absolute top-0 right-0 size-2 bg-accent-champagne rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
                            <div className="text-right">
                                <p className="text-sm font-bold">Alex Iron</p>
                                <p className="text-[10px] text-slate-500">Store Manager</p>
                            </div>
                            <div
                                className="size-10 rounded-full bg-secondary border-2 border-primary/20 bg-cover bg-center"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDl_KZuxOIDFrJEg76maaotFvEPdLD1ll01z8r5tFj-JIumHgjTOCCQWM5JJDdD6IvjfUx9YCUl3pU314ZkPtqzQHhwNYtOSSIT-8u4Cu28aKKNzCTLMSYsaM4zuraCbnRQduLBC2n2oCLOkXgkQ9GDp93mHePUMv9gbKtIOCvPO_1hNBqfzIJrvZjTymP1zrzFDaBjPv6JfYJzh0_Q0CaLcZmCzXxxM9B3pCfW2u3Yj3MOgMAhdiyF3iZKe-2o1dyWdNoykb2WnPQ')" }}
                            ></div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
