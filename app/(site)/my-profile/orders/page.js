"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { Typography, Button, Box, Chip, CircularProgress } from "@mui/material";
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function MyOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiFetch("/api/orders");
                if (res.orders) {
                    setOrders(res.orders);
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.message || "Something went wrong while fetching orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    // Calculate pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return {
                    label: 'Delivered',
                    icon: <CheckCircleIcon sx={{ fontSize: 16 }} className="fill-current" />,
                    className: 'bg-secondary/10 text-secondary border border-secondary/20'
                };
            case 'shipped':
                return {
                    label: 'In the cargo',
                    icon: <LocalShippingIcon sx={{ fontSize: 16 }} className="fill-current" />,
                    className: 'bg-accent/10 text-accent border border-accent/20'
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    icon: <CancelIcon sx={{ fontSize: 16 }} className="fill-current" />,
                    className: 'bg-error/10 text-error border border-error/20'
                };
            case 'order_received':
                return {
                    label: 'Order Received',
                    icon: null,
                    className: 'bg-gray-100 text-gray-500 border border-gray-200'
                };
            case 'preparing':
                return {
                    label: 'Preparing',
                    icon: null,
                    className: 'bg-gray-100 text-gray-500 border border-gray-200'
                };
            default:
                return {
                    label: status,
                    icon: null,
                    className: 'bg-gray-100 text-gray-500 border border-gray-200'
                };
        }
    };

    if (loading) {
        return (
            <Box className="p-12 flex justify-center items-center">
                <CircularProgress className="!text-primary" />
            </Box>
        );
    }

    return (
        <Box className="flex flex-col flex-1">
            {/* Header Section */}
            <Box className="relative h-32 bg-gradient-to-r from-primary/20 via-secondary/10 to-background-light dark:from-primary/10 dark:to-surface-dark p-6 flex items-end">
                <Box className="relative z-10 w-full flex justify-between items-end">
                    <Box>
                        <h2 className="text-2xl font-bold text-text-main dark:text-white mb-1">All My Orders</h2>
                        <p className="text-text-muted dark:text-gray-400 text-sm">You can track all your orders here.</p>
                    </Box>
                    <Box className="hidden sm:block">
                        <ShoppingBasketIcon sx={{ fontSize: 60 }} className="text-primary/20 absolute bottom-[-10px] right-0 rotate-12 select-none" />
                    </Box>
                </Box>
            </Box>

            {/* Orders List Section */}
            <Box className="p-6 md:p-8 flex flex-col gap-4">
                {orders.length === 0 ? (
                    <Box className="text-center py-12">
                        <Typography className="text-text-muted">You don't have any orders yet.</Typography>
                    </Box>
                ) : (
                    currentOrders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <Box
                                key={order.id}
                                className="border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-primary/30 transition-all bg-white dark:bg-surface-dark/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <Box className="flex flex-wrap items-center gap-6">
                                    <Box className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Order No</span>
                                        <span className="text-sm font-bold text-text-main dark:text-white">#{order.order_number}</span>
                                    </Box>
                                    <Box className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Date</span>
                                        <span className="text-sm text-text-main dark:text-white">{formatDate(order.created_at)}</span>
                                    </Box>
                                    <Box className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Total Amount</span>
                                        <span className="text-sm font-black text-primary">{parseFloat(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                    </Box>
                                    <Box className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.className}`}>
                                        {statusInfo.icon}
                                        <span className="text-xs font-black">{statusInfo.label}</span>
                                    </Box>
                                </Box>
                                <button
                                    onClick={() => router.push(`/my-profile/orders/${order.order_number}`)}
                                    className="h-10 px-6 rounded-lg border border-primary/30 text-primary text-xs font-black hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <VisibilityIcon sx={{ fontSize: 18 }} />
                                    Order Details
                                </button>
                            </Box>
                        );
                    })
                )}
            </Box>

            {/* Pagination Section (Placeholder as in the design) */}
            {orders.length > ordersPerPage && (
                <Box className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`size-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <ChevronLeftIcon sx={{ fontSize: 20 }} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={`size-9 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${currentPage === number
                                        ? 'bg-primary text-white'
                                        : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`size-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <ChevronRightIcon sx={{ fontSize: 20 }} />
                        </button>
                    </nav>
                </Box>
            )}
        </Box>
    );
}
