'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Button, InputBase, Paper } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice';
import CustomersStatsCards from '@/components/admin/customers/CustomersStatsCards';
import CustomerDetailModal from '@/components/admin/customers/CustomerDetailModal';
import CustomersTable from '@/components/admin/customers/CustomersTable';
import { useAdminSession } from '@/context/AdminSessionContext';

function formatDate(value, options = {}) {
    if (!value) return 'Not specified';

    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...options,
    }).format(new Date(value));
}

function formatCurrency(value) {
    return `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0))} ₺`;
}

function getFullName(customer) {
    const fullName = [customer.name, customer.surname].filter(Boolean).join(' ').trim();
    return fullName || 'Unnamed customer';
}

function exportCustomersToCsv(customers) {
    const headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'Signup Date', 'Order Count', 'Total Spend', 'Status'];
    const rows = customers.map((customer) => [
        `C-${String(customer.id).padStart(4, '0')}`,
        getFullName(customer),
        customer.email || '',
        customer.phone || '',
        formatDate(customer.created_at),
        customer.order_count || 0,
        formatCurrency(customer.total_spent),
        Number(customer.activate ?? 1) === 1 ? 'Active' : 'Inactive',
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function CustomersPage() {
    const { canMutate, loading: adminLoading } = useAdminSession();
    const [customers, setCustomers] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        newThisMonth: 0,
        active: 0,
        prospect: 0,
        verified: 0,
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [activeSegment, setActiveSegment] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailUpdating, setDetailUpdating] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    const fetchCustomers = useCallback(async (page = 1, segment = 'all', search = '') => {
        try {
            setLoading(true);
            const query = new URLSearchParams({ page, limit: 10 });
            if (segment && segment !== 'all') query.append('segment', segment);
            if (search) query.append('search', search);

            const res = await fetch(`/api/admin/customers?${query.toString()}`, {
                headers: { role: 'admin' },
            });
            if (!res.ok) throw new Error('Customers could not be loaded');
            const data = await res.json();

            setCustomers(data.customers || []);
            setSummary(data.summary || {
                total: 0,
                newThisMonth: 0,
                active: 0,
                prospect: 0,
                verified: 0,
            });
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchCustomers(1, activeSegment, debouncedSearch);
    }, [activeSegment, debouncedSearch, fetchCustomers]);

    const handleOpenCustomerDetail = useCallback((customer) => {
        setSelectedCustomer(customer);
    }, []);

    const handleCloseCustomerDetail = useCallback(() => {
        if (detailUpdating) {
            return;
        }

        setSelectedCustomer(null);
    }, [detailUpdating]);

    const handleCustomerActiveChange = useCallback(async (checked) => {
        if (!selectedCustomer) {
            return;
        }

        if (!canMutate) {
            enqueueSnackbar('Only superadmin can update customer status.', { variant: 'warning' });
            return;
        }

        try {
            setDetailUpdating(true);

            const res = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'admin',
                },
                body: JSON.stringify({ activate: checked ? 1 : 0 }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Customer status could not be updated');

            setSelectedCustomer((current) => (
                current && current.id === data.id
                    ? { ...current, ...data }
                    : current
            ));
            setCustomers((current) => current.map((customer) => (
                customer.id === data.id
                    ? { ...customer, ...data, order_count: customer.order_count, total_spent: customer.total_spent }
                    : customer
            )));
            setSelectedCustomer(null);

            await fetchCustomers(pagination.page, activeSegment, debouncedSearch);
            enqueueSnackbar(
                checked ? 'Customer account activated' : 'Customer account deactivated',
                { variant: 'success' }
            );
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setDetailUpdating(false);
        }
    }, [activeSegment, canMutate, debouncedSearch, enqueueSnackbar, fetchCustomers, pagination.page, selectedCustomer]);

    return (
        <div className="space-y-8">
            {!adminLoading && !canMutate ? (
                <ReadOnlyNotice description="This account can review customer records but activation changes are limited to superadmin." />
            ) : null}

            <Paper className="!relative !overflow-hidden !rounded-[32px] !border !border-primary/10 !bg-white !shadow-sm">
                <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
                <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-secondary/15 blur-2xl" />

                <div className="relative space-y-8 p-6 sm:p-8">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-2xl">
                            <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-text-main sm:text-4xl">
                                Customer Management
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
                                Track signup volume, order activity, and verification status in one flow.
                                Search and segment filters are connected directly to live data.
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 xl:max-w-xl">
                            <Paper className="flex items-center gap-3 !rounded-2xl !border !border-primary/10 !bg-background-light !px-4 !py-3 !shadow-none">
                                <SearchRoundedIcon className="text-text-muted" />
                                <InputBase
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search by name, email, or phone..."
                                    className="w-full text-sm text-text-main"
                                    inputProps={{ 'aria-label': 'Search customers' }}
                                />
                            </Paper>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    onClick={() => exportCustomersToCsv(customers)}
                                    startIcon={<FileDownloadOutlinedIcon />}
                                    className="!rounded-2xl !border !border-primary/10 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-background-light"
                                >
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Paper>

            <CustomersStatsCards summary={summary} />

            <CustomersTable
                loading={loading}
                customers={customers}
                summary={summary}
                pagination={pagination}
                activeSegment={activeSegment}
                onSegmentChange={setActiveSegment}
                onPageChange={(page) => fetchCustomers(page, activeSegment, debouncedSearch)}
                onOpenDetail={handleOpenCustomerDetail}
            />

            <CustomerDetailModal
                open={Boolean(selectedCustomer)}
                customer={selectedCustomer}
                updating={detailUpdating}
                canMutate={canMutate}
                onClose={handleCloseCustomerDetail}
                onSave={handleCustomerActiveChange}
            />
        </div>
    );
}
