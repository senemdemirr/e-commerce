'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Chip, CircularProgress } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import { useSnackbar } from 'notistack';
import {
    formatCurrency,
    getCatalogScore,
    getReadinessMeta,
} from '@/components/admin/products/productsPageHelpers';

const INITIAL_FORM = {
    title: '',
    brand: '',
    sku: '',
    price: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    sizes: '',
    material: '',
    care: '',
    bulletPoints: '',
    descriptionLong: '',
};

function createEmptyColor() {
    return {
        name: '',
        hex: '#111827',
    };
}

function createSku(value = '') {
    const letterMap = {
        c: /[çÇ]/g,
        g: /[ğĞ]/g,
        i: /[ıİ]/g,
        o: /[öÖ]/g,
        s: /[şŞ]/g,
        u: /[üÜ]/g,
    };

    let normalized = String(value).trim();

    Object.entries(letterMap).forEach(([replacement, pattern]) => {
        normalized = normalized.replace(pattern, replacement);
    });

    return normalized
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .toUpperCase();
}

function parseCommaList(value = '') {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseLineList(value = '') {
    return value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
}

function SurfaceCard({ children, className = '' }) {
    return (
        <section className={`rounded-[32px] border border-primary/10 bg-white shadow-sm ${className}`}>
            {children}
        </section>
    );
}

function SectionIntro({ eyebrow, title, description, icon }) {
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

function Field({ label, hint, error, children }) {
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

function Input({ className = '', ...props }) {
    return (
        <input
            {...props}
            className={`h-12 w-full rounded-2xl border border-primary/10 bg-background-light px-4 text-sm font-medium text-text-main outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 ${className}`}
        />
    );
}

function Textarea({ className = '', ...props }) {
    return (
        <textarea
            {...props}
            className={`w-full rounded-2xl border border-primary/10 bg-background-light px-4 py-3 text-sm font-medium text-text-main outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 ${className}`}
        />
    );
}

function Select({ className = '', children, ...props }) {
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

export default function NewProductPage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [skuTouched, setSkuTouched] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [colors, setColors] = useState([createEmptyColor()]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let active = true;

        async function loadCategories() {
            try {
                setLoading(true);
                setLoadError('');

                const [categoriesResponse, subcategoriesResponse] = await Promise.all([
                    fetch('/api/admin/categories', {
                        headers: { role: 'admin' },
                    }),
                    fetch('/api/admin/subcategories', {
                        headers: { role: 'admin' },
                    }),
                ]);
                const [categoriesData, subcategoriesData] = await Promise.all([
                    categoriesResponse.json().catch(() => []),
                    subcategoriesResponse.json().catch(() => []),
                ]);

                if (!categoriesResponse.ok) {
                    throw new Error(categoriesData?.error || 'Kategoriler yüklenemedi.');
                }

                if (!subcategoriesResponse.ok) {
                    throw new Error(subcategoriesData?.error || 'Alt kategoriler yüklenemedi.');
                }

                if (!active) {
                    return;
                }

                const activeSubcategories = Array.isArray(subcategoriesData)
                    ? subcategoriesData.filter((subcategory) => Number(subcategory?.activate ?? 0) === 1)
                    : [];
                const nextCategories = Array.isArray(categoriesData)
                    ? categoriesData
                        .filter((category) => Number(category?.activate ?? 0) === 1)
                        .map((category) => ({
                            id: Number(category?.id),
                            name: category?.name || 'İsimsiz Kategori',
                            slug: category?.slug || '',
                            subcategories: activeSubcategories
                                .filter((subcategory) => Number(subcategory?.category_id) === Number(category?.id))
                                .map((subcategory) => ({
                                    id: Number(subcategory?.id),
                                    name: subcategory?.name || 'İsimsiz Alt Kategori',
                                    slug: subcategory?.slug || '',
                                })),
                        }))
                        .filter((category) => category.subcategories.length > 0)
                    : [];

                setCategories(nextCategories);

                const firstCategory = nextCategories[0];
                const firstSubcategory = firstCategory?.subcategories?.[0];

                if (nextCategories.length === 0) {
                    setLoadError('Ürün eklemek için önce aktif kategori ve aktif alt kategori oluşturun.');
                }

                setForm((current) => ({
                    ...current,
                    categoryId: current.categoryId || (firstCategory ? String(firstCategory.id) : ''),
                    subcategoryId: current.subcategoryId || (firstSubcategory ? String(firstSubcategory.id) : ''),
                }));
            } catch (error) {
                if (!active) {
                    return;
                }

                const message = error.message || 'Kategoriler yüklenemedi.';
                setLoadError(message);
                enqueueSnackbar(message, { variant: 'error' });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCategories();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (!imageFile) {
            setImagePreview('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [imageFile]);

    const selectedCategory = categories.find((category) => String(category.id) === form.categoryId) || null;
    const availableSubcategories = Array.isArray(selectedCategory?.subcategories)
        ? selectedCategory.subcategories
        : [];
    const selectedSubcategory = availableSubcategories.find(
        (subcategory) => String(subcategory.id) === form.subcategoryId
    ) || null;

    const normalizedColors = colors
        .map((color) => ({
            name: color.name.trim(),
            hex: color.hex,
        }))
        .filter((color) => color.name);
    const normalizedSizes = parseCommaList(form.sizes);
    const normalizedCare = parseLineList(form.care);
    const normalizedBulletPoints = parseLineList(form.bulletPoints);
    const details = {
        material: form.material.trim(),
        care: normalizedCare,
        bullet_points: normalizedBulletPoints,
        description_long: form.descriptionLong.trim(),
    };

    const score = getCatalogScore({
        image: imagePreview,
        brand: form.brand.trim(),
        description: form.description,
        colors: normalizedColors,
        sizes: normalizedSizes,
        details,
    });
    const readiness = getReadinessMeta(score);

    const checklist = [
        { label: 'Kapak görseli eklendi', done: Boolean(imageFile) },
        { label: 'Başlık ve SKU hazır', done: Boolean(form.title.trim() && form.sku.trim()) },
        { label: 'Fiyat ve kategori seçildi', done: Boolean(form.price && form.subcategoryId) },
        { label: 'Renk veya beden varyasyonu var', done: normalizedColors.length > 0 || normalizedSizes.length > 0 },
        { label: 'Detay katmanı dolduruldu', done: Boolean(details.material || normalizedCare.length || normalizedBulletPoints.length || details.description_long) },
    ];

    const publicPath = selectedCategory?.slug && selectedSubcategory?.slug && form.sku
        ? `/${selectedCategory.slug}/${selectedSubcategory.slug}/${form.sku}`
        : '/kategori/alt-kategori/SKU';

    function clearError(key) {
        setErrors((current) => {
            if (!current[key]) {
                return current;
            }

            return {
                ...current,
                [key]: '',
            };
        });
    }

    function updateForm(key, value) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
        clearError(key);
    }

    function handleTitleChange(event) {
        const nextTitle = event.target.value;

        setForm((current) => ({
            ...current,
            title: nextTitle,
            sku: skuTouched ? current.sku : createSku(nextTitle),
        }));

        clearError('title');
        if (!skuTouched) {
            clearError('sku');
        }
    }

    function handleSkuChange(event) {
        setSkuTouched(true);
        updateForm('sku', createSku(event.target.value));
    }

    function handleCategorySelect(categoryId) {
        const category = categories.find((item) => String(item.id) === String(categoryId));
        const firstSubcategory = category?.subcategories?.[0];

        setForm((current) => ({
            ...current,
            categoryId: category ? String(category.id) : '',
            subcategoryId: firstSubcategory ? String(firstSubcategory.id) : '',
        }));

        clearError('subcategoryId');
    }

    function handleSubcategorySelect(subcategoryId) {
        updateForm('subcategoryId', String(subcategoryId));
    }

    function handleColorChange(index, key, value) {
        setColors((current) => current.map((color, colorIndex) => (
            colorIndex === index
                ? { ...color, [key]: value }
                : color
        )));
    }

    function handleReset() {
        const firstCategory = categories[0];
        const firstSubcategory = firstCategory?.subcategories?.[0];

        setForm({
            ...INITIAL_FORM,
            categoryId: firstCategory ? String(firstCategory.id) : '',
            subcategoryId: firstSubcategory ? String(firstSubcategory.id) : '',
        });
        setColors([createEmptyColor()]);
        setImageFile(null);
        setErrors({});
        setSkuTouched(false);
    }

    function validateForm() {
        const nextErrors = {
            title: form.title.trim() ? '' : 'Ürün adı gerekli.',
            brand: form.brand.trim() ? '' : 'Marka gerekli.',
            sku: form.sku.trim() ? '' : 'SKU gerekli.',
            price: form.price ? '' : 'Fiyat gerekli.',
            description: form.description.trim() ? '' : 'Kısa açıklama gerekli.',
            subcategoryId: form.subcategoryId ? '' : 'Alt kategori seçin.',
            image: imageFile ? '' : 'Kapak görseli gerekli.',
        };

        setErrors(nextErrors);
        return Object.values(nextErrors).every((value) => !value);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            enqueueSnackbar('Eksik alanları tamamlayın.', { variant: 'warning' });
            return;
        }

        try {
            setSubmitting(true);

            const payload = new FormData();
            payload.set('title', form.title.trim());
            payload.set('description', form.description.trim());
            payload.set('sku', form.sku.trim());
            payload.set('price', form.price.trim());
            payload.set('brand', form.brand.trim());
            payload.set('subcategory_id', form.subcategoryId);
            payload.set('colors', JSON.stringify(normalizedColors));
            payload.set('sizes', JSON.stringify(normalizedSizes));
            payload.set('details', JSON.stringify(details));
            payload.set('image', imageFile);

            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    role: 'admin',
                },
                body: payload,
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Ürün oluşturulamadı.');
            }

            enqueueSnackbar('Ürün başarıyla oluşturuldu.', { variant: 'success' });
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            enqueueSnackbar(error.message || 'Ürün oluşturulamadı.', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <CircularProgress className="!text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            <SurfaceCard className="!relative overflow-hidden">
                <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-secondary/20 blur-2xl" />

                <div className="relative flex flex-col gap-6 p-6 sm:p-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-text-main">
                            Yeni ürün kurgusunu vitrinden önce burada netleştirin
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
                            Bu ekran yalnızca veri girişi değil. Ürünün kategori yerleşimini, varyasyon
                            yoğunluğunu ve vitrin hazır olma seviyesini aynı anda görerek kataloga daha temiz
                            bir giriş yapmanızı sağlar.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            onClick={handleReset}
                            startIcon={<RestartAltRoundedIcon />}
                            className="!rounded-2xl !border !border-primary/10 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-background-light"
                        >
                            Formu Temizle
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || !selectedSubcategory || !!loadError}
                            startIcon={<PublishRoundedIcon />}
                            className="!rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white disabled:!bg-primary/40 disabled:!text-text-main/70"
                        >
                            {submitting ? 'Oluşturuluyor...' : 'Ürünü Oluştur'}
                        </Button>
                    </div>
                </div>
            </SurfaceCard>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
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
                                    value={form.title}
                                    onChange={handleTitleChange}
                                    placeholder="Örn. Oversize Sherpa Hoodie"
                                />
                            </Field>

                            <Field label="Marka" error={errors.brand}>
                                <Input
                                    value={form.brand}
                                    onChange={(event) => updateForm('brand', event.target.value)}
                                    placeholder="Örn. North Loom"
                                />
                            </Field>

                            <Field label="SKU" hint="ASCII ve tekil" error={errors.sku}>
                                <Input
                                    value={form.sku}
                                    onChange={handleSkuChange}
                                    placeholder="Örn. HOODIE-CORE-01"
                                />
                            </Field>

                            <Field label="Fiyat" hint="TL" error={errors.price}>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(event) => updateForm('price', event.target.value)}
                                    placeholder="1499.90"
                                />
                            </Field>
                        </div>

                        <div className="mt-5">
                            <Field
                                label="Kısa açıklama"
                                hint={`${form.description.trim().length} karakter`}
                                error={errors.description}
                            >
                                <Textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(event) => updateForm('description', event.target.value)}
                                    placeholder="Ürünün vitrinde ilk bakışta satacağı net faydayı kısa ve tok bir dille yazın."
                                />
                            </Field>
                        </div>
                    </SurfaceCard>

                    <SurfaceCard className="p-6 sm:p-8">
                        <SectionIntro
                            eyebrow="Yerleşim"
                            title="Kategori akışını seçin"
                            description="Önce üst kategoriyi kilitleyin, sonra ürünü doğru alt kategoriye yerleştirin. Sağ panelde oluşturulan public path anında güncellenir."
                            icon={<CategoryRoundedIcon />}
                        />

                        {loadError ? (
                            <div className="mt-8 rounded-[28px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                                {loadError}
                            </div>
                        ) : (
                            <>
                                <div className="mt-8 grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="Kategori"
                                        hint={`${categories.length} aktif kategori`}
                                    >
                                        <Select
                                            value={form.categoryId}
                                            onChange={(event) => handleCategorySelect(event.target.value)}
                                            disabled={categories.length === 0}
                                        >
                                            <option value="">Aktif kategori seçin</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>

                                    <Field
                                        label="Alt kategori"
                                        hint={`${availableSubcategories.length} aktif alt kategori`}
                                        error={errors.subcategoryId}
                                    >
                                        <Select
                                            value={form.subcategoryId}
                                            onChange={(event) => handleSubcategorySelect(event.target.value)}
                                            disabled={!selectedCategory || availableSubcategories.length === 0}
                                        >
                                            <option value="">
                                                {selectedCategory
                                                    ? 'Aktif alt kategori seçin'
                                                    : 'Önce kategori seçin'}
                                            </option>
                                            {availableSubcategories.map((subcategory) => (
                                                <option key={subcategory.id} value={String(subcategory.id)}>
                                                    {subcategory.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                </div>

                                <div className="mt-6 rounded-[28px] border border-primary/10 bg-background-light p-5">
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">
                                        Aktif Filtre
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <Chip
                                            label={selectedCategory?.name || 'Kategori seçilmedi'}
                                            className="!rounded-full !bg-primary/10 !font-semibold !text-primary-dark"
                                        />
                                        <Chip
                                            label={selectedSubcategory?.name || 'Alt kategori seçilmedi'}
                                            className="!rounded-full !bg-white !font-semibold !text-text-main"
                                        />
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-text-muted">
                                        Dropdown listelerinde yalnızca `active` durumundaki kategori ve alt kategoriler gösterilir.
                                    </p>
                                </div>
                            </>
                        )}
                    </SurfaceCard>

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
                                        onClick={() => setColors((current) => [...current, createEmptyColor()])}
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
                                                onChange={(event) => handleColorChange(index, 'name', event.target.value)}
                                                placeholder="Örn. Kum Beji"
                                            />
                                            <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-3">
                                                <input
                                                    type="color"
                                                    value={color.hex}
                                                    onChange={(event) => handleColorChange(index, 'hex', event.target.value)}
                                                    className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
                                                />
                                                <span className="text-sm font-bold text-text-main">{color.hex.toUpperCase()}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => setColors((current) => (
                                                    current.length === 1
                                                        ? [createEmptyColor()]
                                                        : current.filter((_, colorIndex) => colorIndex !== index)
                                                ))}
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
                                        value={form.sizes}
                                        onChange={(event) => updateForm('sizes', event.target.value)}
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

                    <SurfaceCard className="p-6 sm:p-8">
                        <SectionIntro
                            eyebrow="İçerik"
                            title="Detay katmanını zenginleştirin"
                            description="Uzun açıklama, materyal, bakım notları ve satışta öne çıkacak bullet point’ler ürünün ikna gücünü yükseltir."
                            icon={<AutoAwesomeRoundedIcon />}
                        />

                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            <Field label="Materyal">
                                <Input
                                    value={form.material}
                                    onChange={(event) => updateForm('material', event.target.value)}
                                    placeholder="%80 cotton, %20 polyester"
                                />
                            </Field>

                            <Field label="Kapak görseli" hint="Maks. 3MB" error={errors.image}>
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
                                        onChange={(event) => {
                                            const nextFile = event.target.files?.[0] || null;
                                            setImageFile(nextFile);
                                            clearError('image');
                                        }}
                                    />
                                </label>
                            </Field>

                            <Field label="Bakım notları" hint="Her satır ayrı kural">
                                <Textarea
                                    rows={5}
                                    value={form.care}
                                    onChange={(event) => updateForm('care', event.target.value)}
                                    placeholder={'30 derecede yikayin\nDusuk isiyle utuleyin\nKurutucu kullanmayin'}
                                />
                            </Field>

                            <Field label="Öne çıkan maddeler" hint="Her satır ayrı madde">
                                <Textarea
                                    rows={5}
                                    value={form.bulletPoints}
                                    onChange={(event) => updateForm('bulletPoints', event.target.value)}
                                    placeholder={'Soft touch doku\nRelaxed fit kalip\nSezonlar arasi kullanima uygun'}
                                />
                            </Field>
                        </div>

                        <div className="mt-5">
                            <Field label="Uzun açıklama" hint="PDP hikayesi">
                                <Textarea
                                    rows={6}
                                    value={form.descriptionLong}
                                    onChange={(event) => updateForm('descriptionLong', event.target.value)}
                                    placeholder="Kumaş hissi, kullanım bağlamı ve ürünün stil avantajını daha editoryal bir tonda detaylandırın."
                                />
                            </Field>
                        </div>
                    </SurfaceCard>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                    <SurfaceCard className="overflow-hidden">
                        <div className="border-b border-primary/10 px-6 py-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">
                                Kalite Paneli
                            </p>
                            <div className="mt-3 flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-text-main">{score}/100</h2>
                                    <p className="mt-1 text-sm font-semibold text-text-muted">{readiness.label}</p>
                                </div>
                                <Chip
                                    label={readiness.label}
                                    className={readiness.value === 'ready'
                                        ? '!rounded-full !bg-primary !font-bold !text-text-main'
                                        : readiness.value === 'growing'
                                            ? '!rounded-full !bg-accent/20 !font-bold !text-text-main'
                                            : '!rounded-full !bg-red-50 !font-bold !text-red-500'}
                                />
                            </div>
                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-background-light">
                                <div
                                    className={`h-full rounded-full ${readiness.meterClassName}`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 px-6 py-5">
                            {checklist.map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className={`flex size-8 items-center justify-center rounded-full ${item.done ? 'bg-primary/15 text-primary-dark' : 'bg-background-light text-text-muted'}`}>
                                        <CheckCircleRoundedIcon className="!text-lg" />
                                    </div>
                                    <p className={`text-sm font-semibold ${item.done ? 'text-text-main' : 'text-text-muted'}`}>
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </SurfaceCard>

                    <SurfaceCard className="overflow-hidden">
                        <div className="relative aspect-[1/1] overflow-hidden bg-background-light">
                            {imagePreview ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url("${imagePreview}")` }}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-text-muted">
                                    <div className="text-center">
                                        <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary-dark">
                                            <Inventory2RoundedIcon className="!text-4xl" />
                                        </div>
                                        <p className="mt-4 text-sm font-semibold">Kapak görseli bekleniyor</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent p-5">
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategory ? (
                                        <Chip
                                            label={selectedCategory.name}
                                            className="!rounded-full !bg-white/90 !font-semibold !text-text-main"
                                        />
                                    ) : null}
                                    {selectedSubcategory ? (
                                        <Chip
                                            label={selectedSubcategory.name}
                                            className="!rounded-full !bg-text-main/85 !font-semibold !text-white"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                                        {form.brand.trim() || 'Marka'}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight text-text-main">
                                        {form.title.trim() || 'Ürün başlığı burada görünür'}
                                    </h3>
                                </div>
                                <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-main">
                                    {form.sku.trim() || 'SKU'}
                                </span>
                            </div>

                            <p className="text-sm leading-7 text-text-muted">
                                {form.description.trim() || 'Kısa açıklama, ürün kartının tonu ve fayda anlatımı için burada önizlenir.'}
                            </p>

                            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-primary/10 bg-background-light px-4 py-3">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <LocalOfferRoundedIcon className="!text-lg" />
                                    <span className="text-sm font-semibold">Liste fiyatı</span>
                                </div>
                                <span className="text-lg font-black text-text-main">
                                    {form.price ? formatCurrency(form.price) : formatCurrency(0)}
                                </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[24px] border border-primary/10 bg-white p-4">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <ColorLensRoundedIcon className="!text-lg" />
                                        <span className="text-xs font-black uppercase tracking-[0.16em]">Renk</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-text-main">{normalizedColors.length}</p>
                                </div>
                                <div className="rounded-[24px] border border-primary/10 bg-white p-4">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <StraightenRoundedIcon className="!text-lg" />
                                        <span className="text-xs font-black uppercase tracking-[0.16em]">Beden</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-text-main">{normalizedSizes.length}</p>
                                </div>
                                <div className="rounded-[24px] border border-primary/10 bg-white p-4">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <AutoAwesomeRoundedIcon className="!text-lg" />
                                        <span className="text-xs font-black uppercase tracking-[0.16em]">Detay</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-text-main">
                                        {[details.material, normalizedCare.length, normalizedBulletPoints.length, details.description_long].filter(Boolean).length}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                                    Public Path
                                </p>
                                <div className="mt-2 rounded-[24px] border border-primary/10 bg-background-light px-4 py-3 font-mono text-xs font-bold text-text-main">
                                    {publicPath}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                                    Aktif Varyasyonlar
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {normalizedColors.map((color) => (
                                        <span
                                            key={color.name}
                                            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1.5 text-xs font-bold text-text-main"
                                        >
                                            <span
                                                className="size-2.5 rounded-full"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            {color.name}
                                        </span>
                                    ))}
                                    {normalizedSizes.map((size) => (
                                        <span
                                            key={size}
                                            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-secondary/15 px-3 py-1.5 text-xs font-bold text-text-main"
                                        >
                                            {size}
                                        </span>
                                    ))}
                                    {normalizedColors.length === 0 && normalizedSizes.length === 0 ? (
                                        <p className="text-sm font-medium text-text-muted">
                                            Henüz varyasyon tanımlanmadı.
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </SurfaceCard>

                    <SurfaceCard className="p-6">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">
                            Merch Notları
                        </p>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Başlıkta kategori adı değil fayda kullanın</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    Aynı alt kategorideki ürünler arasında fark yaratan kumaş, siluet veya kullanım bağlamını öne alın.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Bedenleri satış akışına göre sırala</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    Stok akışı hangi sırayı kullanıyorsa burada da aynı düzeni koruyun: XS, S, M, L, XL gibi.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Detay alanını boş bırakmayın</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    Materyal, bakım ve bullet point blokları ürün kartını vitrine hazır seviyeye daha hızlı taşır.
                                </p>
                            </div>
                        </div>
                    </SurfaceCard>
                </aside>
            </div>
        </form>
    );
}
