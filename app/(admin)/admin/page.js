'use client';

import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import StatsCards from '@/components/admin/Dashboard/StatsCards';
import SalesChart from '@/components/admin/Dashboard/SalesChart';
import TopCategories from '@/components/admin/Dashboard/TopCategories';
import RecentOrdersTable from '@/components/admin/Dashboard/RecentOrdersTable';

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

            <RecentOrdersTable orders={stats?.recentOrders || []} />
        </div>
    );
}
