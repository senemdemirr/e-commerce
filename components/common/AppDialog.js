'use client';

import { Dialog } from '@mui/material';

function joinClassNames(...classNames) {
    return classNames.filter(Boolean).join(' ');
}

const DEFAULT_BACKDROP_CLASS = '!bg-text-main/55 !backdrop-blur-sm';
const DEFAULT_PAPER_CLASS = '!m-4 !overflow-hidden !rounded-[28px] !border !border-border-soft !bg-white !shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:!border-primary/15 dark:!bg-surface-dark';

export default function AppDialog({
    BackdropProps = {},
    PaperProps = {},
    backdropClassName,
    paperClassName,
    useDefaultBackdrop,
    useDefaultPaper,
    children,
    ...dialogProps
}) {
    const { className: backdropPropsClassName, ...backdropProps } = BackdropProps || {};
    const { className: paperPropsClassName, ...paperProps } = PaperProps || {};
    const shouldUseDefaultBackdrop = useDefaultBackdrop ?? !backdropPropsClassName;
    const shouldUseDefaultPaper = useDefaultPaper ?? !paperPropsClassName;

    return (
        <Dialog
            {...dialogProps}
            BackdropProps={{
                ...backdropProps,
                className: joinClassNames(
                    shouldUseDefaultBackdrop ? DEFAULT_BACKDROP_CLASS : '',
                    backdropPropsClassName,
                    backdropClassName,
                ),
            }}
            PaperProps={{
                ...paperProps,
                className: joinClassNames(
                    shouldUseDefaultPaper ? DEFAULT_PAPER_CLASS : '',
                    paperPropsClassName,
                    paperClassName,
                ),
            }}
        >
            {children}
        </Dialog>
    );
}
