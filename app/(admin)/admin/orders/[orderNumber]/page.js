'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';

export default function OrderDetailPage() {
    const { orderNumber } = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/admin/orders/${orderNumber}`);
                if (!res.ok) throw new Error('Sipariş bilgileri alınamadı');
                const data = await res.json();
                setOrder(data);
                setStatus(data.status);
            } catch (error) {
                enqueueSnackbar(error.message, { variant: 'error' });
                router.push('/admin/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderNumber]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const res = await fetch(`/api/admin/orders/${orderNumber}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Güncelleme hatası');
            enqueueSnackbar('Durum başarıyla güncellendi', { variant: 'success' });
            setOrder(data);
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-6">Yükleniyor...</div>;
    if (!order) return <div className="p-6">Sipariş bulunamadı</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Sipariş Detayı: {order.order_number}</h1>
                <Link href="/admin/orders" className="text-gray-500 hover:underline">Geri Dön</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Müşteri & Kargo Bilgileri</h2>
                    <div className="space-y-2">
                        <p><strong>Alıcı Adı:</strong> {order.shipping_full_name}</p>
                        <p><strong>Telefon:</strong> {order.shipping_phone}</p>
                        <p><strong>Adres:</strong> {order.shipping_address}</p>
                        <p><strong>İl / İlçe:</strong> {order.shipping_city} / {order.shipping_district} ({order.shipping_postal_code})</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Ödeme Bilgileri</h2>
                    <div className="space-y-2">
                        <p><strong>Ödeme Yöntemi:</strong> {order.payment_method}</p>
                        <p><strong>Ödeme Durumu:</strong> {order.payment_status}</p>
                        <p><strong>Ara Toplam:</strong> {order.subtotal} TL</p>
                        <p><strong>Kargo:</strong> {order.shipping_cost} TL</p>
                        <p className="text-lg font-bold"><strong>Toplam:</strong> {order.total_amount} TL</p>
                        {order.card_mask && (
                            <p><strong>Kart:</strong> {order.card_bank} - {order.card_family} ({order.card_mask})</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Sipariş Durumu Güncelle</h2>
                    <form onSubmit={handleUpdateStatus} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Yeni Durum</label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                            >
                                <option value="pending">Bekliyor</option>
                                <option value="processing">İşleniyor</option>
                                <option value="shipped">Kargolandı</option>
                                <option value="delivered">Teslim Edildi</option>
                                <option value="cancelled">İptal Edildi</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={updating || status === order.status}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {updating ? 'Güncelleniyor...' : 'Güncelle'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
