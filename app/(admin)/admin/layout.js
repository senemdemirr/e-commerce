'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Özet (Dashboard)', path: '/admin', icon: <DashboardIcon /> },
        { name: 'Siparişler', path: '/admin/orders', icon: <ShoppingCartIcon /> },
        { name: 'Ürünler', path: '/admin/products', icon: <InventoryIcon /> },
        { name: 'Envanter ve Kategoriler', path: '/admin/categories', icon: <CategoryIcon /> },
        { name: 'Müşteriler', path: '/admin/customers', icon: <PeopleIcon /> },
        { name: 'Ayarlar', path: '/admin/settings', icon: <SettingsIcon /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
                <div>
                    <div className="h-16 flex items-center justify-center border-b border-gray-200 px-6">
                        <Link href="/admin">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                                E-Commerce Admin
                            </h2>
                        </Link>
                    </div>
                    
                    <nav className="p-4 space-y-2 mt-4">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
                            return (
                                <Link 
                                    href={item.path} 
                                    key={item.path}
                                >
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                                        isActive 
                                            ? 'bg-blue-50 text-blue-700 font-medium' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}>
                                        <span className={isActive ? "text-blue-600" : "text-gray-500"}>
                                            {item.icon}
                                        </span>
                                        <span>{item.name}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                    <Link href="/">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                            <ExitToAppIcon />
                            <span>Siteye Dön</span>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shrink-0 relative z-10 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col text-right">
                            <span className="text-sm font-semibold text-gray-800">Admin Yönetici</span>
                            <span className="text-xs text-gray-500">Tam Yetkili</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-all">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8 h-full">
                    <div className="max-w-7xl mx-auto drop-shadow-sm">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
