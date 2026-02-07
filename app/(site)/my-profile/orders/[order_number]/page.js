"use client";
import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { Box, Typography, CircularProgress, Button, Divider } from "@mui/material";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Invoice from "@/components/Invoice";

export default function OrderDetailsPage({ params }) {
    const { order_number } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const invoiceRef = useRef(null);

    const handleDownloadInvoice = async () => {
        if (!invoiceRef.current) return;
        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff', // Ensure white background
                windowWidth: 1200, // Ensure desktop layout is captured
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${order.order_number}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

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
            <Box className="p-12 flex justify-center items-center">
                <CircularProgress className="!text-primary" />
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Box className="p-12 text-center">
                <Typography variant="h6" className="text-red-500 font-bold">{error || "Order not found."}</Typography>
                <Button onClick={() => router.push('/my-profile/orders')} className="mt-4 !text-primary !font-bold">
                    Back to My Orders
                </Button>
            </Box>
        );
    }

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };


    return (
        <main className="flex flex-col flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-10 py-6 gap-6 bg-white dark:bg-surface-dark">
            {/* Page Heading */}
            <Box className="flex flex-wrap justify-between items-end gap-4 bg-white dark:bg-white/5 p-6 rounded-xl border border-[#e1e4e2] dark:border-white/10 shadow-sm">
                <Box className="flex min-w-72 flex-col gap-2">
                    <Box className="flex items-center gap-3">
                        <h1 className="text-text-dark dark:text-white text-3xl font-black leading-tight tracking-tight">Order Details</h1>
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-black rounded-full border border-primary/30 uppercase tracking-wider">
                            {order.status_label}
                        </span>
                    </Box>
                    <p className="text-text-muted dark:text-white/60 text-base font-normal">
                        Order No: #{order.order_number} | {formatDate(order.created_at)}
                    </p>
                </Box>
                <Box className="flex gap-3">
                    <button onClick={handleDownloadInvoice} className="flex items-center gap-2 rounded-xl h-11 px-6 bg-background-light dark:bg-white/10 text-text-dark dark:text-white text-sm font-bold hover:bg-primary/10 transition-colors">
                        <DescriptionIcon sx={{ fontSize: 20 }} />
                        <span>Download Invoice</span>
                    </button>
                </Box>
            </Box>

            {/* Timeline / Progress */}
            <Box className="bg-white dark:bg-white/5 p-6 rounded-xl border border-[#e1e4e2] dark:border-white/10 shadow-sm">
                <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    <Box className="flex flex-col items-center md:items-start gap-2 relative z-10">
                        <Box className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                            <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box className="flex flex-col items-center md:items-start">
                            <p className="text-text-dark dark:text-white text-sm font-bold">Order Received</p>
                            <p className="text-text-muted dark:text-white/60 text-xs">{formatDate(order.created_at)}</p>
                        </Box>
                    </Box>
                    <Box className="flex flex-col items-center md:items-start gap-2 relative z-10">
                        <Box className={`size-10 rounded-full flex items-center justify-center text-white ${['processing', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                            <InventoryIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box className="flex flex-col items-center md:items-start">
                            <p className="text-text-dark dark:text-white text-sm font-bold">Processing</p>
                        </Box>
                    </Box>
                    <Box className="flex flex-col items-center md:items-start gap-2 relative z-10">
                        <Box className={`size-10 rounded-full flex items-center justify-center text-white ${['shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-primary ring-4 ring-primary/20' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                            <LocalShippingIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box className="flex flex-col items-center md:items-start">
                            <p className={`text-sm font-black ${order.status?.toLowerCase() === 'shipped' ? 'text-primary' : 'text-text-dark dark:text-white'}`}>Shipped</p>
                        </Box>
                    </Box>
                    <Box className={`flex flex-col items-center md:items-start gap-2 relative z-10 ${order.status?.toLowerCase() === 'delivered' ? '' : 'opacity-40'}`}>
                        <Box className={`size-10 rounded-full flex items-center justify-center text-white ${order.status?.toLowerCase() === 'delivered' ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                            <HomeIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box className="flex flex-col items-center md:items-start">
                            <p className="text-text-dark dark:text-white text-sm font-bold">Delivered</p>
                            <p className="text-text-muted dark:text-white/60 text-xs">Est. 3-5 Business Days</p>
                        </Box>
                    </Box>
                    {/* Progress Line Desktop */}
                    <Box className="hidden md:block absolute top-5 left-10 right-10 h-0.5 bg-gray-200 dark:bg-white/10 -z-0">
                        <Box className="bg-primary h-full transition-all duration-1000" style={{ width: order.status?.toLowerCase() === 'delivered' ? '100%' : order.status?.toLowerCase() === 'shipped' ? '66%' : order.status?.toLowerCase() === 'processing' ? '33%' : '0%' }}></Box>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Layout (2 Columns) */}
            <Box className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Products */}
                <Box className="lg:col-span-2 flex flex-col gap-4">
                    <Box className="flex items-center justify-between">
                        <h2 className="text-text-dark dark:text-white text-[22px] font-bold tracking-tight">Items in Order ({order.items?.length})</h2>
                    </Box>
                    {order.items?.map((item) => (
                        <Box key={item.id} className="group bg-white dark:bg-white/5 p-4 rounded-xl border border-[#e1e4e2] dark:border-white/10 flex gap-4 hover:shadow-md transition-shadow">
                            <Box className="size-24 rounded-lg bg-background-light dark:bg-white/10 overflow-hidden flex-shrink-0">
                                <img src={item.image || 'https://via.placeholder.com/150'} alt={item.title} className="w-full h-full object-cover" />
                            </Box>
                            <Box className="flex flex-col justify-between flex-1">
                                <Box className="flex justify-between items-start">
                                    <Box>
                                        <h3 className="text-text-dark dark:text-white font-bold text-base group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-text-muted dark:text-white/60 text-xs">SKU: {item.sku}</p>
                                    </Box>
                                    <p className="text-text-dark dark:text-white font-black">{parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</p>
                                </Box>
                                <Box className="flex items-center justify-between mt-2">
                                    <p className="text-text-muted dark:text-white/60 text-sm">Qty: <span className="font-bold text-text-dark dark:text-white">{item.quantity}</span></p>
                                    <button className="text-primary text-xs font-black hover:underline">Rate Product</button>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Right Column: Sidebar */}
                <Box className="flex flex-col gap-6 sticky top-24">
                    {/* Address Info */}
                    <Box className="bg-white dark:bg-white/5 p-6 rounded-xl border border-[#e1e4e2] dark:border-white/10 flex flex-col gap-4 shadow-sm">
                        <Box className="flex items-center gap-2">
                            <LocationOnIcon className="text-primary" sx={{ fontSize: 20 }} />
                            <h4 className="text-text-dark dark:text-white font-bold text-base">Delivery Information</h4>
                        </Box>
                        <Box className="text-sm">
                            <p className="text-text-dark dark:text-white font-bold">{order.shipping_address?.full_name}</p>
                            <p className="text-text-muted dark:text-white/60 leading-relaxed mt-1">
                                {order.shipping_address?.address_line} {order.shipping_address?.district}/{order.shipping_address?.city}
                            </p>
                            <p className="text-text-muted dark:text-white/60 mt-1">{order.shipping_address?.phone_number}</p>
                        </Box>
                        <Divider className="!border-[#e1e4e2] dark:!border-white/10" />
                        <Box className="flex items-center gap-2">
                            <CreditCardIcon className="text-primary" sx={{ fontSize: 20 }} />
                            <h4 className="text-text-dark dark:text-white font-bold text-base">Payment Method</h4>
                        </Box>
                        <Box className="flex items-center gap-3">
                            <Box className="w-10 h-6 bg-background-light dark:bg-white/10 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center">
                                <span className="text-[8px] font-bold italic">CARD</span>
                            </Box>
                            <p className="text-text-dark dark:text-white text-sm font-medium">Credit/Debit Card</p>
                        </Box>
                    </Box>

                    {/* Cost Summary */}
                    <Box className="bg-white dark:bg-white/5 p-6 rounded-xl border border-[#e1e4e2] dark:border-white/10 flex flex-col gap-3 shadow-sm">
                        <h4 className="text-text-dark dark:text-white font-bold text-base pb-2">Order Summary</h4>
                        <Box className="flex justify-between items-center text-sm">
                            <span className="text-text-muted dark:text-white/60">Subtotal</span>
                            <span className="text-text-dark dark:text-white font-medium">{parseFloat(order.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span>
                        </Box>
                        <Box className="flex justify-between items-center text-sm">
                            <span className="text-text-muted dark:text-white/60">Shipping Fee</span>
                            <span className={`font-bold ${parseFloat(order.shipping_cost) === 0 ? 'text-primary' : 'text-text-dark'}`}>
                                {parseFloat(order.shipping_cost) === 0 ? 'FREE' : `${parseFloat(order.shipping_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL`}
                            </span>
                        </Box>
                        <Box className="mt-4 pt-4 border-t border-[#e1e4e2] dark:border-white/10 flex justify-between items-center">
                            <span className="text-text-dark dark:text-white font-black text-lg">Total</span>
                            <span className="text-accent font-black text-2xl tracking-tighter">{parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span>
                        </Box>
                        <button onClick={() => router.push(`/my-profile/orders/${order.order_number}/cancel`)} className="w-full mt-4 bg-background-light dark:bg-white/10 text-text-dark dark:text-white font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition-all">
                            Cancel Order
                        </button>
                    </Box>
                </Box>
            </Box>
            {/* Hidden Invoice Component for PDF Generation */}
            <div style={{ position: "absolute", top: -9999, left: -9999 }}>
                <Invoice order={order} ref={invoiceRef} />
            </div>
        </main>
    );
}
