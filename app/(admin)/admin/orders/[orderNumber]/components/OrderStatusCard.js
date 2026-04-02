'use client';

import { Button, MenuItem, Paper, TextField } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { formatDate } from '@/lib/admin/order-display';

export default function OrderStatusCard({
    status,
    statusOptions,
    currentStatusTitle,
    currentStatusClasses,
    statusUpdatedByAdmin,
    statusUpdatedAt,
    saving,
    isStatusChanged,
    isStatusLocked,
    onStatusChange,
    onUpdateStatus,
}) {
    const StatusIcon = currentStatusClasses.icon;

    return (
        <Paper className="!rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm">
            <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-text-main">Sipariş Durumu</h2>
            </div>

            <div className="space-y-4">
                <div className={`flex items-center gap-3 rounded-2xl border p-4 ${currentStatusClasses.panel}`}>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/70">
                        <StatusIcon className={currentStatusClasses.iconClassName} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">Mevcut Durum</p>
                        <p className="mt-1 text-sm font-bold">{currentStatusTitle}</p>
                    </div>
                </div>

                <TextField
                    select
                    label="Durumu Güncelle"
                    value={status}
                    onChange={(event) => onStatusChange(event.target.value)}
                    disabled={isStatusLocked}
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '1rem',
                            backgroundColor: '#f8f9fa',
                        },
                    }}
                    helperText={`Mevcut sipariş durumu: ${currentStatusTitle}`}
                >
                    {statusOptions.map((option) => (
                        <MenuItem key={option.id} value={String(option.id)}>
                            {option.title}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    onClick={onUpdateStatus}
                    disabled={saving || isStatusLocked || !isStatusChanged}
                    startIcon={<SaveRoundedIcon />}
                    className="!w-full !rounded-2xl !bg-primary !py-3 !font-bold !text-white hover:!bg-primary-dark disabled:!opacity-50"
                >
                    {saving ? 'Güncelleniyor...' : 'Sipariş Güncelle'}
                </Button>

                {statusUpdatedByAdmin && statusUpdatedAt ? (
                    <div className="rounded-2xl border border-primary/10 bg-background-light px-4 py-3 text-sm text-text-muted">
                        Son güncelleme: <span className="font-semibold text-text-main">{statusUpdatedByAdmin}</span>
                        <br />
                        <span>{formatDate(statusUpdatedAt)}</span>
                    </div>
                ) : null}
            </div>
        </Paper>
    );
}
