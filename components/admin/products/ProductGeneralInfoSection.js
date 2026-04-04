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
                eyebrow="Kimlik"
                title="Ürünün omurgasını kurun"
                description="Başlık, SKU, marka ve kısa ürün anlatımı bu sayfanın ana karar alanı. Sağ paneldeki kalite skoru bu bloktan beslenir."
                icon={<Inventory2RoundedIcon />}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Ürün adı" error={errors.title}>
                    <Input
                        value={values.title}
                        onChange={onTitleChange}
                        disabled={disabled}
                        placeholder="Örn. Oversize Sherpa Hoodie"
                    />
                </Field>

                <Field label="Marka" error={errors.brand}>
                    <Input
                        value={values.brand}
                        onChange={onBrandChange}
                        disabled={disabled}
                        placeholder="Örn. North Loom"
                    />
                </Field>

                <Field label="SKU" hint="ASCII ve tekil" error={errors.sku}>
                    <Input
                        value={values.sku}
                        onChange={onSkuChange}
                        disabled={disabled}
                        placeholder="Örn. HOODIE-CORE-01"
                    />
                </Field>

                <Field label="Fiyat" hint="TL" error={errors.price}>
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
                    label="Kısa açıklama"
                    hint={`${values.description.trim().length} karakter`}
                    error={errors.description}
                >
                    <Textarea
                        rows={4}
                        value={values.description}
                        onChange={onDescriptionChange}
                        disabled={disabled}
                        placeholder="Ürünün vitrinde ilk bakışta satacağı net faydayı kısa ve tok bir dille yazın."
                    />
                </Field>
            </div>
        </SurfaceCard>
    );
}
