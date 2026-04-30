'use client';

import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AppDialog from '@/components/common/AppDialog';

function joinClassNames(...classNames) {
    return classNames.filter(Boolean).join(' ');
}

export default function ConfirmDialog({
    open,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loadingText,
    loading = false,
    confirmDisabled = false,
    icon = <WarningAmberRoundedIcon />,
    confirmIcon,
    children,
    maxWidth = 'xs',
    onClose,
    onConfirm,
    cancelButtonProps = {},
    confirmButtonProps = {},
}) {
    const {
        className: cancelButtonClassName,
        disabled: cancelButtonDisabled,
        ...restCancelButtonProps
    } = cancelButtonProps;
    const {
        className: confirmButtonClassName,
        disabled: confirmButtonDisabled,
        startIcon: confirmButtonStartIcon,
        ...restConfirmButtonProps
    } = confirmButtonProps;
    const resolvedLoadingText = loadingText
        || (String(confirmText).toLowerCase().includes('delete') ? 'Deleting...' : 'Processing...');

    return (
        <AppDialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth={maxWidth}
        >
            <DialogTitle className="!px-6 !pb-2 !pt-6">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        {icon}
                    </div>
                    <h2 className="font-display text-xl font-bold text-text-main dark:text-white">
                        {title}
                    </h2>
                </div>
            </DialogTitle>

            <DialogContent className="!px-6 !pb-3 !pt-2">
                {typeof description === 'string' ? (
                    <p className="text-sm leading-6 text-text-muted">{description}</p>
                ) : (
                    description
                )}
                {children ? <div className="mt-4">{children}</div> : null}
            </DialogContent>

            <DialogActions className="!gap-2 !px-6 !pb-6 !pt-2">
                <Button
                    type="button"
                    onClick={onClose}
                    disabled={loading || cancelButtonDisabled}
                    className={joinClassNames(
                        '!rounded-2xl !px-4 !py-2 !font-semibold !normal-case !text-text-muted dark:!text-gray-300',
                        cancelButtonClassName,
                    )}
                    {...restCancelButtonProps}
                >
                    {cancelText}
                </Button>
                <Button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading || confirmDisabled || confirmButtonDisabled}
                    variant="contained"
                    startIcon={confirmIcon || confirmButtonStartIcon}
                    className={joinClassNames(
                        '!rounded-2xl !bg-red-500 !px-5 !py-2.5 !font-bold !normal-case !text-white hover:!bg-red-600 disabled:!opacity-60',
                        confirmButtonClassName,
                    )}
                    {...restConfirmButtonProps}
                >
                    {loading ? resolvedLoadingText : confirmText}
                </Button>
            </DialogActions>
        </AppDialog>
    );
}
