import { Paper } from '@mui/material';

export default function ProductsSummaryCard({
    title,
    value,
    caption,
    detail,
    icon: Icon,
    iconClassName,
}) {
    return (
        <Paper className="!relative !overflow-hidden !rounded-[28px] !border !border-primary/10 !bg-white !p-6 !shadow-sm">
            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-text-muted">{title}</p>
                    <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-text-main">{value}</h2>
                    <p className="mt-3 inline-flex rounded-full bg-background-light px-3 py-1 text-xs font-semibold text-text-muted">
                        {caption}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-text-muted">{detail}</p>
                </div>

                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}>
                    <Icon />
                </div>
            </div>
        </Paper>
    );
}
