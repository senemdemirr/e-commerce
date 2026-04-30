'use client';

import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function ProductDeleteDialog({
    open,
    productTitle = 'Product',
    loading = false,
    onClose,
    onConfirm,
}) {
    return (
        <ConfirmDialog
            open={open}
            title="Are you sure you want to delete this product?"
            description={(
                <div className="space-y-4">
                    <div className="rounded-lg border border-primary/10 bg-background-light p-4 text-center dark:border-primary/10 dark:bg-background-dark">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                            Selected Product
                        </p>
                        <p className="text-lg font-bold text-primary-dark dark:text-primary">
                            {productTitle}
                        </p>
                    </div>
                    <p className="text-sm leading-relaxed text-text-muted">
                        This action cannot be undone, and the product will be permanently removed from all lists.
                    </p>
                </div>
            )}
            confirmText="Yes, Delete Product"
            cancelText="Cancel"
            loadingText="Deleting..."
            loading={loading}
            icon={<WarningAmberRoundedIcon />}
            confirmIcon={<DeleteForeverRoundedIcon />}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
