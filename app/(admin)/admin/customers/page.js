'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { Avatar, Button, Chip, CircularProgress, IconButton, InputBase, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

const STAT_CARDS = [
    {
        key: 'total',
        title: 'Toplam Müşteri',
        description: 'Portföydeki toplam kullanıcı sayısı',
        icon: Groups2RoundedIcon,
        iconClassName: 'bg-primary/10 text-primary-dark',
        glowClassName: 'bg-primary/10',
    },
    {
        key: 'newThisMonth',
        title: 'Yeni Müşteriler',
        description: 'Bu ay sisteme katılan kullanıcılar',
        icon: PersonAddAlt1RoundedIcon,
        iconClassName: 'bg-secondary/20 text-secondary',
        glowClassName: 'bg-secondary/10',
    },
    {
        key: 'active',
        title: 'Aktif Alıcılar',
        description: 'En az bir sipariş veren müşteriler',
        icon: MarkEmailReadRoundedIcon,
        iconClassName: 'bg-accent/15 text-accent',
        glowClassName: 'bg-accent/10',
    },
    {
        key: 'prospect',
        title: 'Pasif Müşteriler',
        description: 'Henüz sipariş vermemiş hesaplar',
        icon: PersonOffRoundedIcon,
        iconClassName: 'bg-slate-100 text-slate-500',
        glowClassName: 'bg-slate-100',
    },
];

const SEGMENT_OPTIONS = [
    { key: 'all', label: 'Tümü', countKey: 'total' },
    { key: 'active', label: 'Aktif', countKey: 'active' },
    { key: 'prospect', label: 'Pasif', countKey: 'prospect' },
    { key: 'verified', label: 'Doğrulanan', countKey: 'verified' },
    { key: 'new', label: 'Bu Ay', countKey: 'newThisMonth' },
];

function buildPaginationItems(page, totalPages) {
    if (totalPages <= 1) return [1];
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const items = new Set([1, page - 1, page, page + 1, totalPages]);
    const ordered = [...items].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);

    return ordered.flatMap((item, index) => {
        const previous = ordered[index - 1];
        if (index > 0 && item - previous > 1) {
            return ['ellipsis', item];
        }
        return [item];
    });
}

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

function getInitials(customer) {
    const name = getFullName(customer);

    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
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
        customer.order_count > 0 ? 'Aktif' : 'Pasif',
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


    const paginationItems = buildPaginationItems(pagination.page, pagination.totalPages);

    return (
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {STAT_CARDS.map((card) => {
                        const Icon = card.icon;
                        const value = Number(summary[card.key] || 0);
                        const ratio = summary.total > 0 ? Math.round((value / summary.total) * 100) : 0;

                        return (
                            <Paper
                                key={card.key}
                                className="group !relative !overflow-hidden !rounded-[28px]  !p-5 !shadow-none"
                            >
                                <div className="relative flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-text-muted">{card.title}</p>
                                        <h2 className="mt-3 font-display text-3xl font-black text-text-main">
                                            {value.toLocaleString('tr-TR')}
                                        </h2>
                                        <p className="mt-3 inline-flex rounded-full bg-background-light px-2.5 py-1 text-xs font-semibold text-text-muted">
                                            %{ratio} portföy payı
                                        </p>
                                        <p className="mt-4 text-xs leading-5 text-text-muted">{card.description}</p>
                                    </div>
                                    <div className={`flex size-12 items-center justify-center rounded-2xl ${card.iconClassName}`}>
                                        <Icon />
                                    </div>
                                </div>
                            </Paper>
                        );
                    })}
                </div>

            <Paper className="!overflow-hidden !rounded-[32px] !border !border-primary/10 !bg-white !shadow-sm">
                <div className="border-b border-primary/10 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="font-display text-2xl font-black text-text-main">Müşteri Listesi</h2>
                            <p className="mt-1 text-sm text-text-muted">
                                Sipariş aktivitesi, doğrulama durumu ve iletişim bilgileri tek görünümde.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start xl:self-auto">
                            <Tooltip title="Listeyi yazdır">
                                <IconButton
                                    onClick={() => window.print()}
                                    className="!rounded-2xl !border !border-primary/10 !bg-background-light !text-text-muted hover:!bg-white"
                                >
                                    <PrintOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Aktif görünümü göster">
                                <IconButton
                                    onClick={() => setActiveSegment('active')}
                                    className="!rounded-2xl !border !border-primary/10 !bg-background-light !text-text-muted hover:!bg-white"
                                >
                                    <FilterListRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    <div
                        className="mt-5 overflow-x-auto pb-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                        <div className="flex min-w-max items-center gap-2">
                            {SEGMENT_OPTIONS.map((segment) => (
                                <Chip
                                    key={segment.key}
                                    clickable
                                    label={`${segment.label} (${Number(summary[segment.countKey] || 0).toLocaleString('tr-TR')})`}
                                    onClick={() => setActiveSegment(segment.key)}
                                    className={activeSegment === segment.key
                                        ? '!rounded-2xl !bg-primary !px-1 !font-semibold !text-white'
                                        : '!rounded-2xl !border !border-primary/10 !bg-background-light !px-1 !font-medium !text-text-muted'}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-[360px] items-center justify-center">
                        <CircularProgress className="!text-primary" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 text-center">
                        <div className="flex size-16 items-center justify-center rounded-[28px] bg-primary/10 text-primary-dark">
                            <Groups2RoundedIcon fontSize="large" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-display text-xl font-black text-text-main">Eşleşen müşteri bulunamadı</h3>
                            <p className="text-sm text-text-muted">
                                Arama ifadesini veya aktif segmenti değiştirerek listeyi yeniden genişletebilirsiniz.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <TableContainer className="overflow-x-auto">
                            <Table
                                className="min-w-[1080px]"
                                sx={{
                                    '& .MuiTableCell-root': {
                                        borderColor: 'rgba(141, 200, 161, 0.12)',
                                    },
                                }}
                            >
                                <TableHead>
                                    <TableRow className="bg-background-light">
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-[11px] !font-bold !uppercase !tracking-[0.24em] !text-text-muted">
                                            Müşteri Bilgileri
                                        </TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-[11px] !font-bold !uppercase !tracking-[0.24em] !text-text-muted">
                                            İletişim
                                        </TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-[11px] !font-bold !uppercase !tracking-[0.24em] !text-text-muted">
                                            Kayıt Tarihi
                                        </TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-[11px] !font-bold !uppercase !tracking-[0.24em] !text-text-muted">
                                            Sipariş / Harcama
                                        </TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-[11px] !font-bold !uppercase !tracking-[0.24em] !text-text-muted">
                                            Durum
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            className="!border-b !border-primary/10 !px-6 !py-4 !text-[11px] !font-bold !uppercase !tracking-[0.24em] !text-text-muted"
                                        >
                                            İşlemler
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customers.map((customer) => {
                                        const isActive = customer.order_count > 0;
                                        const name = getFullName(customer);

                                        return (
                                            <TableRow
                                                key={customer.id}
                                                hover
                                                className="transition-colors hover:!bg-background-light/70"
                                            >
                                                <TableCell className="!px-6 !py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            className={isActive
                                                                ? '!h-12 !w-12 !bg-primary/15 !text-sm !font-bold !text-primary-dark'
                                                                : '!h-12 !w-12 !bg-slate-200 !text-sm !font-bold !text-slate-600'}
                                                        >
                                                            {getInitials(customer)}
                                                        </Avatar>

                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="truncate text-sm font-bold text-text-main">{name}</p>
                                                                {customer.email_verified && (
                                                                    <Chip
                                                                        size="small"
                                                                        label="Doğrulandı"
                                                                        className="!h-6 !rounded-full !bg-primary/10 !text-[11px] !font-semibold !text-primary-dark"
                                                                    />
                                                                )}
                                                            </div>
                                                            <p className="mt-1 text-xs text-text-muted">
                                                                Müşteri ID: #C-{String(customer.id).padStart(4, '0')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="!px-6 !py-5">
                                                    <div className="text-sm">
                                                        <p className="font-semibold text-text-main">{customer.email}</p>
                                                        <p className="mt-1 text-xs text-text-muted">
                                                            {customer.phone || 'Telefon bilgisi yok'}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="!px-6 !py-5">
                                                    <div className="text-sm">
                                                        <p className="font-semibold text-text-main">{formatDate(customer.created_at)}</p>
                                                        <p className="mt-1 text-xs text-text-muted">
                                                            Son sipariş: {customer.last_order_date ? formatDate(customer.last_order_date) : 'Yok'}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="!px-6 !py-5">
                                                    <div className="text-sm">
                                                        <p className="font-bold text-text-main">
                                                            {customer.order_count.toLocaleString('tr-TR')} sipariş
                                                        </p>
                                                        <p className="mt-1 text-xs font-semibold text-primary-dark">
                                                            {formatCurrency(customer.total_spent)}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="!px-6 !py-5">
                                                    <div className="flex flex-col items-start gap-2">
                                                        <Chip
                                                            label={isActive ? 'Aktif' : 'Pasif'}
                                                            className={isActive
                                                                ? '!rounded-full !bg-green-100 !font-bold !text-green-700'
                                                                : '!rounded-full !bg-slate-100 !font-bold !text-slate-600'}
                                                        />
                                                        <span className="text-xs text-text-muted">
                                                            {customer.email_verified ? 'E-posta doğrulandı' : 'E-posta doğrulanmadı'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell align="right" className="!px-6 !py-5">
                                                    <Tooltip title="Müşteri detayını aç">
                                                        <IconButton
                                                            component={Link}
                                                            href={`/admin/customers/${customer.id}`}
                                                            className="!rounded-2xl !text-text-muted hover:!bg-primary/10 hover:!text-primary-dark"
                                                        >
                                                            <VisibilityRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div className="flex flex-col gap-3 border-t border-primary/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-sm text-text-muted">
                                {pagination.total.toLocaleString('tr-TR')} kayıttan{' '}
                                {customers.length > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}
                                -
                                {((pagination.page - 1) * pagination.limit) + customers.length} arası gösteriliyor
                            </p>

                            <div className="flex items-center gap-1 self-start sm:self-auto">
                                <IconButton
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchCustomers(pagination.page - 1, activeSegment, debouncedSearch)}
                                    className="!rounded-2xl !text-text-muted disabled:!opacity-40"
                                >
                                    <KeyboardArrowLeftRoundedIcon />
                                </IconButton>

                                {paginationItems.map((item, index) => {
                                    if (item === 'ellipsis') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="px-2 text-sm text-text-muted">
                                                ...
                                            </span>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={item}
                                            onClick={() => fetchCustomers(item, activeSegment, debouncedSearch)}
                                            className={pagination.page === item
                                                ? '!min-w-10 !rounded-2xl !bg-primary !px-0 !text-sm !font-bold !text-white hover:!bg-primary-dark'
                                                : '!min-w-10 !rounded-2xl !bg-background-light !px-0 !text-sm !font-semibold !text-text-muted hover:!bg-white'}
                                        >
                                            {item}
                                        </Button>
                                    );
                                })}

                                <IconButton
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchCustomers(pagination.page + 1, activeSegment, debouncedSearch)}
                                    className="!rounded-2xl !text-text-muted disabled:!opacity-40"
                                >
                                    <KeyboardArrowRightRoundedIcon />
                                </IconButton>
                            </div>
                        </div>
                    </>
                )}
            </Paper>
        </div>
    );
}
