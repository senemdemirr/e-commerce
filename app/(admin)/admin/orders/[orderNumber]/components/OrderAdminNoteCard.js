'use client';

import { Paper, TextField } from '@mui/material';

export default function OrderAdminNoteCard({
    value,
    disabled,
    hasSavedNote,
    onChange,
}) {
    return (
        <Paper className="!rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm">
            <div className="mb-4">
                <h2 className="font-display text-xl font-bold text-text-main">Dahili Admin Notları</h2>
                <p className="mt-1 text-sm text-text-muted">
                    Durum güncellenirken bu alana değişiklik sebebini yazabilirsiniz. Kaydedilen not sipariş detayında gösterilir.
                </p>
            </div>
            <TextField
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                placeholder="Sipariş durumunun neden güncellendiğini yazın..."
                multiline
                minRows={5}
                fullWidth
                className="!rounded-3xl"
                helperText={disabled && hasSavedNote
                    ? 'Bu sipariş final durumda. Kayıtlı admin notu salt okunur olarak gösteriliyor.'
                    : 'Not, durum güncellemesi sırasında veritabanına kaydedilir.'}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '1rem',
                        backgroundColor: '#f8f9fa',
                    },
                }}
            />
        </Paper>
    );
}
