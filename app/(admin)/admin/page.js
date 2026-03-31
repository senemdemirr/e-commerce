'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useSnackbar } from 'notistack';

export default function DashboardPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/admin/dashboard', { headers: { role: 'admin' }});
                if (!res.ok) throw new Error('Dashboard verileri alınamadı');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                enqueueSnackbar(error.message, { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Özeti</h1>
                    <p className="text-gray-500 mt-1">Mağazanızın güncel durumuna genel bir bakış.</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Sistem Çalışıyor
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Gelir */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Toplam Gelir (Tahmini)</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalSales.toLocaleString('tr-TR')} TL</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <AttachMoneyIcon />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                        <TrendingUpIcon fontSize="small" className="mr-1" />
                        <span>Siparişlerden alındı</span>
                    </div>
                </div>

                {/* Yeni Siparişler */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Yeni Siparişler</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.newOrders}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <ShoppingCartIcon />
                        </div>
                    </div>
                     <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                        Bekleyen İşlemler
                    </div>
                </div>

                {/* Toplam Müşteri */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Toplam Müşteri</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <PeopleIcon />
                        </div>
                    </div>
                     <div className="mt-4 flex items-center text-sm text-gray-500">
                        Kayıtlı ve doğrulanmış
                    </div>
                </div>

                {/* Toplam Ürün */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Toplam Ürün</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Inventory2Icon />
                        </div>
                    </div>
                     <div className="mt-4 flex items-center text-sm text-gray-500">
                        Mağazadaki tüm ürünler
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Son Siparişler</h2>
                        <Link href="/admin/orders">
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                Tümünü Gör →
                            </span>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş No</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Müşteri</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Sipariş bulunamadı.
                                        </td>
                                    </tr>
                                ) : stats.recentOrders.map((order) => (
                                    <tr key={order.order_number} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <Link href={`/admin/orders/${order.order_number}`} className="hover:underline">
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.shipping_full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.total_amount} TL</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                                order.status === 'shipping' || order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Popular Categories */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Popüler Kategoriler</h2>
                    </div>
                    <div className="p-6">
                        {stats.topCategories.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">Kategori verisi yok.</div>
                        ) : (
                            <ul className="space-y-4">
                                {stats.topCategories.map((cat, index) => (
                                    <li key={index} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex flex-col justify-center items-center text-gray-500 font-bold text-xs">
                                                #{index + 1}
                                            </div>
                                            <span className="font-medium text-gray-800">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">{cat.count} Ürün</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
