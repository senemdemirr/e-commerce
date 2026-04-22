import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import {
    Field,
    Input,
    SectionIntro,
    SurfaceCard,
    Textarea,
} from './ProductFormPrimitives';

function DetailRows({
    label,
    addLabel,
    placeholder,
    items,
    disabled,
    onAdd,
    onChange,
    onRemove,
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-text-main">{label}</p>
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={disabled}
                    className="rounded-2xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary-dark transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {addLabel}
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={`${label}-${index}`}
                        className="grid gap-3 rounded-[24px] border border-primary/10 bg-background-light p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                    >
                        <Field label={`${label} ${index + 1}`}>
                            <Input
                                value={item}
                                onChange={(event) => onChange(index, event.target.value)}
                                disabled={disabled}
                                placeholder={placeholder}
                            />
                        </Field>
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            disabled={disabled}
                            className="rounded-2xl border border-primary/10 bg-white px-4 py-2 text-xs font-bold text-text-muted transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProductContentSection({
    materialItems,
    careItems,
    bulletPointItems,
    normalizedMaterials,
    normalizedCare,
    normalizedBulletPoints,
    descriptionLongValue,
    disabled = false,
    onAddMaterialItem,
    onMaterialItemChange,
    onRemoveMaterialItem,
    onAddCareItem,
    onCareItemChange,
    onRemoveCareItem,
    onAddBulletPoint,
    onBulletPointChange,
    onRemoveBulletPoint,
    onDescriptionLongChange,
    imageField,
}) {
    return (
        <SurfaceCard className="p-6 sm:p-8">
            <SectionIntro
                eyebrow="Content"
                title="Enrich the detail layer"
                description="Keep product details inside the product itself with ordered rows for material, care, bullets, and long-form copy."
                icon={<AutoAwesomeRoundedIcon />}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <DetailRows
                    label="Material"
                    addLabel="Add Material Row"
                    placeholder="Example: 100% Organic Cotton"
                    items={materialItems}
                    disabled={disabled}
                    onAdd={onAddMaterialItem}
                    onChange={onMaterialItemChange}
                    onRemove={onRemoveMaterialItem}
                />

                {imageField}

                <DetailRows
                    label="Care Notes"
                    addLabel="Add Care Row"
                    placeholder="Example: Machine wash cold"
                    items={careItems}
                    disabled={disabled}
                    onAdd={onAddCareItem}
                    onChange={onCareItemChange}
                    onRemove={onRemoveCareItem}
                />

                <DetailRows
                    label="Key Bullets"
                    addLabel="Add Bullet Row"
                    placeholder="Example: Classic fit"
                    items={bulletPointItems}
                    disabled={disabled}
                    onAdd={onAddBulletPoint}
                    onChange={onBulletPointChange}
                    onRemove={onRemoveBulletPoint}
                />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
                <p className="text-xs font-medium text-text-muted">
                    {normalizedMaterials.length > 0
                        ? `${normalizedMaterials.length} material row${normalizedMaterials.length === 1 ? '' : 's'} ready.`
                        : 'Empty material rows are ignored on save.'}
                </p>
                <p className="text-xs font-medium text-text-muted">
                    {normalizedCare.length > 0
                        ? `${normalizedCare.length} care row${normalizedCare.length === 1 ? '' : 's'} ready.`
                        : 'Care rows keep the order you enter.'}
                </p>
                <p className="text-xs font-medium text-text-muted">
                    {normalizedBulletPoints.length > 0
                        ? `${normalizedBulletPoints.length} bullet row${normalizedBulletPoints.length === 1 ? '' : 's'} ready.`
                        : 'Bullet rows stay product-specific.'}
                </p>
            </div>

            <div className="mt-5">
                <Field label="Long Description" hint="Saved as the last detail section">
                    <Textarea
                        rows={6}
                        value={descriptionLongValue}
                        onChange={onDescriptionLongChange}
                        disabled={disabled}
                        placeholder="Expand on the fabric feel, use case, and styling advantage in a more editorial tone."
                    />
                </Field>
            </div>
        </SurfaceCard>
    );
}
