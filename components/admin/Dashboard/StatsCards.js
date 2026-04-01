'use client';

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import GroupIcon from '@mui/icons-material/Group';
import PaymentsIcon from '@mui/icons-material/Payments';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const StatsCard = ({ title, value, trend, trendLabel, icon, iconBg, iconColor, bgCircleColor }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
        <div className={`absolute right-[-10px] top-[-10px] size-24 ${bgCircleColor} rounded-full group-hover:scale-110 transition-transform`}></div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium font-body">{title}</p>
                <h3 className="text-2xl font-bold mt-1 font-display">{value}</h3>
                <p className={`text-xs flex items-center gap-1 mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />} 
                    {Math.abs(trend)}% {trendLabel}
                </p>
            </div>
            <div className={`${iconBg} ${iconColor} p-2 rounded-lg`}>
                {icon}
            </div>
        </div>
    </div>
);

const StatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
                title="Total Sales" 
                value={`$${stats?.totalSales.toLocaleString()}`} 
                trend={stats?.totalSalesTrend} 
                trendLabel="from last month"
                icon={<PaymentsIcon />}
                iconBg="bg-primary/20"
                iconColor="text-primary"
                bgCircleColor="bg-primary/5"
            />
            <StatsCard 
                title="New Orders" 
                value={stats?.newOrders} 
                trend={stats?.newOrdersTrend} 
                trendLabel="this week"
                icon={<ShoppingBagIcon />}
                iconBg="bg-accent-champagne/20"
                iconColor="text-accent-champagne"
                bgCircleColor="bg-accent-champagne/10"
            />
            <StatsCard 
                title="Total Customers" 
                value={stats?.totalCustomers} 
                trend={stats?.totalCustomersTrend} 
                trendLabel="growth"
                icon={<GroupIcon />}
                iconBg="bg-secondary/20"
                iconColor="text-secondary"
                bgCircleColor="bg-secondary/10"
            />
            <StatsCard 
                title="Daily Visitors" 
                value={stats?.dailyVisitors.toLocaleString()} 
                trend={stats?.dailyVisitorsTrend} 
                trendLabel="today"
                icon={<VisibilityIcon />}
                iconBg="bg-slate-100 dark:bg-slate-800"
                iconColor="text-slate-500"
                bgCircleColor="bg-primary/5"
            />
        </div>
    );
};

export default StatsCards;
