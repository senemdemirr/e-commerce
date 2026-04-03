import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import { Button, Chip } from '@mui/material';
import {
    Field,
    Input,
    SectionIntro,
    SurfaceCard,
    Textarea,
} from './ProductFormPrimitives';

export default function ProductVariationsSection({
    colors,
    sizesValue,
    normalizedSizes,
    onAddColor,
    onColorChange,
    onRemoveColor,
    onSizesChange,
}) {
    return (
        <SurfaceCard className="p-6 sm:p-8">
            <SectionIntro
                eyebrow="Varyasyon"
                title="Renkleri ve bedenleri tanımlayın"
                description="Bu bölüm katalog kartının ritmini belirler. Renkleri ayrı satırlarda, bedenleri tek satırda virgülle ayırarak girin."
                icon={<ViewInArRoundedIcon />}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-black text-text-main">Renk paleti</p>
                        <Button
                            type="button"
                            onClick={onAddColor}
                            className="!rounded-2xl !bg-primary/10 !px-4 !py-2 !text-xs !font-bold !normal-case !text-primary-dark hover:!bg-primary/20"
                        >
                            Renk Satırı Ekle
                        </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {colors.map((color, index) => (
                            <div
                                key={`color-${index}`}
                                className="grid gap-3 rounded-[24px] border border-primary/10 bg-background-light p-4 md:grid-cols-[minmax(0,1fr)_120px_auto]"
                            >
                                <Input
                                    value={color.name}
                                    onChange={(event) => onColorChange(index, 'name', event.target.value)}
                                    placeholder="Örn. Kum Beji"
                                />
                                <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-3">
                                    <input
                                        type="color"
                                        value={color.hex}
                                        onChange={(event) => onColorChange(index, 'hex', event.target.value)}
                                        className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
                                    />
                                    <span className="text-sm font-bold text-text-main">{color.hex.toUpperCase()}</span>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => onRemoveColor(index)}
                                    className="!rounded-2xl !border !border-primary/10 !px-4 !py-2 !text-xs !font-bold !normal-case !text-text-muted hover:!bg-white"
                                >
                                    Kaldır
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Field label="Beden seti" hint="Virgülle ayırın">
                        <Textarea
                            rows={5}
                            value={sizesValue}
                            onChange={onSizesChange}
                            placeholder="XS, S, M, L, XL"
                        />
                    </Field>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {normalizedSizes.length > 0 ? normalizedSizes.map((size) => (
                            <Chip
                                key={size}
                                label={size}
                                className="!rounded-full !bg-secondary/20 !font-semibold !text-text-main"
                            />
                        )) : (
                            <p className="text-sm font-medium text-text-muted">
                                Henüz beden etiketi eklenmedi.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </SurfaceCard>
    );
}
