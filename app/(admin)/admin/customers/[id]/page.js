'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    
    const [customer, setCustomer] = useState(null);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await fetch(`/api/admin/customers/${id}`);
                if (!res.ok) throw new Error('Müşteri bilgileri alınamadı');
                const data = await res.json();
                
                setCustomer(data);
                setName(data.name || '');
                setSurname(data.surname || '');
                setPhone(data.phone || '');
            } catch (error) {
                enqueueSnackbar(error.message, { variant: 'error' });
                router.push('/admin/customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, surname, phone })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Güncelleme hatası');
            enqueueSnackbar('Müşteri başarıyla güncellendi', { variant: 'success' });
            setCustomer(prev => ({ ...prev, ...data }));
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-6">Yükleniyor...</div>;
    if (!customer) return <div className="p-6">Müşteri bulunamadı</div>;

    const hasChanges = name !== (customer.name || '') || 
                       surname !== (customer.surname || '') || 
                       phone !== (customer.phone || '');

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Müşteri Detayı: {customer.email}</h1>
                <Link href="/admin/customers" className="text-gray-500 hover:underline">Geri Dön</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow h-auto">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Müşteri Bilgilerini Güncelle</h2>
                    <form onSubmit={handleUpdateCustomer} className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Email Adresi</label>
                            <input 
                                type="email" 
                                value={customer.email} 
                                disabled 
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Adı</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Soyadı</label>
                                <input 
                                    type="text" 
                                    value={surname} 
                                    onChange={(e) => setSurname(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Telefon</label>
                            <input 
                                type="text" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Durum</label>
                            <div>
                                <span className={`px-2 py-1 rounded text-sm ${customer.email_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {customer.email_verified ? 'E-posta Doğrulanmış' : 'Doğrulanmamış'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={updating || !hasChanges}
                                className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {updating ? 'Güncelleniyor...' : 'Bilgileri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded shadow md:col-span-1">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Geçmiş Siparişler ({customer.orders?.length || 0})</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {customer.orders && customer.orders.length > 0 ? (
                            customer.orders.map(order => (
                                <Link href={`/admin/orders/${order.order_number}`} key={order.id} className="block w-full text-left">
                                    <div className="border border-gray-100 p-4 rounded bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold">{order.order_number}</span>
                                            <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                            <span className="font-medium text-blue-700">{order.total_amount} TL</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Bu müşteriye ait sipariş bulunamadı.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
