'use client';

import {
    Button,
    Dialog,
} from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function ProductDeleteDialog({
    open,
    productTitle = 'Ürün',
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
            BackdropProps={{
                className: '!bg-text-main/55 !backdrop-blur-sm',
            }}
            PaperProps={{
                className: '!m-4 !overflow-hidden !rounded-xl !border !border-primary/10 !bg-surface-light !shadow-2xl dark:!border-primary/15 dark:!bg-surface-dark',
            }}
        >
            <div className="w-full">
                <div className="flex flex-col items-center px-6 pb-4 pt-8">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent">
                        <WarningAmberRoundedIcon className="!text-4xl" />
                    </div>
                    <h3 className="px-6 text-center text-xl font-bold text-text-main dark:text-white">
                        Ürünü silmek istediğinize emin misiniz?
                    </h3>
                </div>

                <div className="px-8 pb-8 text-center">
                    <div className="mb-4 rounded-lg border border-primary/10 bg-background-light p-4 dark:border-primary/10 dark:bg-background-dark">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                            Seçili Ürün
                        </p>
                        <p className="text-lg font-bold text-primary-dark dark:text-primary">
                            {productTitle}
                        </p>
                    </div>
                    <p className="text-sm leading-relaxed text-text-muted">
                        Bu işlem geri alınamaz ve ürün tüm listelerden kalıcı olarak kaldırılacaktır.
                    </p>
                </div>

                <div className="flex flex-col gap-3 bg-background-light px-8 py-6 dark:bg-background-dark/70">
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        startIcon={<DeleteForeverRoundedIcon />}
                        className="!w-full !rounded-xl !bg-accent !px-4 !py-3 !font-bold !normal-case !text-white hover:!bg-accent/90 disabled:!bg-accent/60"
                    >
                        {loading ? 'Siliniyor...' : 'Evet, Ürünü Sil'}
                    </Button>

                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="!w-full !rounded-xl !border !border-primary/10 !bg-surface-light !px-4 !py-3 !font-semibold !normal-case !text-text-muted hover:!bg-white dark:!border-primary/10 dark:!bg-surface-dark dark:!text-white dark:hover:!bg-surface-dark/90"
                    >
                        Vazgeç
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
