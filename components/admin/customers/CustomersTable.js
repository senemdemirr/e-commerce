'use client';

import Link from 'next/link';
import { Avatar, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, } from '@mui/material';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

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

function formatDate(value) {
    if (!value) return 'Belirtilmedi';

    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
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
    return getFullName(customer)
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export default function CustomersTable({
    loading,
    customers,
    summary,
    pagination,
    activeSegment,
    onSegmentChange,
    onPageChange,
    onDelete,
}) {
    const paginationItems = buildPaginationItems(pagination.page, pagination.totalPages);

    return (
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
                                onClick={() => onSegmentChange('active')}
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
                                onClick={() => onSegmentChange(segment.key)}
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
                                    const isActive = Number(customer.activate ?? 1) === 1;
                                    const canDelete = customer.order_count === 0;
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
                                                        {isActive ? 'Kullanıcı hesabı aktif' : 'Kullanıcı hesabı pasif'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell align="right" className="!px-6 !py-5">
                                                <div className="flex justify-end gap-1">
                                                    <Tooltip title="Müşteri detayını aç">
                                                        <IconButton
                                                            component={Link}
                                                            href={`/admin/customers/${customer.id}`}
                                                            className="!rounded-2xl !text-text-muted hover:!bg-primary/10 hover:!text-primary-dark"
                                                        >
                                                            <VisibilityRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title={canDelete ? 'Müşteriyi sil' : 'Sipariş geçmişi olan müşteri silinemez'}>
                                                        <span>
                                                            <IconButton
                                                                disabled={!canDelete}
                                                                onClick={() => onDelete(customer)}
                                                                className="!rounded-2xl !text-text-muted hover:!bg-red-50 hover:!text-red-500 disabled:!opacity-40"
                                                            >
                                                                <DeleteRoundedIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </div>
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
                                onClick={() => onPageChange(pagination.page - 1)}
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
                                        onClick={() => onPageChange(item)}
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
                                onClick={() => onPageChange(pagination.page + 1)}
                                className="!rounded-2xl !text-text-muted disabled:!opacity-40"
                            >
                                <KeyboardArrowRightRoundedIcon />
                            </IconButton>
                        </div>
                    </div>
                </>
            )}
        </Paper>
    );
}
