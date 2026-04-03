'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Chip, CircularProgress } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useSnackbar } from 'notistack';
import ProductCategoryFlowSection from '@/components/admin/products/ProductCategoryFlowSection';
import ProductContentSection from '@/components/admin/products/ProductContentSection';
import ProductDeleteDialog from '@/components/admin/products/ProductDeleteDialog';
import { SurfaceCard } from '@/components/admin/products/ProductFormPrimitives';
import ProductGeneralInfoSection from '@/components/admin/products/ProductGeneralInfoSection';
import ProductImageField from '@/components/admin/products/ProductImageField';
import ProductVariationsSection from '@/components/admin/products/ProductVariationsSection';
import {
    formatCurrency,
    formatDate,
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

function normalizeCategories(categoriesData = [], subcategoriesData = [], currentIds = {}) {
    const currentCategoryId = Number(currentIds.categoryId || 0);
    const currentSubcategoryId = Number(currentIds.subcategoryId || 0);

    const visibleSubcategories = Array.isArray(subcategoriesData)
        ? subcategoriesData.filter((subcategory) => (
            Number(subcategory?.activate ?? 0) === 1
            || Number(subcategory?.id) === currentSubcategoryId
        ))
        : [];

    return Array.isArray(categoriesData)
        ? categoriesData
            .filter((category) => (
                Number(category?.activate ?? 0) === 1
                || Number(category?.id) === currentCategoryId
            ))
            .map((category) => ({
                id: Number(category?.id),
                name: category?.name || 'İsimsiz Kategori',
                slug: category?.slug || '',
                subcategories: visibleSubcategories
                    .filter((subcategory) => Number(subcategory?.category_id) === Number(category?.id))
                    .map((subcategory) => ({
                        id: Number(subcategory?.id),
                        name: subcategory?.name || 'İsimsiz Alt Kategori',
                        slug: subcategory?.slug || '',
                    })),
            }))
            .filter((category) => category.subcategories.length > 0)
        : [];
}

function normalizeColorRows(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptyColor()];
    }

    return value.map((color) => {
        if (color && typeof color === 'object' && !Array.isArray(color)) {
            return {
                name: String(color.name || '').trim(),
                hex: String(color.hex || '#111827').trim() || '#111827',
            };
        }

        return {
            name: String(color || '').trim(),
            hex: '#111827',
        };
    });
}

function buildFormFromProduct(product, nextCategories) {
    const details = product?.details && typeof product.details === 'object' && !Array.isArray(product.details)
        ? product.details
        : {};
    const nextCategoryId = String(product?.category_id || nextCategories[0]?.id || '');
    const activeCategory = nextCategories.find((category) => String(category.id) === nextCategoryId) || null;
    const rawSubcategoryId = String(product?.subcategory_id || product?.sub_category_id || '');
    const hasCurrentSubcategory = activeCategory?.subcategories?.some(
        (subcategory) => String(subcategory.id) === rawSubcategoryId
    );
    const nextSubcategoryId = hasCurrentSubcategory
        ? rawSubcategoryId
        : String(activeCategory?.subcategories?.[0]?.id || '');

    return {
        form: {
            title: product?.title || '',
            brand: product?.brand || '',
            sku: product?.sku || '',
            price: product?.price ? String(product.price) : '',
            description: product?.description || '',
            categoryId: nextCategoryId,
            subcategoryId: nextSubcategoryId,
            sizes: Array.isArray(product?.sizes) ? product.sizes.join(', ') : '',
            material: typeof details.material === 'string' ? details.material : '',
            care: Array.isArray(details.care) ? details.care.join('\n') : '',
            bulletPoints: Array.isArray(details.bullet_points) ? details.bullet_points.join('\n') : '',
            descriptionLong: typeof details.description_long === 'string' ? details.description_long : '',
        },
        colors: normalizeColorRows(product?.colors),
        imagePreview: product?.image || '',
        meta: {
            id: Number(product?.id || 0),
            createdAt: product?.created_at || null,
        },
    };
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [skuTouched, setSkuTouched] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [colors, setColors] = useState([createEmptyColor()]);
    const [imageFile, setImageFile] = useState(null);
    const [storedImagePreview, setStoredImagePreview] = useState('');
    const [uploadedImagePreview, setUploadedImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [productMeta, setProductMeta] = useState({ id: 0, createdAt: null });
    const [initialDraft, setInitialDraft] = useState(null);

    useEffect(() => {
        if (!productId) {
            return undefined;
        }

        let active = true;

        async function loadPageData() {
            try {
                setLoading(true);
                setLoadError('');

                const [productResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
                    fetch(`/api/admin/products/${productId}`, {
                        headers: { role: 'admin' },
                    }),
                    fetch('/api/admin/categories', {
                        headers: { role: 'admin' },
                    }),
                    fetch('/api/admin/subcategories', {
                        headers: { role: 'admin' },
                    }),
                ]);

                const [productData, categoriesData, subcategoriesData] = await Promise.all([
                    productResponse.json().catch(() => null),
                    categoriesResponse.json().catch(() => []),
                    subcategoriesResponse.json().catch(() => []),
                ]);

                if (!productResponse.ok) {
                    throw new Error(productData?.error || 'Ürün detayı yüklenemedi.');
                }

                if (!categoriesResponse.ok) {
                    throw new Error(categoriesData?.error || 'Kategoriler yüklenemedi.');
                }

                if (!subcategoriesResponse.ok) {
                    throw new Error(subcategoriesData?.error || 'Alt kategoriler yüklenemedi.');
                }

                if (!active) {
                    return;
                }

                const nextCategories = normalizeCategories(
                    categoriesData,
                    subcategoriesData,
                    {
                        categoryId: productData?.category_id,
                        subcategoryId: productData?.subcategory_id || productData?.sub_category_id,
                    }
                );

                if (nextCategories.length === 0) {
                    throw new Error('Bu ürün için kullanılabilir kategori bulunamadı.');
                }

                const nextDraft = buildFormFromProduct(productData, nextCategories);

                setCategories(nextCategories);
                setForm(nextDraft.form);
                setColors(nextDraft.colors);
                setStoredImagePreview(nextDraft.imagePreview);
                setUploadedImagePreview('');
                setImageFile(null);
                setErrors({});
                setSkuTouched(true);
                setProductMeta(nextDraft.meta);
                setInitialDraft(nextDraft);
            } catch (error) {
                if (!active) {
                    return;
                }

                const message = error.message || 'Ürün detayı yüklenemedi.';
                setLoadError(message);
                enqueueSnackbar(message, { variant: 'error' });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPageData();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar, productId]);

    useEffect(() => {
        if (!imageFile) {
            setUploadedImagePreview('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setUploadedImagePreview(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [imageFile]);

    const imagePreview = uploadedImagePreview || storedImagePreview;
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
        { label: 'Kapak görseli eklendi', done: Boolean(imagePreview) },
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

    function handleRemoveColor(index) {
        setColors((current) => (
            current.length === 1
                ? [createEmptyColor()]
                : current.filter((_, colorIndex) => colorIndex !== index)
        ));
    }

    function handleImageChange(nextFile) {
        setImageFile(nextFile);
        clearError('image');
    }

    function handleReset() {
        if (!initialDraft) {
            return;
        }

        setForm(initialDraft.form);
        setColors(initialDraft.colors);
        setStoredImagePreview(initialDraft.imagePreview);
        setUploadedImagePreview('');
        setImageFile(null);
        setErrors({});
        setSkuTouched(true);
    }

    function validateForm() {
        const nextErrors = {
            title: form.title.trim() ? '' : 'Ürün adı gerekli.',
            brand: form.brand.trim() ? '' : 'Marka gerekli.',
            sku: form.sku.trim() ? '' : 'SKU gerekli.',
            price: form.price ? '' : 'Fiyat gerekli.',
            description: form.description.trim() ? '' : 'Kısa açıklama gerekli.',
            subcategoryId: form.subcategoryId ? '' : 'Alt kategori seçin.',
            image: imagePreview ? '' : 'Kapak görseli gerekli.',
        };

        setErrors(nextErrors);
        return Object.values(nextErrors).every((value) => !value);
    }

    async function resolveImageFileForSubmit() {
        if (imageFile) {
            return imageFile;
        }

        if (!imagePreview) {
            return null;
        }

        const response = await fetch(imagePreview);

        if (!response.ok) {
            throw new Error('Mevcut ürün görseli submit için hazırlanamadı.');
        }

        const blob = await response.blob();
        const type = blob.type || 'image/png';
        const extension = (type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '') || 'png';
        const fileName = `${createSku(form.sku || `PRODUCT-${productId}`) || `PRODUCT-${productId}`}.${extension}`;

        return new File([blob], fileName, { type });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            enqueueSnackbar('Eksik alanları tamamlayın.', { variant: 'warning' });
            return;
        }

        try {
            setSubmitting(true);

            const submitImage = await resolveImageFileForSubmit();

            if (!submitImage) {
                setErrors((current) => ({ ...current, image: 'Kapak görseli gerekli.' }));
                enqueueSnackbar('Kapak görseli gerekli.', { variant: 'warning' });
                return;
            }

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
            payload.set('image', submitImage);

            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    role: 'admin',
                },
                body: payload,
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Ürün güncellenemedi.');
            }

            const nextStoredImagePreview = data?.image || imagePreview;
            const nextDraft = {
                form,
                colors,
                imagePreview: nextStoredImagePreview,
                meta: {
                    id: Number(data?.id || productMeta.id),
                    createdAt: data?.created_at || productMeta.createdAt,
                },
            };

            setStoredImagePreview(nextStoredImagePreview);
            setUploadedImagePreview('');
            setImageFile(null);
            setInitialDraft(nextDraft);
            setProductMeta(nextDraft.meta);

            enqueueSnackbar('Ürün başarıyla güncellendi.', { variant: 'success' });
            router.refresh();
        } catch (error) {
            enqueueSnackbar(error.message || 'Ürün güncellenemedi.', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    function openDeleteDialog() {
        if (deleting) {
            return;
        }

        setDeleteDialogOpen(true);
    }

    function closeDeleteDialog() {
        if (deleting) {
            return;
        }

        setDeleteDialogOpen(false);
    }

    async function confirmDelete() {
        if (!productId || deleting) {
            return;
        }

        try {
            setDeleting(true);

            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    role: 'admin',
                },
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Ürün silinemedi.');
            }

            setDeleteDialogOpen(false);
            enqueueSnackbar('Ürün silindi.', { variant: 'success' });
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            enqueueSnackbar(error.message || 'Ürün silinemedi.', { variant: 'error' });
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <CircularProgress className="!text-primary" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center">
                <SurfaceCard className="max-w-xl p-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-red-50 text-red-500">
                        <WarningAmberRoundedIcon className="!text-4xl" />
                    </div>
                    <h1 className="mt-6 text-3xl font-black tracking-tight text-text-main">
                        Ürün detayı yüklenemedi
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-text-muted">
                        {loadError}
                    </p>
                    <Button
                        component={Link}
                        href="/admin/products"
                        startIcon={<ArrowBackRoundedIcon />}
                        className="!mt-6 !rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white"
                    >
                        Ürün listesine dön
                    </Button>
                </SurfaceCard>
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
                        <Link
                            href="/admin/products"
                            className="inline-flex items-center gap-2 text-sm font-bold text-text-muted transition hover:text-primary-dark"
                        >
                            <ArrowBackRoundedIcon className="!text-base" />
                            Ürün listesine dön
                        </Link>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-main">
                                Ürün #{productMeta.id || productId}
                            </span>
                            <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-main">
                                Oluşturuldu {formatDate(productMeta.createdAt)}
                            </span>
                        </div>

                        <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-text-main">
                            Ürünü düzenleyin ve katalog kalitesini koruyun
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
                            Bu ekran ürünün vitrin görünümü ile admin kurgusunu aynı yüzeyde toplar. İçeriği,
                            kategori yerleşimini ve varyasyon yapısını bozmadan güncelleyin.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            onClick={handleReset}
                            disabled={submitting || deleting || !initialDraft}
                            startIcon={<RestartAltRoundedIcon />}
                            className="!rounded-2xl !border !border-primary/10 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-background-light"
                        >
                            Değişiklikleri Geri Al
                        </Button>
                        <Button
                            type="button"
                            onClick={openDeleteDialog}
                            disabled={submitting || deleting}
                            startIcon={<DeleteRoundedIcon />}
                            className="!rounded-2xl !border !border-red-100 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-red-500 hover:!bg-red-50"
                        >
                            {deleting ? 'Siliniyor...' : 'Ürünü Sil'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || deleting || !selectedSubcategory}
                            startIcon={<SaveRoundedIcon />}
                            className="!rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white disabled:!bg-primary/40 disabled:!text-text-main/70"
                        >
                            {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </Button>
                    </div>
                </div>
            </SurfaceCard>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <ProductGeneralInfoSection
                        values={form}
                        errors={errors}
                        onTitleChange={handleTitleChange}
                        onBrandChange={(event) => updateForm('brand', event.target.value)}
                        onSkuChange={handleSkuChange}
                        onPriceChange={(event) => updateForm('price', event.target.value)}
                        onDescriptionChange={(event) => updateForm('description', event.target.value)}
                    />

                    <ProductCategoryFlowSection
                        loadError=""
                        categories={categories}
                        selectedCategory={selectedCategory}
                        selectedSubcategory={selectedSubcategory}
                        availableSubcategories={availableSubcategories}
                        errors={errors}
                        categoryId={form.categoryId}
                        subcategoryId={form.subcategoryId}
                        onCategoryChange={(event) => handleCategorySelect(event.target.value)}
                        onSubcategoryChange={(event) => handleSubcategorySelect(event.target.value)}
                    />

                    <ProductVariationsSection
                        colors={colors}
                        sizesValue={form.sizes}
                        normalizedSizes={normalizedSizes}
                        onAddColor={() => setColors((current) => [...current, createEmptyColor()])}
                        onColorChange={handleColorChange}
                        onRemoveColor={handleRemoveColor}
                        onSizesChange={(event) => updateForm('sizes', event.target.value)}
                    />

                    <ProductContentSection
                        materialValue={form.material}
                        careValue={form.care}
                        bulletPointsValue={form.bulletPoints}
                        descriptionLongValue={form.descriptionLong}
                        onMaterialChange={(event) => updateForm('material', event.target.value)}
                        onCareChange={(event) => updateForm('care', event.target.value)}
                        onBulletPointsChange={(event) => updateForm('bulletPoints', event.target.value)}
                        onDescriptionLongChange={(event) => updateForm('descriptionLong', event.target.value)}
                        imageField={(
                            <ProductImageField
                                imageFile={imageFile || (imagePreview ? { name: 'Mevcut görsel kullanılıyor' } : null)}
                                error={errors.image}
                                onImageChange={handleImageChange}
                            />
                        )}
                    />
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
                            Edit Notları
                        </p>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Mevcut görsel korunur</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    Yeni dosya seçmezseniz kaydetme sırasında mevcut kapak görseli otomatik olarak tekrar kullanılır.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Pasif kategoriye düşen ürün de düzenlenebilir</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    Ürün şu an pasif bir kategoriye bağlıysa mevcut atama formda korunur; isterseniz aktif akışa taşıyabilirsiniz.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Silme işlemi geri alınmaz</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    Ürün silindiğinde katalog kaydı kalıcı olarak kaldırılır ve liste ekranına dönülür.
                                </p>
                            </div>
                        </div>
                    </SurfaceCard>
                </aside>
            </div>

            <ProductDeleteDialog
                open={deleteDialogOpen}
                productTitle={form.title.trim() || 'Ürün'}
                loading={deleting}
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
            />
        </form>
    );
}
