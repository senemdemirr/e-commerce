'use client';

import Link from 'next/link';

const RecentOrdersTable = ({ orders }) => {
    return (
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
                        {orders.map((order) => (
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
                {orders.length === 0 && (
                    <div className="p-8 text-center text-slate-500 font-body">No recent orders found.</div>
                )}
            </div>
        </div>
    );
};

export default RecentOrdersTable;
