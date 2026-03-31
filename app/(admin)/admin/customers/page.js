'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchCustomers = async (page = 1) => {
        try {
            setLoading(true);
            const query = new URLSearchParams({ page, limit: 10 });
            
            const res = await fetch(`/api/admin/customers?${query.toString()}`);
            if (!res.ok) throw new Error('Müşteriler getirilemedi');
            const data = await res.json();
            
            setCustomers(data.customers || []);
            setPagination(data.pagination || { page: 1, totalPages: 1 });
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(1);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Müşteri Yönetimi</h1>
            
            {loading ? (
                <div>Yükleniyor...</div>
            ) : (
                <div className="bg-white rounded shadow pt-2 mb-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b bg-gray-50 text-gray-700">
                                <th className="p-3">Kayıt Tarihi</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Adı, Soyadı</th>
                                <th className="p-3">Doğrulama</th>
                                <th className="p-3">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3">{new Date(customer.created_at).toLocaleString('tr-TR')}</td>
                                    <td className="p-3">{customer.email}</td>
                                    <td className="p-3">{customer.name} {customer.surname}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-sm ${customer.email_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {customer.email_verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <Link href={`/admin/customers/${customer.id}`} className="text-blue-500 hover:underline">
                                            Detay
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        Müşteri bulunamadı
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button 
                        disabled={pagination.page <= 1}
                        onClick={() => fetchCustomers(pagination.page - 1)}
                        className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Önceki
                    </button>
                    <span className="px-4 py-2 border bg-gray-100 flex items-center justify-center">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button 
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchCustomers(pagination.page + 1)}
                        className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
}
