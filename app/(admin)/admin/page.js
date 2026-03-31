'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import GroupIcon from '@mui/icons-material/Group';
import PaymentsIcon from '@mui/icons-material/Payments';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import HomeIcon from '@mui/icons-material/Home';
import DevicesIcon from '@mui/icons-material/Devices';

export default function DashboardPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('7days');

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/dashboard?filter=${filter}`, { headers: { role: 'admin' } });
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
    }, [filter]);

    const getCategoryIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fashion') || lower.includes('clothes')) return <CheckroomIcon sx={{ fontSize: 14 }} />;
        if (lower.includes('home') || lower.includes('decor')) return <HomeIcon sx={{ fontSize: 14 }} />;
        if (lower.includes('electronics') || lower.includes('device')) return <DevicesIcon sx={{ fontSize: 14 }} />;
        return <ShoppingBagIcon sx={{ fontSize: 14 }} />;
    };

    const getIconColors = (index) => {
        const colors = [
            { bg: 'bg-primary/20', text: 'text-primary' },
            { bg: 'bg-accent-champagne/20', text: 'text-accent-champagne' },
            { bg: 'bg-secondary/20', text: 'text-secondary' }
        ];
        return colors[index % colors.length];
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!stats && !loading) return null;

    // Chart logic: simple SVG line builder
    const chartData = stats?.salesChart || [];
    const maxAmount = Math.max(...chartData.map(s => s.amount), 1);
    const chartPoints = chartData.map((s, i) => `${(i * 400) / (chartData.length - 1 || 1)},${150 - (s.amount / maxAmount) * 120}`).join(' ');

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Sales */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] size-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-body">Total Sales</p>
                            <h3 className="text-2xl font-bold mt-1 font-display">${stats?.totalSales.toLocaleString()}</h3>
                            <p className={`text-xs flex items-center gap-1 mt-2 ${stats?.totalSalesTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stats?.totalSalesTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />} 
                                {Math.abs(stats?.totalSalesTrend)}% from last month
                            </p>
                        </div>
                        <div className="bg-primary/20 text-primary p-2 rounded-lg">
                            <PaymentsIcon />
                        </div>
                    </div>
                </div>

                {/* New Orders */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] size-24 bg-accent-champagne/10 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-body">New Orders</p>
                            <h3 className="text-2xl font-bold mt-1 font-display">{stats?.newOrders}</h3>
                            <p className={`text-xs flex items-center gap-1 mt-2 ${stats?.newOrdersTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stats?.newOrdersTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />} 
                                {Math.abs(stats?.newOrdersTrend)}% this week
                            </p>
                        </div>
                        <div className="bg-accent-champagne/20 text-accent-champagne p-2 rounded-lg">
                            <ShoppingBagIcon />
                        </div>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] size-24 bg-secondary/10 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-body">Total Customers</p>
                            <h3 className="text-2xl font-bold mt-1 font-display">{stats?.totalCustomers}</h3>
                            <p className={`text-xs flex items-center gap-1 mt-2 ${stats?.totalCustomersTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stats?.totalCustomersTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />} 
                                {Math.abs(stats?.totalCustomersTrend)}% growth
                            </p>
                        </div>
                        <div className="bg-secondary/20 text-secondary p-2 rounded-lg">
                            <GroupIcon />
                        </div>
                    </div>
                </div>

                {/* Daily Visitors */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] size-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-body">Daily Visitors</p>
                            <h3 className="text-2xl font-bold mt-1 font-display">{stats?.dailyVisitors.toLocaleString()}</h3>
                            <p className={`text-xs flex items-center gap-1 mt-2 ${stats?.dailyVisitorsTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stats?.dailyVisitorsTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />} 
                                {Math.abs(stats?.dailyVisitorsTrend)}% today
                            </p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 p-2 rounded-lg">
                            <VisibilityIcon />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 transition-opacity">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold font-display">Sales Overview</h2>
                            <p className="text-sm text-slate-500 font-body">
                                {filter === '7days' ? 'Performance for the last 7 days' : 'Performance for this year'}
                            </p>
                        </div>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-xs bg-background-light dark:bg-slate-800 border-none rounded-lg focus:ring-primary py-1 px-2 outline-none cursor-pointer"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="thisyear">This Year</option>
                        </select>
                    </div>
                    <div className="h-64 flex flex-col">
                        <div className="flex-1 relative">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 150">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#8dc8a1', stopOpacity: 0.3 }}></stop>
                                        <stop offset="100%" style={{ stopColor: '#8dc8a1', stopOpacity: 0 }}></stop>
                                    </linearGradient>
                                </defs>
                                <polyline
                                    fill="url(#gradient)"
                                    stroke="none"
                                    points={`0,150 ${chartPoints} 400,150`}
                                />
                                <polyline
                                    fill="none"
                                    stroke="#8dc8a1"
                                    strokeWidth="3"
                                    points={chartPoints}
                                />
                            </svg>
                        </div>
                        <div className="flex justify-between mt-4 px-2">
                            {chartData.map(s => (
                                <span key={s.day} className="text-[10px] text-slate-400 font-body">{s.day}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Categories */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 font-display">Top Categories</h2>
                    <div className="space-y-4">
                        {stats?.topCategories.map((cat, index) => {
                            const colors = getIconColors(index);
                            return (
                                <div key={cat.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
                                                {getCategoryIcon(cat.name)}
                                            </div>
                                            <span className="text-sm font-medium font-body">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-bold font-display">${cat.amount}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-primary/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold font-display">Recent Orders</h2>
                    <Link href="/admin/orders">
                        <button className="text-primary text-sm font-bold hover:underline font-display outline-none">View All</button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background-light dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-display">Order ID</th>
                                <th className="px-6 py-4 font-display">Customer</th>
                                <th className="px-6 py-4 font-display">Status</th>
                                <th className="px-6 py-4 font-display">Date</th>
                                <th className="px-6 py-4 font-display">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {stats?.recentOrders.map((order) => (
                                <tr key={order.order_number} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium font-body">#{order.order_number}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                {order.shipping_full_name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-body">{order.shipping_full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                order.status === 'shipping' || order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                        'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {order.status === 'delivered' ? 'Completed' : order.status === 'shipped' ? 'Shipped' : order.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-body">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold font-display">${order.total_amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(stats?.recentOrders.length === 0 || !stats) && (
                        <div className="p-8 text-center text-slate-500 font-body">No recent orders found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
