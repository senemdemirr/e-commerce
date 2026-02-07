import React, { forwardRef } from 'react';

const Invoice = forwardRef(({ order }, ref) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (!order) return null;

    return (
        <div ref={ref} id="invoice-content" className="bg-white p-8 md:p-16 rounded-sm shadow-invoice max-w-[900px] mx-auto my-10 border border-gray-100 flex flex-col gap-12 font-sans overflow-hidden">
            {/* Header Section */}
            <div className="flex items-start">
                <div className="">
                    <h2 className="text-3xl font-black mb-8 tracking-tight text-primary">E-INVOICE</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <span className="font-bold uppercase text-[10px] tracking-wider text-left text-text-muted">Invoice No:</span>
                        <span className="font-black text-right uppercase text-text-dark">EST{order.order_number?.replace(/[^0-9]/g, '') || '20240001'}</span>

                        <span className="font-bold uppercase text-[10px] tracking-wide text-left text-text-muted">Invoice Date:</span>
                        <span className="font-black text-right text-text-dark">{formatDate(order.created_at)}</span>

                        <span className="font-bold uppercase text-[10px] tracking-wide text-left text-text-muted">Due Date:</span>
                        <span className="font-black text-right text-text-dark">{formatDate(order.created_at)}</span>

                        <span className="font-bold uppercase text-[10px] tracking-wide text-left text-text-muted">Order No:</span>
                        <span className="font-black text-right text-text-dark">#{order.order_number}</span>
                    </div>
                </div>
            </div>

            {/* Customer Information Section */}
            <div className="border-t-2 border-b-2 py-10 border-background-light">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-primary">CUSTOMER INFORMATION</h3>
                <div className="flex flex-col gap-3">
                    <p className="text-xl font-black tracking-tight text-text-dark">{order.shipping_address?.full_name}</p>
                    <div className="text-[13px] leading-relaxed font-medium text-text-muted">
                        <p>{order.shipping_address?.address_line}</p>
                        <p className="uppercase">{order.shipping_address?.district} / {order.shipping_address?.city}</p>
                    </div>
                    <p className="font-bold mt-2 text-text-muted">Tel: <span className="text-text-dark">{order.shipping_address?.phone_number}</span></p>
                </div>
            </div>

            {/* Products Table Section */}
            <div className="flex-1 min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 text-[10px] font-black uppercase tracking-widest border-primary text-text-muted">
                            <th className="py-6 px-2">Product Name</th>
                            <th className="py-6 px-2 text-center">Quantity</th>
                            <th className="py-6 px-2 text-right">Unit Price</th>
                            <th className="py-6 px-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] text-text-dark">
                        {order.items?.map((item, index) => (
                            <tr key={index} className="border-b transition-colors border-background-light">
                                <td className="py-6 px-2">
                                    <span className="font-black text-md block mb-1 text-text-dark">{item.title}</span>
                                    {item.sku && <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Model: {item.sku}</p>}
                                </td>
                                <td className="py-6 px-2 text-center font-bold text-text-muted">{item.quantity} Qty</td>
                                <td className="py-6 px-2 text-right font-medium">{parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</td>
                                <td className="py-6 px-2 text-right font-black text-text-dark">
                                    {(parseFloat(item.unit_price) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-12 p-8 rounded-2xl bg-background-light">
                <div className="w-80 space-y-4">
                    <div className="flex justify-between items-center text-sm px-2">
                        <span className="font-bold uppercase tracking-widest text-[10px] text-text-muted">Subtotal</span>
                        <span className="font-black text-text-dark">{parseFloat(order.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    <div className="flex justify-between items-center text-sm px-2">
                        <span className="font-bold uppercase tracking-widest text-[10px] text-text-muted">Shipping Fee</span>
                        <span className="font-black text-text-dark">{parseFloat(order.shipping_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    <div className="flex justify-between items-center p-6 rounded-xl mt-6 shadow-invoice bg-primary shadow-primary-glow">
                        <span className="font-black text-xl uppercase tracking-tighter text-white">GRAND TOTAL</span>
                        <span className="font-black text-2xl tracking-tighter text-white">
                            {parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL
                        </span>
                    </div>
                </div>
            </div>

            {/* General Total Section (Bottom) */}
            <div className="flex justify-between items-center bg-accent-champagne p-4 rounded-lg mt-4">
                <span className="font-black text-lg text-text-dark">GENEL TOPLAM</span>
                <span className="font-black text-xl tracking-tighter text-text-dark">{parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span>
            </div>
        </div>
    );
});

Invoice.displayName = 'Invoice';

export default Invoice;
