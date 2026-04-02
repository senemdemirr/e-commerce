'use client';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function ConfirmDialog({
    open,
    title = 'Emin misiniz?',
    description = 'Bu islem geri alinamaz.',
    confirmText = 'Onayla',
    cancelText = 'Vazgec',
    loading = false,
    onClose,
    onConfirm,
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                className: '!rounded-[28px] !bg-white',
            }}
        >
            <DialogTitle className="!px-6 !pb-2 !pt-6">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <WarningAmberRoundedIcon />
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-bold text-text-main">{title}</h2>
                    </div>
                </div>
            </DialogTitle>

            <DialogContent className="!px-6 !pb-3 !pt-2">
                <p className="text-sm leading-6 text-text-muted">{description}</p>
            </DialogContent>

            <DialogActions className="!px-6 !pb-6 !pt-2">
                <Button
                    onClick={onClose}
                    disabled={loading}
                    className="!rounded-2xl !px-4 !py-2 !font-semibold !text-text-muted"
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    className="!rounded-2xl !bg-red-500 !px-5 !py-2.5 !font-bold !text-white hover:!bg-red-600 disabled:!opacity-60"
                >
                    {loading ? 'Isleniyor...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
