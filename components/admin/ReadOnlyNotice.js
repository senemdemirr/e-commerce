'use client';

export default function ReadOnlyNotice({
    title = 'Read-Only Access',
    description = 'This account can view admin data but cannot create, update, or delete records. Use a superadmin account for changes.',
    className = '',
}) {
    return (
        <div className={`rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 ${className}`}>
            <p className="font-black uppercase tracking-[0.18em] text-amber-700">
                {title}
            </p>
            <p className="mt-2 font-medium leading-6">
                {description}
            </p>
        </div>
    );
}
