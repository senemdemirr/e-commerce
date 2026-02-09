"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import {
    ChevronRight,
    Inventory2,
    ExpandMore,
    Info,
    CheckCircle,
    Close,
    Lock,
    VerifiedUser
} from '@mui/icons-material';

export default function CancelOrderPage({ params }) {
    const { order_number } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await apiFetch(`/api/orders/${order_number}`);
                if (res.order) {
                    setOrder(res.order);
                } else {
                    setError(res.message || "Order not found");
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [order_number]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <CircularProgress className="!text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-12 text-center">
                <h6 className="text-red-500 font-bold text-xl">{error || "Sipariş bulunamadı."}</h6>
                <button onClick={() => router.push('/my-profile/orders')} className="mt-4 text-primary font-bold hover:underline">
                    Siparişlerime Dön
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const isDelivered = order.status === 'Delivered';

    // --- CANCEL ORDER UI (New Design) ---
    if (!isDelivered) {
        return (
            <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
                <div className="layout-container flex h-full grow flex-col">
                    <main className="flex-1 flex justify-center py-8 px-4">
                        <div className="w-full max-w-[800px] flex flex-col gap-6">
                            {/* Breadcrumbs */}
                            <nav className="flex items-center gap-2 text-sm">
                                <Link className="text-text-muted hover:text-primary transition-colors" href="/">Anasayfa</Link>
                                <ChevronRight className="text-text-muted !text-sm" />
                                <Link className="text-text-muted hover:text-primary transition-colors" href="/my-profile/orders">Siparişlerim</Link>
                                <ChevronRight className="text-text-muted !text-sm" />
                                <span className="text-text-dark dark:text-white font-semibold">Sipariş İptal</span>
                            </nav>

                            {/* Title Section */}
                            <div className="flex flex-col gap-2">
                                <h1 className="text-text-dark dark:text-white text-3xl font-black leading-tight tracking-tight">
                                    Sipariş İptal Talebi
                                </h1>
                                <p className="text-text-muted text-base">Sipariş No: <span className="font-bold text-text-dark dark:text-gray-200">#{order.order_number}</span></p>
                            </div>

                            {/* Order Summary Card */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-white/10 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Inventory2 className="text-primary" />
                                        <h3 className="font-bold text-lg text-text-dark dark:text-white">Sipariş Özeti</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full capitalize">
                                        {order.status === 'Order Received' ? 'Sipariş Alındı' :
                                            order.status === 'Preparing' ? 'Hazırlanıyor' :
                                                order.status === 'Shipped' ? 'Kargoda' : order.status}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="size-20 bg-background-light dark:bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                                <div className="w-full h-full bg-center bg-no-repeat bg-cover"
                                                    style={{ backgroundImage: `url("${item.image || 'https://via.placeholder.com/150'}")` }}>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-text-dark dark:text-white font-bold text-lg leading-tight">{item.product_title}</p>
                                                <p className="text-text-muted text-sm mt-1">Adet: {item.quantity} | <span className="text-primary font-semibold">{parseFloat(item.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span></p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
                                        <p className="text-text-dark dark:text-white font-bold text-lg">Toplam: <span className="text-primary">{parseFloat(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Form */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col gap-6">
                                <h3 className="font-bold text-lg text-text-dark dark:text-white border-b border-gray-100 dark:border-white/10 pb-4">İptal Bilgileri</h3>

                                {/* Reason Dropdown */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-text-dark dark:text-gray-300" htmlFor="reason">İptal Nedeni Seçiniz</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 rounded-lg border-gray-200 dark:border-white/10 bg-background-light dark:bg-white/5 text-text-dark dark:text-white focus:ring-primary focus:border-primary appearance-none px-4"
                                            id="reason"
                                            defaultValue=""
                                        >
                                            <option disabled value="">Lütfen bir neden belirtin...</option>
                                            <option value="1">Yanlış ürün aldım</option>
                                            <option value="2">Fiyatı başka bir yerde daha düşük</option>
                                            <option value="3">Vazgeçtim / İhtiyacım kalmadı</option>
                                            <option value="4">Teslimat süresi çok uzun</option>
                                            <option value="5">Diğer</option>
                                        </select>
                                        <ExpandMore className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
                                    </div>
                                </div>

                                {/* Description Area */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-text-dark dark:text-gray-300" htmlFor="desc">Ek Açıklama (Opsiyonel)</label>
                                        <span className="text-xs text-text-muted">Maks. 250 karakter</span>
                                    </div>
                                    <textarea
                                        className="w-full rounded-lg border-gray-200 dark:border-white/10 bg-background-light dark:bg-white/5 text-text-dark dark:text-white focus:ring-primary focus:border-primary p-4 placeholder:text-text-muted"
                                        id="desc"
                                        placeholder="Bize daha fazla detay vermek ister misiniz?"
                                        rows="4"
                                    ></textarea>
                                </div>

                                {/* Info Alert */}
                                <div className="flex gap-3 bg-primary/10 border border-primary/20 p-4 rounded-lg">
                                    <Info className="text-primary" />
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-text-dark dark:text-white">Para İadesi Hakkında</p>
                                        <p className="text-sm text-[#506e5a] dark:text-gray-300">Ücret iadeniz iptal onayından sonra 3-5 iş günü içinde orijinal ödeme yönteminize yapılacaktır.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <button
                                    onClick={() => {/* Implement Cancel Logic */ }}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle />
                                    İptal İşlemini Onayla
                                </button>
                                <button
                                    onClick={() => router.back()}
                                    className="flex-1 bg-accent hover:bg-[#e0a47d] text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Close />
                                    Vazgeç
                                </button>
                            </div>

                            {/* Safety/Trust Section */}
                            <div className="flex items-center justify-center gap-8 py-6 opacity-60">
                                <div className="flex items-center gap-2 grayscale">
                                    <Lock className="!text-sm" />
                                    <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Güvenli Ödeme</span>
                                </div>
                                <div className="flex items-center gap-2 grayscale">
                                    <VerifiedUser className="!text-sm" />
                                    <span className="text-xs font-medium uppercase tracking-wider text-text-muted">256-bit SSL</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // --- RETURN ORDER UI (Existing Logic) ---
    return (
        <main className="flex-1 flex flex-col items-center bg-white dark:bg-surface-dark transition-colors duration-200">
            <div className="layout-content-container flex flex-col max-w-[960px] w-full px-4 md:px-10 py-5">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 py-4">
                    <Link className="text-text-muted text-base font-medium leading-normal hover:text-primary transition-colors"
                        href="/">Anasayfa</Link>
                    <span className="text-text-muted text-base font-medium leading-normal">/</span>
                    <Link className="text-text-muted text-base font-medium leading-normal hover:text-primary transition-colors"
                        href="/my-profile/orders">Siparişlerim</Link>
                    <span className="text-text-muted text-base font-medium leading-normal">/</span>
                    <span className="text-text-dark dark:text-white text-base font-medium leading-normal">İade
                        Talebi</span>
                </div>

                {/* Page Heading */}
                <div className="flex flex-wrap justify-between gap-3 py-6">
                    <div className="flex min-w-72 flex-col gap-3">
                        <h1
                            className="text-text-dark dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                            İade Talebi Oluşturma</h1>
                        <p className="text-text-muted text-base font-normal leading-normal">Lütfen iade etmek istediğiniz
                            ürünleri seçerek ilerleyiniz.</p>
                    </div>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between w-full mb-10 px-4">
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            1</div>
                        <span className="text-xs font-bold text-primary">Ürün Seçimi</span>
                    </div>
                    <div className="h-[2px] grow bg-primary mx-4"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="w-10 h-10 rounded-full bg-background-light dark:bg-surface-dark border-2 border-gray-300 dark:border-white/10 flex items-center justify-center text-text-muted font-bold">
                            2</div>
                        <span className="text-xs font-medium text-text-muted">İade Nedeni</span>
                    </div>
                    <div className="h-[2px] grow bg-gray-300 dark:bg-white/10 mx-4"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="w-10 h-10 rounded-full bg-background-light dark:bg-surface-dark border-2 border-gray-300 dark:border-white/10 flex items-center justify-center text-text-muted font-bold">
                            3</div>
                        <span className="text-xs font-medium text-text-muted">Onay</span>
                    </div>
                </div>

                {/* Order Summary Card */}
                <div
                    className="bg-white dark:bg-white/5 p-6 rounded-xl border border-[#f1f3f2] dark:border-white/10 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-text-dark dark:text-white text-lg font-bold leading-tight">Sipariş No:
                                #{order.order_number}</p>
                            <p className="text-text-muted text-sm font-normal leading-normal">Sipariş Tarihi: {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex flex-col md:items-end">
                            <p className="text-text-muted text-sm font-normal">Toplam Tutar</p>
                            <p className="text-primary text-xl font-black">{parseFloat(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <h2
                    className="text-secondary text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 pt-4 border-b border-[#f1f3f2] dark:border-white/10 mb-6">
                    İade Edilecek Ürünleri Seçin</h2>

                {/* Product Selection List */}
                <div className="space-y-4 mb-8">
                    {order.items?.map((item) => (
                        <div key={item.id}
                            className="flex items-start gap-4 p-4 bg-white dark:bg-white/5 rounded-xl border border-[#f1f3f2] dark:border-white/10 group transition-all hover:border-primary/50">
                            <div className="pt-2">
                                <input className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 dark:bg-surface-dark"
                                    type="checkbox" />
                            </div>
                            <div className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 bg-gray-100 dark:bg-white/10"
                                style={{ backgroundImage: `url("${item.image || 'https://via.placeholder.com/150'}")` }}>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                    <h3 className="text-text-dark dark:text-white font-bold text-base">{item.title}</h3>
                                    <span className="font-black text-primary">{parseFloat(item.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                </div>
                                <p className="text-xs text-text-muted">SKU: {item.sku}</p>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-muted mb-1 block">İade Nedeni</label>
                                        <select
                                            className="w-full rounded-lg border-[#f1f3f2] dark:border-white/10 bg-[#f6f7f7] dark:bg-white/5 text-text-dark dark:text-white text-sm focus:border-primary focus:ring-0 py-2 px-3">
                                            <option>Beden uymadı</option>
                                            <option>Ürün kusurlu/defolu</option>
                                            <option>Vazgeçtim</option>
                                            <option>Görselden farklı geldi</option>
                                            <option>Yanlış ürün gönderildi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-muted mb-1 block">Açıklama
                                            (Opsiyonel)</label>
                                        <input
                                            className="w-full rounded-lg border-[#f1f3f2] dark:border-white/10 bg-[#f6f7f7] dark:bg-white/5 text-text-dark dark:text-white text-sm focus:border-primary focus:ring-0 py-2 px-3"
                                            placeholder="Eklemek istediğiniz notlar..." type="text" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Policy Warning */}
                <div className="p-5 bg-accent-champagne/10 border-l-4 border-accent-champagne rounded-r-xl mb-10 flex gap-4 items-start">
                    <Info className="text-accent-champagne text-3xl" />
                    <div className="flex flex-col gap-1">
                        <p className="text-text-dark dark:text-white font-bold text-sm">İade Politikası Hatırlatması</p>
                        <p className="text-text-muted text-xs leading-relaxed">
                            Hijyen kuralları gereği, paketi açılmış veya kullanılmış kişisel bakım ürünleri ve iç
                            giyim kategorisindeki ürünler iade edilemez. İade ettiğiniz ürünlerin orijinal kutusu ve
                            fatura kopyası ile gönderilmesi gerekmektedir. İade onaylandığında tutar 3-5 iş günü
                            içinde hesabınıza aktarılır.
                        </p>
                    </div>
                </div>

                {/* Action Footer */}
                <div
                    className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#f1f3f2] dark:border-white/10 pt-8 mb-20">
                    <div className="flex items-center gap-3">
                        <input className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 dark:bg-surface-dark" id="policy"
                            type="checkbox" />
                        <label className="text-sm font-medium text-text-muted" htmlFor="policy">
                            <Link className="underline hover:text-primary" href="#">İade koşullarını</Link> okudum ve kabul
                            ediyorum.
                        </label>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => router.back()}
                            className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-text-muted border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            İptal
                        </button>
                        <button
                            className="flex-1 md:flex-none px-12 py-3 rounded-xl bg-accent-champagne hover:bg-accent text-white font-black shadow-lg shadow-accent-champagne/20 transition-all transform hover:scale-105">
                            İadeyi Başlat
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
