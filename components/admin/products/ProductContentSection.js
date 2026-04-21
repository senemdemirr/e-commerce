import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import {
    Field,
    Input,
    SectionIntro,
    SurfaceCard,
    Textarea,
} from './ProductFormPrimitives';

export default function ProductContentSection({
    materialValue,
    careItems,
    bulletPointItems,
    normalizedCare,
    normalizedBulletPoints,
    descriptionLongValue,
    disabled = false,
    onMaterialChange,
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
                description="Long-form copy, material info, care notes, and sales-driven bullet points make the product more convincing."
                icon={<AutoAwesomeRoundedIcon />}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Material">
                    <Input
                        value={materialValue}
                        onChange={onMaterialChange}
                        disabled={disabled}
                        placeholder="80% cotton, 20% polyester"
                    />
                </Field>

                {imageField}

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold text-text-main">Care notes</p>
                        <button
                            type="button"
                            onClick={onAddCareItem}
                            disabled={disabled}
                            className="rounded-2xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary-dark transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            Add Care Row
                        </button>
                    </div>

                    <div className="space-y-3">
                        {careItems.map((item, index) => (
                            <div
                                key={`care-${index}`}
                                className="grid gap-3 rounded-[24px] border border-primary/10 bg-background-light p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                            >
                                <Input
                                    value={item}
                                    onChange={(event) => onCareItemChange(index, event.target.value)}
                                    disabled={disabled}
                                    placeholder="e.g. Wash at 30°C"
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveCareItem(index)}
                                    disabled={disabled}
                                    className="rounded-2xl border border-primary/10 bg-white px-4 py-2 text-xs font-bold text-text-muted transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs font-medium text-text-muted">
                        {normalizedCare.length > 0
                            ? `${normalizedCare.length} care rows ready for details table`
                            : 'No care rows added yet.'}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold text-text-main">Key bullets</p>
                        <button
                            type="button"
                            onClick={onAddBulletPoint}
                            disabled={disabled}
                            className="rounded-2xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary-dark transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            Add Bullet Row
                        </button>
                    </div>

                    <div className="space-y-3">
                        {bulletPointItems.map((item, index) => (
                            <div
                                key={`bullet-${index}`}
                                className="grid gap-3 rounded-[24px] border border-primary/10 bg-background-light p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                            >
                                <Input
                                    value={item}
                                    onChange={(event) => onBulletPointChange(index, event.target.value)}
                                    disabled={disabled}
                                    placeholder="e.g. Soft-touch texture"
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveBulletPoint(index)}
                                    disabled={disabled}
                                    className="rounded-2xl border border-primary/10 bg-white px-4 py-2 text-xs font-bold text-text-muted transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs font-medium text-text-muted">
                        {normalizedBulletPoints.length > 0
                            ? `${normalizedBulletPoints.length} bullet rows ready for details table`
                            : 'No bullet rows added yet.'}
                    </p>
                </div>
            </div>

            <div className="mt-5">
                <Field label="Long description" hint="PDP story">
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
