'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Button, InputBase, Paper } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CustomersStatsCards from '@/components/admin/customers/CustomersStatsCards';
import CustomersTable from '@/components/admin/customers/CustomersTable';

function formatDate(value, options = {}) {
    if (!value) return 'Belirtilmedi';

    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...options,
    }).format(new Date(value));
}

function formatCurrency(value) {
    return `${new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0))} ₺`;
}

function getFullName(customer) {
    const fullName = [customer.name, customer.surname].filter(Boolean).join(' ').trim();
    return fullName || 'İsimsiz müşteri';
}

function exportCustomersToCsv(customers) {
    const headers = ['Musteri ID', 'Ad Soyad', 'E-posta', 'Telefon', 'Kayit Tarihi', 'Siparis Sayisi', 'Toplam Harcama', 'Durum'];
    const rows = customers.map((customer) => [
        `C-${String(customer.id).padStart(4, '0')}`,
        getFullName(customer),
        customer.email || '',
        customer.phone || '',
        formatDate(customer.created_at),
        customer.order_count || 0,
        formatCurrency(customer.total_spent),
        Number(customer.activate ?? 1) === 1 ? 'Aktif' : 'Pasif',
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'musteriler.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function CustomersPage() {
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
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
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
            if (!res.ok) throw new Error('Müşteriler getirilemedi');
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

    const handleDeleteCustomer = async () => {
        if (!deleteTarget?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            const response = await fetch(`/api/admin/customers/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { role: 'admin' },
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Müşteri silinemedi');
            }

            const nextPage = customers.length === 1 && pagination.page > 1
                ? pagination.page - 1
                : pagination.page;

            enqueueSnackbar('Müşteri silindi', { variant: 'success' });
            setDeleteTarget(null);
            await fetchCustomers(nextPage, activeSegment, debouncedSearch);
        } catch (error) {
            enqueueSnackbar(error.message || 'Müşteri silinemedi', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-8">
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
                                    Kayıt hacmini, sipariş aktivitesini ve doğrulama durumlarını aynı akışta izleyin.
                                    Arama ve segment filtreleri doğrudan gerçek veriye bağlı çalışır.
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 xl:max-w-xl">
                                <Paper className="flex items-center gap-3 !rounded-2xl !border !border-primary/10 !bg-background-light !px-4 !py-3 !shadow-none">
                                    <SearchRoundedIcon className="text-text-muted" />
                                    <InputBase
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        placeholder="İsim, e-posta veya telefon ile ara..."
                                        className="w-full text-sm text-text-main"
                                        inputProps={{ 'aria-label': 'Müşteri ara' }}
                                    />
                                </Paper>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        onClick={() => exportCustomersToCsv(customers)}
                                        startIcon={<FileDownloadOutlinedIcon />}
                                        className="!rounded-2xl !border !border-primary/10 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-background-light"
                                    >
                                        CSV Dışa Aktar
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
                    onDelete={setDeleteTarget}
                />
            </div>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={deleteTarget ? `${getFullName(deleteTarget)} silinsin mi?` : 'Müşteri silinsin mi?'}
                description={deleteTarget
                    ? 'Bu işlem müşteri hesabını kalıcı olarak kaldırır. Sipariş geçmişi olan müşteriler silinemez.'
                    : 'Bu işlem geri alınamaz.'}
                confirmText="Sil"
                loading={deleteLoading}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteCustomer}
            />
        </>
    );
}
