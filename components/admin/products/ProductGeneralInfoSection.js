import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import {
    Field,
    Input,
    SectionIntro,
    SurfaceCard,
    Textarea,
} from './ProductFormPrimitives';

export default function ProductGeneralInfoSection({
    values,
    errors,
    disabled = false,
    onTitleChange,
    onBrandChange,
    onSkuChange,
    onPriceChange,
    onDescriptionChange,
}) {
    return (
        <SurfaceCard className="p-6 sm:p-8">
            <SectionIntro
                eyebrow="Core"
                title="Build the product foundation"
                description="Title, SKU, brand, and the short pitch are the key decision fields on this page. The quality score in the right panel is driven by this block."
                icon={<Inventory2RoundedIcon />}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Product name" error={errors.title}>
                    <Input
                        value={values.title}
                        onChange={onTitleChange}
                        disabled={disabled}
                        placeholder="e.g. Oversize Sherpa Hoodie"
                    />
                </Field>

                <Field label="Brand" error={errors.brand}>
                    <Input
                        value={values.brand}
                        onChange={onBrandChange}
                        disabled={disabled}
                        placeholder="e.g. North Loom"
                    />
                </Field>

                <Field label="SKU" hint="ASCII and unique" error={errors.sku}>
                    <Input
                        value={values.sku}
                        onChange={onSkuChange}
                        disabled={disabled}
                        placeholder="e.g. HOODIE-CORE-01"
                    />
                </Field>

                <Field label="Price" hint="TRY" error={errors.price}>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={values.price}
                        onChange={onPriceChange}
                        disabled={disabled}
                        placeholder="1499.90"
                    />
                </Field>
            </div>

            <div className="mt-5">
                <Field
                    label="Short description"
                    hint={`${values.description.trim().length} characters`}
                    error={errors.description}
                >
                    <Textarea
                        rows={4}
                        value={values.description}
                        onChange={onDescriptionChange}
                        disabled={disabled}
                        placeholder="Write the clearest storefront benefit in a short, confident tone."
                    />
                </Field>
            </div>
        </SurfaceCard>
    );
}
