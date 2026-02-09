import React from 'react';
import Link from "next/link";
import { Info } from '@mui/icons-material';

const ReturnRequest = ({ order, router, formatDate }) => {
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
                    <span className="text-text-dark dark:text-white text-base font-medium leading-normal">İade Talebi</span>
                </div>

                {/* Page Heading */}
                <div className="flex flex-wrap justify-between gap-3 py-6">
                    <div className="flex min-w-72 flex-col gap-3">
                        <h1 className="text-text-dark dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                            İade Talebi Oluşturma
                        </h1>
                        <p className="text-text-muted text-base font-normal leading-normal">
                            Lütfen iade etmek istediğiniz ürünleri seçerek ilerleyiniz.
                        </p>
                    </div>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between w-full mb-10 px-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                        <span className="text-xs font-bold text-primary">Ürün Seçimi</span>
                    </div>
                    <div className="h-[2px] grow bg-primary mx-4"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-background-light dark:bg-surface-dark border-2 border-gray-300 dark:border-white/10 flex items-center justify-center text-text-muted font-bold">2</div>
                        <span className="text-xs font-medium text-text-muted">İade Nedeni</span>
                    </div>
                    <div className="h-[2px] grow bg-gray-300 dark:bg-white/10 mx-4"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-background-light dark:bg-surface-dark border-2 border-gray-300 dark:border-white/10 flex items-center justify-center text-text-muted font-bold">3</div>
                        <span className="text-xs font-medium text-text-muted">Onay</span>
                    </div>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-[#f1f3f2] dark:border-white/10 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-text-dark dark:text-white text-lg font-bold leading-tight">Sipariş No: #{order.order_number}</p>
                            <p className="text-text-muted text-sm font-normal leading-normal">Sipariş Tarihi: {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex flex-col md:items-end">
                            <p className="text-text-muted text-sm font-normal">Toplam Tutar</p>
                            <p className="text-primary text-xl font-black">{parseFloat(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <h2 className="text-secondary text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 pt-4 border-b border-[#f1f3f2] dark:border-white/10 mb-6">
                    İade Edilecek Ürünleri Seçin
                </h2>

                {/* Product Selection List */}
                <div className="space-y-4 mb-8">
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 p-4 bg-white dark:bg-white/5 rounded-xl border border-[#f1f3f2] dark:border-white/10 group transition-all hover:border-primary/50">
                            <div className="pt-2">
                                <input className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 dark:bg-surface-dark" type="checkbox" />
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
                                        <select className="w-full rounded-lg border-[#f1f3f2] dark:border-white/10 bg-[#f6f7f7] dark:bg-white/5 text-text-dark dark:text-white text-sm focus:border-primary focus:ring-0 py-2 px-3">
                                            <option>Beden uymadı</option>
                                            <option>Ürün kusurlu/defolu</option>
                                            <option>Vazgeçtim</option>
                                            <option>Görselden farklı geldi</option>
                                            <option>Yanlış ürün gönderildi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-muted mb-1 block">Açıklama (Opsiyonel)</label>
                                        <input className="w-full rounded-lg border-[#f1f3f2] dark:border-white/10 bg-[#f6f7f7] dark:bg-white/5 text-text-dark dark:text-white text-sm focus:border-primary focus:ring-0 py-2 px-3" placeholder="Eklemek istediğiniz notlar..." type="text" />
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#f1f3f2] dark:border-white/10 pt-8 mb-20">
                    <div className="flex items-center gap-3">
                        <input className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 dark:bg-surface-dark" id="policy" type="checkbox" />
                        <label className="text-sm font-medium text-text-muted" htmlFor="policy">
                            <Link className="underline hover:text-primary" href="#">İade koşullarını</Link> okudum ve kabul ediyorum.
                        </label>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => router.back()} className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-text-muted border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            İptal
                        </button>
                        <button className="flex-1 md:flex-none px-12 py-3 rounded-xl bg-accent-champagne hover:bg-accent text-white font-black shadow-lg shadow-accent-champagne/20 transition-all transform hover:scale-105">
                            İadeyi Başlat
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ReturnRequest;
