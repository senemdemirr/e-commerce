'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import StatsCards from '@/components/admin/Dashboard/StatsCards';
import SalesChart from '@/components/admin/Dashboard/SalesChart';
import TopCategories from '@/components/admin/Dashboard/TopCategories';
import OrderTable from '@/components/admin/OrderTable';

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
    }, [enqueueSnackbar, filter]);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!stats && !loading) return null;

    return (
        <div className="space-y-8">
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <SalesChart 
                    chartData={stats?.salesChart || []} 
                    filter={filter} 
                    setFilter={setFilter} 
                    loading={loading} 
                />
                <TopCategories topCategories={stats?.topCategories || []} />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-primary/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold font-display">Recent Orders</h2>
                    <Link href="/admin/orders">
                        <button className="text-primary text-sm font-bold hover:underline font-display outline-none">View All</button>
                    </Link>
                </div>
                <OrderTable orders={stats?.recentOrders || []} variant="dashboard" />
            </div>
        </div>
    );
}
