import React from 'react';
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

const CancelRequest = ({ order, router, formatDate }) => {
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
                                            <p className="text-text-dark dark:text-white font-bold text-lg leading-tight">{item.product_title || item.title}</p>
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
};

export default CancelRequest;
