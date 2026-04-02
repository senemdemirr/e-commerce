'use client';

import { useId } from 'react';

const SalesChart = ({ chartData, filter, setFilter, loading }) => {
    const gradientId = `sales-chart-gradient-${useId().replace(/:/g, '')}`;
    const safeChartData = chartData.length > 0 ? chartData : [{ day: '', amount: 0 }];
    const chartWidth = 640;
    const chartHeight = 260;
    const padding = { top: 20, right: 20, bottom: 56, left: 20 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    const maxAmount = Math.max(...safeChartData.map((point) => point.amount), 1);

    const getX = (index) => {
        if (safeChartData.length === 1) {
            return chartWidth / 2;
        }

        return padding.left + (index * innerWidth) / (safeChartData.length - 1);
    };

    const getY = (amount) => padding.top + innerHeight - (amount / maxAmount) * innerHeight;

    const chartPoints = safeChartData
        .map((point, index) => `${getX(index)},${getY(point.amount)}`)
        .join(' ');

    const firstX = getX(0);
    const lastX = getX(safeChartData.length - 1);
    const baselineY = chartHeight - padding.bottom;
    const areaPoints = `${firstX},${baselineY} ${chartPoints} ${lastX},${baselineY}`;
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((step) => ({
        y: padding.top + innerHeight - innerHeight * step,
        key: step,
    }));
    const labelY = baselineY + 24;

    return (
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900 xl:col-span-2">
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 transition-opacity">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-lg font-bold font-display">Sales Overview</h2>
                    <p className="text-sm text-slate-500 font-body">
                        {filter === '7days' ? 'Performance for the last 7 days' : 'Performance for this year'}
                    </p>
                </div>
                <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full rounded-lg bg-background-light px-3 py-2 text-xs outline-none focus:ring-primary dark:bg-slate-800 sm:w-auto"
                >
                    <option value="7days">Last 7 Days</option>
                    <option value="thisyear">This Year</option>
                </select>
            </div>
            <div className="relative min-w-0 rounded-xl bg-background-light/60 px-2 py-3 dark:bg-slate-950/40">
                <div className="h-72 w-full">
                    <svg className="h-full w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                        <defs>
                            <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#8dc8a1', stopOpacity: 0.32 }}></stop>
                                <stop offset="100%" style={{ stopColor: '#8dc8a1', stopOpacity: 0 }}></stop>
                            </linearGradient>
                        </defs>
                        {gridLines.map((line) => (
                            <line
                                key={line.key}
                                x1={padding.left}
                                x2={chartWidth - padding.right}
                                y1={line.y}
                                y2={line.y}
                                stroke="currentColor"
                                strokeDasharray="6 6"
                                className="text-slate-200 dark:text-slate-800"
                            />
                        ))}
                        <line
                            x1={padding.left}
                            x2={chartWidth - padding.right}
                            y1={baselineY}
                            y2={baselineY}
                            stroke="currentColor"
                            className="text-slate-300 dark:text-slate-700"
                        />
                        <polyline
                            fill={`url(#${gradientId})`}
                            stroke="none"
                            points={areaPoints}
                        />
                        <polyline
                            fill="none"
                            stroke="#8dc8a1"
                            strokeWidth="3"
                            points={chartPoints}
                            vectorEffect="non-scaling-stroke"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {safeChartData.map((point, index) => {
                            const x = getX(index);
                            const y = getY(point.amount);
                            const textAnchor = index === 0 ? 'start' : index === safeChartData.length - 1 ? 'end' : 'middle';

                            return (
                                <g key={`${point.day}-${index}`}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        fill="#8dc8a1"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {chartData.length > 0 && (
                                        <>
                                            <line
                                                x1={x}
                                                x2={x}
                                                y1={baselineY}
                                                y2={baselineY + 8}
                                                stroke="currentColor"
                                                className="text-slate-300 dark:text-slate-700"
                                            />
                                            <text
                                                x={x}
                                                y={labelY}
                                                textAnchor={textAnchor}
                                                className="fill-slate-400 font-body text-[10px]"
                                            >
                                                {point.day}
                                            </text>
                                        </>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SalesChart;
