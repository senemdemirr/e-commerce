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
                <h2 className="font-display text-xl font-bold text-text-main">Internal Admin Notes</h2>
                <p className="mt-1 text-sm text-text-muted">
                    Add the reason for the change while updating the status. The saved note is shown in the order details.
                </p>
            </div>
            <TextField
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                placeholder="Describe why the order status is being updated..."
                multiline
                minRows={5}
                fullWidth
                className="!rounded-3xl"
                helperText={disabled && hasSavedNote
                    ? 'This order is in a final state. The saved admin note is shown as read-only.'
                    : 'The note is saved to the database during the status update.'}
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
