import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Button, Chip } from '@mui/material';
import {
    Field,
    Input,
    SectionIntro,
    Select,
    SurfaceCard,
} from './ProductFormPrimitives';

function normalizeLookupKey(value = '') {
    return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function buildAvailableColorOptions(options, rows, currentValue) {
    const currentKey = normalizeLookupKey(currentValue);
    const selectedKeys = new Set(
        rows
            .map((row) => normalizeLookupKey(row?.name))
            .filter(Boolean)
            .filter((key) => key !== currentKey)
    );

    return options.filter((option) => !selectedKeys.has(normalizeLookupKey(option?.name)));
}

function buildAvailableStringOptions(options, rows, currentValue) {
    const currentKey = normalizeLookupKey(currentValue);
    const selectedKeys = new Set(
        rows
            .map((row) => normalizeLookupKey(row))
            .filter(Boolean)
            .filter((key) => key !== currentKey)
    );

    return options.filter((option) => !selectedKeys.has(normalizeLookupKey(option)));
}

export default function ProductVariationsSection({
    colors,
    colorLookupOptions = [],
    normalizedColors,
    sizes,
    sizeLookupOptions = [],
    normalizedSizes,
    variants,
    normalizedVariants,
    disabled = false,
    onAddColor,
    onColorChange,
    onOpenCreateColor,
    onRemoveColor,
    onAddSize,
    onSizeChange,
    onRemoveSize,
    onAddVariant,
    onVariantChange,
    onRemoveVariant,
    onGenerateVariants,
    onSetDefaultVariant,
}) {
    const canAddColorRow = !disabled && colorLookupOptions.length > 0 && colors.length < colorLookupOptions.length;
    const canAddSizeRow = !disabled && sizeLookupOptions.length > 0 && sizes.length < sizeLookupOptions.length;
    const canQuickCreateColor = typeof onOpenCreateColor === 'function';

    return (
        <SurfaceCard className="p-6 sm:p-8">
            <SectionIntro
                eyebrow="Variations"
                title="Define colors, sizes, and variants"
                description="Keep option sets clean first, then map the sellable combinations below as concrete variants with their own SKU, price, and stock."
                icon={<ViewInArRoundedIcon />}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-sm font-black text-text-main">Color palette</p>
                        <Button
                            type="button"
                            onClick={onAddColor}
                            disabled={!canAddColorRow}
                            className="!rounded-2xl !bg-primary/10 !px-4 !py-2 !text-xs !font-bold !normal-case !text-primary-dark hover:!bg-primary/20"
                        >
                            Add Color Row
                        </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {colors.map((color, index) => (
                            <div
                                key={`color-${index}`}
                                className="grid items-end gap-3 rounded-[24px] border border-primary/10 bg-background-light p-4 lg:grid-cols-[minmax(0,1fr)_minmax(120px,140px)_auto]"
                            >
                                <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                                    <div className="min-w-0">
                                        <Field label="Saved color">
                                            <Select
                                                value={color.name}
                                                onChange={(event) => onColorChange(index, 'name', event.target.value)}
                                                disabled={disabled || colorLookupOptions.length === 0}
                                            >
                                                <option value="">
                                                    {colorLookupOptions.length > 0 ? 'Select color' : 'No saved color'}
                                                </option>
                                                {buildAvailableColorOptions(colorLookupOptions, colors, color.name).map((option) => (
                                                    <option key={`${option.name}-${option.hex}`} value={option.name}>
                                                        {option.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    </div>

                                    {canQuickCreateColor ? (
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                onClick={() => onOpenCreateColor(index)}
                                                disabled={disabled}
                                                title="Create color"
                                                aria-label="Create color"
                                                className="!size-12 !min-w-0 !rounded-2xl !border !border-primary/10 !bg-white !p-0 !text-primary-dark hover:!bg-primary/5"
                                            >
                                                <AddRoundedIcon className="!text-lg" />
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex min-w-0 items-end">
                                    <div className="flex h-12 w-full min-w-0 items-center gap-3 rounded-2xl border border-primary/10 bg-white px-3">
                                        <span
                                            className="h-7 w-7 rounded-full border border-primary/10"
                                            style={{ backgroundColor: color.hex || '#111827' }}
                                        />
                                        <span className="truncate text-sm font-bold text-text-main">
                                            {(color.hex || '#111827').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-end lg:justify-end">
                                    <Button
                                        type="button"
                                        onClick={() => onRemoveColor(index)}
                                        disabled={disabled}
                                        title="Delete color row"
                                        aria-label="Delete color row"
                                        className="!size-12 !min-w-0 !rounded-2xl !border !border-red-100 !bg-white !p-0 !text-red-500 hover:!bg-red-50"
                                    >
                                        <DeleteRoundedIcon className="!text-lg" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-3 text-xs font-medium text-text-muted">
                        {colorLookupOptions.length > 0
                            ? `${colorLookupOptions.length} unique color values are available in the dropdown.`
                            : 'No saved color lookup exists yet.'}
                    </p>
                </div>

                <div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-sm font-black text-text-main">Size set</p>
                        <Button
                            type="button"
                            onClick={onAddSize}
                            disabled={!canAddSizeRow}
                            className="!rounded-2xl !bg-secondary/20 !px-4 !py-2 !text-xs !font-bold !normal-case !text-text-main hover:!bg-secondary/30"
                        >
                            Add Size Row
                        </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {sizes.map((size, index) => (
                            <div
                                key={`size-${index}`}
                                className="grid items-end gap-3 rounded-[24px] border border-primary/10 bg-background-light p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                            >
                                <div className="min-w-0">
                                    <Field label="Saved size">
                                        <Select
                                            value={size}
                                            onChange={(event) => onSizeChange(index, event.target.value)}
                                            disabled={disabled || sizeLookupOptions.length === 0}
                                        >
                                            <option value="">
                                                {sizeLookupOptions.length > 0 ? 'Select size' : 'No saved size'}
                                            </option>
                                            {buildAvailableStringOptions(sizeLookupOptions, sizes, size).map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                </div>
                                <div className="flex items-end sm:justify-end">
                                    <Button
                                        type="button"
                                        onClick={() => onRemoveSize(index)}
                                        disabled={disabled}
                                        title="Delete size row"
                                        aria-label="Delete size row"
                                        className="!size-12 !min-w-0 !rounded-2xl !border !border-red-100 !bg-white !p-0 !text-red-500 hover:!bg-red-50"
                                    >
                                        <DeleteRoundedIcon className="!text-lg" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {normalizedSizes.length > 0 ? normalizedSizes.map((size) => (
                            <Chip
                                key={size}
                                label={size}
                                className="!rounded-full !bg-secondary/20 !font-semibold !text-text-main"
                            />
                        )) : (
                            <p className="text-sm font-medium text-text-muted">
                                No size labels added yet.
                            </p>
                        )}
                    </div>

                    <p className="mt-3 text-xs font-medium text-text-muted">
                        {sizeLookupOptions.length > 0
                            ? `${sizeLookupOptions.length} unique size values are available in the dropdown.`
                            : 'No saved size lookup exists yet.'}
                    </p>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-black text-text-main">Variant matrix</p>
                        <p className="mt-1 text-sm text-text-muted">
                            Create sellable combinations from the option sets above.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            onClick={onGenerateVariants}
                            disabled={disabled}
                            className="!rounded-2xl !border !border-primary/15 !bg-white !px-4 !py-2 !text-xs !font-bold !normal-case !text-text-main hover:!bg-background-light"
                        >
                            Generate From Options
                        </Button>
                        <Button
                            type="button"
                            onClick={onAddVariant}
                            disabled={disabled}
                            className="!rounded-2xl !bg-primary !px-4 !py-2 !text-xs !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white"
                        >
                            Add Variant Row
                        </Button>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    {variants.map((variant, index) => (
                        <div
                            key={`variant-${index}`}
                            className="grid gap-3 rounded-[24px] border border-primary/10 bg-background-light p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,1.2fr)_120px_110px_auto_auto]"
                        >
                            <div className="min-w-0">
                                <Field label="Color">
                                    <Select
                                        value={variant.colorName}
                                        onChange={(event) => onVariantChange(index, 'colorName', event.target.value)}
                                        disabled={disabled}
                                    >
                                        <option value="">{normalizedColors.length > 0 ? 'Select color' : 'No color option'}</option>
                                        {normalizedColors.map((color) => (
                                            <option key={color.name} value={color.name}>
                                                {color.name}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            <div className="min-w-0">
                                <Field label="Size">
                                    <Select
                                        value={variant.sizeLabel}
                                        onChange={(event) => onVariantChange(index, 'sizeLabel', event.target.value)}
                                        disabled={disabled}
                                    >
                                        <option value="">{normalizedSizes.length > 0 ? 'Select size' : 'Single size'}</option>
                                        {normalizedSizes.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            <div className="min-w-0">
                                <Field label="Variant SKU">
                                    <Input
                                        value={variant.sku}
                                        onChange={(event) => onVariantChange(index, 'sku', event.target.value)}
                                        disabled={disabled}
                                        placeholder="e.g. HOODIE-BEIGE-M"
                                    />
                                </Field>
                            </div>

                            <div className="min-w-0">
                                <Field label="Price">
                                    <Input
                                        value={variant.price}
                                        onChange={(event) => onVariantChange(index, 'price', event.target.value)}
                                        disabled={disabled}
                                        inputMode="decimal"
                                        placeholder="1299.90"
                                    />
                                </Field>
                            </div>

                            <div className="min-w-0">
                                <Field label="Stock">
                                    <Input
                                        value={variant.stock}
                                        onChange={(event) => onVariantChange(index, 'stock', event.target.value)}
                                        disabled={disabled}
                                        inputMode="numeric"
                                        placeholder="0"
                                    />
                                </Field>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    onClick={() => onSetDefaultVariant(index)}
                                    disabled={disabled}
                                    className={variant.isDefault
                                        ? '!h-12 !rounded-2xl !bg-secondary/25 !px-4 !text-xs !font-black !normal-case !text-text-main'
                                        : '!h-12 !rounded-2xl !border !border-primary/10 !bg-white !px-4 !text-xs !font-bold !normal-case !text-text-muted hover:!bg-background-light'}
                                >
                                    {variant.isDefault ? 'Default' : 'Set Default'}
                                </Button>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    onClick={() => onRemoveVariant(index)}
                                    disabled={disabled}
                                    title="Delete variant row"
                                    aria-label="Delete variant row"
                                    className="!size-12 !min-w-0 !rounded-2xl !border !border-red-100 !bg-white !p-0 !text-red-500 hover:!bg-red-50"
                                >
                                    <DeleteRoundedIcon className="!text-lg" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {normalizedVariants.length > 0 ? normalizedVariants.map((variant) => (
                        <Chip
                            key={variant.sku}
                            label={`${variant.sku} • ${variant.stock} pcs`}
                            className="!rounded-full !bg-white !font-semibold !text-text-main"
                        />
                    )) : (
                        <p className="text-sm font-medium text-text-muted">
                            No sellable variants configured yet.
                        </p>
                    )}
                </div>
            </div>
        </SurfaceCard>
    );
}
