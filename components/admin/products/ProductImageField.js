import { Field } from './ProductFormPrimitives';

export default function ProductImageField({
    imageFile,
    error,
    onImageChange,
}) {
    return (
        <Field label="Kapak görseli" hint="Maks. 3MB" error={error}>
            <label className="flex h-12 cursor-pointer items-center justify-between rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-text-main transition hover:border-primary hover:bg-primary/10">
                <span className="truncate">
                    {imageFile?.name || 'PNG veya JPG dosyası seçin'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Seç
                </span>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => onImageChange(event.target.files?.[0] || null)}
                />
            </label>
        </Field>
    );
}
