'use client';

import { Paper, TextField } from '@mui/material';

export default function OrderAdminNoteCard({ value, onChange }) {
    return (
        <Paper className="!rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm">
            <div className="mb-4">
                <h2 className="font-display text-xl font-bold text-text-main">Dahili Admin Notları</h2>
                <p className="mt-1 text-sm text-text-muted">Bu alan yerel taslak olarak kullanılır, henüz veritabanına kaydedilmez.</p>
            </div>
            <TextField
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Siparişle ilgili operasyon notu, kargo uyarısı veya ekip içi açıklama ekleyin..."
                multiline
                minRows={5}
                fullWidth
                className="!rounded-3xl"
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
