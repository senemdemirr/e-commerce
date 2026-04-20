import { Field } from './ProductFormPrimitives';

export default function ProductImageField({
    imageFile,
    error,
    disabled = false,
    onImageChange,
}) {
    return (
        <Field label="Cover image" hint="Max 3MB" error={error}>
            <label className={`flex h-12 items-center justify-between rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-text-main transition ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-primary hover:bg-primary/10'}`}>
                <span className="truncate">
                    {imageFile?.name || 'Select a PNG or JPG file'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Choose
                </span>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={disabled}
                    onChange={(event) => onImageChange(event.target.files?.[0] || null)}
                />
            </label>
        </Field>
    );
}
