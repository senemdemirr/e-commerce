'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchOrders = async (page = 1, status = statusFilter) => {
        try {
            setLoading(true);
            const query = new URLSearchParams({ page, limit: 10 });
            if (status) query.append('status', status);

            const res = await fetch(`/api/admin/orders?${query.toString()}`);
            if (!res.ok) throw new Error('Siparişler getirilemedi');
            const data = await res.json();
            
            setOrders(data.orders || []);
            setPagination(data.pagination || { page: 1, totalPages: 1 });
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1, statusFilter);
    }, [statusFilter]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Sipariş Yönetimi</h1>
            
            <div className="mb-4 flex gap-4">
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">Tüm Durumlar</option>
                    <option value="pending">Bekliyor</option>
                    <option value="processing">İşleniyor</option>
                    <option value="shipped">Kargolandı</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal Edildi</option>
                </select>
            </div>

            {loading ? (
                <div>Yükleniyor...</div>
            ) : (
                <div className="bg-white rounded shadow pt-2 mb-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3">Sipariş No</th>
                                <th className="p-3">Tarih</th>
                                <th className="p-3">Durum</th>
                                <th className="p-3">Toplam Tutar</th>
                                <th className="p-3">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.order_number} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{order.order_number}</td>
                                    <td className="p-3">{new Date(order.created_at).toLocaleString('tr-TR')}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3">{order.total_amount} TL</td>
                                    <td className="p-3">
                                        <Link href={`/admin/orders/${order.order_number}`} className="text-blue-500 hover:underline">
                                            Detay
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button 
                        disabled={pagination.page <= 1}
                        onClick={() => fetchOrders(pagination.page - 1)}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Önceki
                    </button>
                    <span className="px-4 py-2 border bg-gray-50">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button 
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchOrders(pagination.page + 1)}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
}
