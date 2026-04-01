'use client';

const SalesChart = ({ chartData, filter, setFilter, loading }) => {
    const maxAmount = Math.max(...chartData.map(s => s.amount), 1);
    const chartPoints = chartData.map((s, i) => `${(i * 400) / (chartData.length - 1 || 1)},${150 - (s.amount / maxAmount) * 120}`).join(' ');

    return (
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
    );
};

export default SalesChart;
