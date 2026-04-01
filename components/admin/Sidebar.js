'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import Image from 'next/image';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon sx={{ fontSize: 20 }} /> },
        { name: 'Products', path: '/admin/products', icon: <InventoryIcon sx={{ fontSize: 20 }} /> },
        { name: 'Customers', path: '/admin/customers', icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-primary/10 flex flex-col">
            <div className="py-4 px-6 flex items-center gap-3">
                <div className="size-10 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <Image className='max-w-[unset]' src="/just_logo.png" alt="Logo" width={100} height={100} />
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
    );
};

export default Sidebar;
