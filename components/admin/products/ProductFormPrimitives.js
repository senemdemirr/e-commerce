import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

export function SurfaceCard({ children, className = '' }) {
    return (
        <section className={`rounded-[32px] border border-primary/10 bg-white shadow-sm ${className}`}>
            {children}
        </section>
    );
}

export function SectionIntro({ eyebrow, title, description, icon }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">
                    {eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-text-main">
                    {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-text-muted">
                    {description}
                </p>
            </div>
        </div>
    );
}

export function Field({ label, hint, error, children }) {
    return (
        <label className="block space-y-2">
            <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-text-main">{label}</span>
                {hint ? (
                    <span className="text-xs font-medium text-text-muted">{hint}</span>
                ) : null}
            </div>
            {children}
            {error ? (
                <p className="text-xs font-semibold text-red-500">{error}</p>
            ) : null}
        </label>
    );
}

export function Input({ className = '', ...props }) {
    return (
        <input
            {...props}
            className={`h-12 w-full rounded-2xl border border-primary/10 bg-background-light px-4 text-sm font-medium text-text-main outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 ${className}`}
        />
    );
}

export function Textarea({ className = '', ...props }) {
    return (
        <textarea
            {...props}
            className={`w-full rounded-2xl border border-primary/10 bg-background-light px-4 py-3 text-sm font-medium text-text-main outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 ${className}`}
        />
    );
}

export function Select({ className = '', children, ...props }) {
    return (
        <div className="relative">
            <select
                {...props}
                className={`h-12 w-full appearance-none rounded-2xl border border-primary/10 bg-background-light px-4 pr-11 text-sm font-medium text-text-main outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            >
                {children}
            </select>
            <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
    );
}
