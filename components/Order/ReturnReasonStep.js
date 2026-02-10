import React from 'react';
import { CloudUpload } from '@mui/icons-material';

const ReturnReasonStep = ({ order, selectedItems, itemDetails, reasons, handleDetailChange }) => {
    return (
        <>
            <h2 className="text-secondary text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 pt-4 border-b border-[#f1f3f2] dark:border-white/10 mb-6">
                Specify Return Reasons
            </h2>
            <div className="space-y-6 mb-8">
                {order.items?.filter(item => selectedItems[item.id]).map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 p-6 bg-white dark:bg-white/5 rounded-xl border-2 border-primary shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg shrink-0"
                                style={{ backgroundImage: `url("${item.image || 'https://via.placeholder.com/150'}")` }}>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-text-dark dark:text-white font-bold text-base">{item.title}</h3>
                                    <span className="font-black text-primary">{parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span>
                                </div>
                                <p className="text-xs text-text-muted">SKU: {item.sku} | Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 mt-4 pt-4 border-t border-[#f1f3f2] dark:border-white/10">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-text-dark dark:text-white mb-2 block">Return Reason</label>
                                    <select
                                        className="w-full rounded-lg border-[#f1f3f2] dark:border-white/10 bg-[#f6f7f7] dark:bg-white/5 text-sm focus:border-primary focus:ring-0 text-text-dark dark:text-white py-2 px-3"
                                        value={itemDetails[item.id]?.reason_id || ""}
                                        onChange={(e) => handleDetailChange(item.id, 'reason_id', parseInt(e.target.value))}
                                    >
                                        {reasons.map(r => (
                                            <option key={r.id} value={r.id}>{r.reason_text}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-text-dark dark:text-white mb-2 block">Description</label>
                                    <textarea
                                        className="w-full rounded-lg border-[#f1f3f2] dark:border-white/10 bg-[#f6f7f7] dark:bg-white/5 text-sm focus:border-primary focus:ring-0 resize-none text-text-dark dark:text-white p-3"
                                        placeholder="Please provide more details about your return reason..."
                                        rows="3"
                                        value={itemDetails[item.id]?.note || ""}
                                        onChange={(e) => handleDetailChange(item.id, 'note', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ReturnReasonStep;
