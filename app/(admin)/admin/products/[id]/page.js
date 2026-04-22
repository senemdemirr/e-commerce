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
import ColorForm from '@/components/admin/ColorForm';
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice';
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
import {
    buildVariantMatrix,
    createEmptyColor,
    createEmptyProductLookups,
    createEmptySize,
    createEmptyTextRow,
    createEmptyVariant,
    createSku,
    findLookupColor,
    findLookupValue,
    mergeColorLookupOptions,
    normalizeProductLookups,
    normalizeColorRows,
    normalizeSizeRows,
    normalizeTextRows,
    normalizeVariantPayload,
    normalizeVariantRows,
} from '@/lib/admin/product-editor';
import { normalizeColorRecord } from '@/lib/admin/colors';
import { useAdminSession } from '@/context/AdminSessionContext';

const INITIAL_FORM = {
    title: '',
    brand: '',
    sku: '',
    price: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    descriptionLong: '',
};

function applyCreatedColorToRows(rows, targetIndex, color) {
    const nextColor = {
        name: String(color?.name || '').trim(),
        hex: String(color?.hex || '#111827').trim() || '#111827',
    };

    if (!nextColor.name) {
        return rows;
    }

    if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= rows.length) {
        return [...rows, nextColor];
    }

    return rows.map((row, index) => (
        index === targetIndex ? nextColor : row
    ));
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
                name: category?.name || 'Untitled Category',
                slug: category?.slug || '',
                subcategories: visibleSubcategories
                    .filter((subcategory) => Number(subcategory?.category_id) === Number(category?.id))
                    .map((subcategory) => ({
                        id: Number(subcategory?.id),
                        name: subcategory?.name || 'Untitled Subcategory',
                        slug: subcategory?.slug || '',
                    })),
            }))
            .filter((category) => category.subcategories.length > 0)
        : [];
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
            descriptionLong: Array.isArray(details.description_long)
                ? (details.description_long[0] || '')
                : (typeof details.description_long === 'string' ? details.description_long : ''),
        },
        colors: normalizeColorRows(product?.colors),
        sizes: normalizeSizeRows(product?.sizes),
        materialItems: normalizeTextRows(details.material),
        careItems: normalizeTextRows(details.care),
        bulletPointItems: normalizeTextRows(details.bullet_point || details.bullet_points),
        variants: normalizeVariantRows(product?.variants, product?.price),
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
    const { canMutate, loading: adminLoading } = useAdminSession();
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
    const [sizes, setSizes] = useState([createEmptySize()]);
    const [materialItems, setMaterialItems] = useState([createEmptyTextRow()]);
    const [careItems, setCareItems] = useState([createEmptyTextRow()]);
    const [bulletPointItems, setBulletPointItems] = useState([createEmptyTextRow()]);
    const [variants, setVariants] = useState([createEmptyVariant()]);
    const [imageFile, setImageFile] = useState(null);
    const [storedImagePreview, setStoredImagePreview] = useState('');
    const [uploadedImagePreview, setUploadedImagePreview] = useState('');
    const [lookupOptions, setLookupOptions] = useState(() => createEmptyProductLookups());
    const [colorFormOpen, setColorFormOpen] = useState(false);
    const [colorFormSubmitting, setColorFormSubmitting] = useState(false);
    const [colorCreateTargetIndex, setColorCreateTargetIndex] = useState(null);
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
                    throw new Error(productData?.error || 'Product details could not be loaded.');
                }

                if (!categoriesResponse.ok) {
                    throw new Error(categoriesData?.error || 'Categories could not be loaded.');
                }

                if (!subcategoriesResponse.ok) {
                    throw new Error(subcategoriesData?.error || 'Subcategories could not be loaded.');
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
                    throw new Error('No available category was found for this product.');
                }

                const nextDraft = buildFormFromProduct(productData, nextCategories);

                setCategories(nextCategories);
                setForm(nextDraft.form);
                setColors(nextDraft.colors);
                setSizes(nextDraft.sizes);
                setMaterialItems(nextDraft.materialItems);
                setCareItems(nextDraft.careItems);
                setBulletPointItems(nextDraft.bulletPointItems);
                setVariants(nextDraft.variants);
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

                const message = error.message || 'Product details could not be loaded.';
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
        let active = true;

        async function loadLookupOptions() {
            try {
                const response = await fetch('/api/admin/products/lookups', {
                    headers: { role: 'admin' },
                });
                const data = await response.json().catch(() => createEmptyProductLookups());

                if (!active) {
                    return;
                }

                if (!response.ok) {
                    throw new Error(data?.error || 'Product lookups could not be loaded.');
                }

                setLookupOptions(normalizeProductLookups(data));
            } catch {
                if (!active) {
                    return;
                }

                setLookupOptions(createEmptyProductLookups());
            }
        }

        loadLookupOptions();

        return () => {
            active = false;
        };
    }, []);

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
    const normalizedSizes = sizes
        .map((size) => String(size || '').trim())
        .filter(Boolean);
    const normalizedVariants = normalizeVariantPayload(
        variants,
        form.sku.trim(),
        form.price.trim()
    );
    const normalizedMaterials = materialItems
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    const normalizedCare = careItems
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    const normalizedBulletPoints = bulletPointItems
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    const details = {
        material: normalizedMaterials,
        care: normalizedCare,
        bullet_point: normalizedBulletPoints,
        description_long: form.descriptionLong.trim() ? [form.descriptionLong.trim()] : [],
    };
    const detailSectionCount = [
        normalizedMaterials.length,
        normalizedCare.length,
        normalizedBulletPoints.length,
        details.description_long.length,
    ].filter(Boolean).length;

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
        { label: 'Cover image added', done: Boolean(imagePreview) },
        { label: 'Title and SKU ready', done: Boolean(form.title.trim() && form.sku.trim()) },
        { label: 'Price and category selected', done: Boolean(form.price && form.subcategoryId) },
        { label: 'Color or size variation added', done: normalizedColors.length > 0 || normalizedSizes.length > 0 },
        { label: 'Variant matrix configured', done: normalizedVariants.length > 0 },
        { label: 'Detail layer completed', done: Boolean(normalizedMaterials.length || normalizedCare.length || normalizedBulletPoints.length || details.description_long.length) },
    ];

    const publicPath = selectedCategory?.slug && selectedSubcategory?.slug && form.sku
        ? `/${selectedCategory.slug}/${selectedSubcategory.slug}/${form.sku}`
        : '/category/subcategory/SKU';

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
                ? (() => {
                    if (key !== 'name') {
                        return { ...color, [key]: value };
                    }

                    if (!String(value || '').trim()) {
                        return createEmptyColor();
                    }

                    const matchedColor = findLookupColor(lookupOptions.colors, value);

                    return matchedColor
                        ? { ...color, name: matchedColor.name, hex: matchedColor.hex }
                        : { ...color, name: value };
                })()
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

    function openColorCreateModal(index) {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can create colors.', { variant: 'warning' });
            return;
        }

        setColorCreateTargetIndex(index);
        setColorFormOpen(true);
    }

    function closeColorCreateModal() {
        if (colorFormSubmitting) {
            return;
        }

        setColorFormOpen(false);
        setColorCreateTargetIndex(null);
    }

    async function handleCreateColor(payload) {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can create colors.', { variant: 'warning' });
            return;
        }

        const targetIndex = colorCreateTargetIndex;

        try {
            setColorFormSubmitting(true);

            const response = await fetch('/api/admin/colors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'admin',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Color could not be created.');
            }

            const createdColor = normalizeColorRecord(data);

            setLookupOptions((current) => ({
                ...current,
                colors: mergeColorLookupOptions(current.colors, createdColor),
            }));
            setColors((current) => applyCreatedColorToRows(current, targetIndex, createdColor));

            enqueueSnackbar('Color created and selected.', { variant: 'success' });
            setColorFormOpen(false);
            setColorCreateTargetIndex(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Color could not be created.', { variant: 'error' });
        } finally {
            setColorFormSubmitting(false);
        }
    }

    function handleSizeChange(index, value) {
        const matchedSize = findLookupValue(lookupOptions.sizes, value);

        setSizes((current) => current.map((size, sizeIndex) => (
            sizeIndex === index ? (matchedSize || value) : size
        )));
    }

    function handleRemoveSize(index) {
        setSizes((current) => (
            current.length === 1
                ? [createEmptySize()]
                : current.filter((_, sizeIndex) => sizeIndex !== index)
        ));
    }

    function handleMaterialItemChange(index, value) {
        setMaterialItems((current) => current.map((item, itemIndex) => (
            itemIndex === index ? value : item
        )));
    }

    function handleRemoveMaterialItem(index) {
        setMaterialItems((current) => (
            current.length === 1
                ? [createEmptyTextRow()]
                : current.filter((_, itemIndex) => itemIndex !== index)
        ));
    }

    function handleCareItemChange(index, value) {
        setCareItems((current) => current.map((item, itemIndex) => (
            itemIndex === index ? value : item
        )));
    }

    function handleRemoveCareItem(index) {
        setCareItems((current) => (
            current.length === 1
                ? [createEmptyTextRow()]
                : current.filter((_, itemIndex) => itemIndex !== index)
        ));
    }

    function handleBulletPointChange(index, value) {
        setBulletPointItems((current) => current.map((item, itemIndex) => (
            itemIndex === index ? value : item
        )));
    }

    function handleRemoveBulletPoint(index) {
        setBulletPointItems((current) => (
            current.length === 1
                ? [createEmptyTextRow()]
                : current.filter((_, itemIndex) => itemIndex !== index)
        ));
    }

    function handleVariantChange(index, key, value) {
        setVariants((current) => current.map((variant, variantIndex) => (
            variantIndex === index
                ? { ...variant, [key]: value }
                : variant
        )));
    }

    function handleRemoveVariant(index) {
        setVariants((current) => (
            current.length === 1
                ? [createEmptyVariant({ price: form.price.trim() })]
                : current.filter((_, variantIndex) => variantIndex !== index)
        ));
    }

    function handleSetDefaultVariant(index) {
        setVariants((current) => current.map((variant, variantIndex) => ({
            ...variant,
            isDefault: variantIndex === index,
        })));
    }

    function handleGenerateVariants() {
        setVariants((current) => buildVariantMatrix({
            colors: normalizedColors,
            sizes: normalizedSizes,
            baseSku: form.sku.trim(),
            basePrice: form.price.trim(),
            existingVariants: current,
        }));
    }

    function handleImageChange(nextFile) {
        setImageFile(nextFile);
        clearError('image');
    }

    function handleReset() {
        if (!canMutate || !initialDraft) {
            return;
        }

        setForm(initialDraft.form);
        setColors(initialDraft.colors);
        setSizes(initialDraft.sizes);
        setMaterialItems(initialDraft.materialItems);
        setCareItems(initialDraft.careItems);
        setBulletPointItems(initialDraft.bulletPointItems);
        setVariants(initialDraft.variants);
        setStoredImagePreview(initialDraft.imagePreview);
        setUploadedImagePreview('');
        setImageFile(null);
        setErrors({});
        setSkuTouched(true);
    }

    function validateForm() {
        const nextErrors = {
            title: form.title.trim() ? '' : 'Product name is required.',
            brand: form.brand.trim() ? '' : 'Brand is required.',
            sku: form.sku.trim() ? '' : 'SKU is required.',
            price: form.price ? '' : 'Price is required.',
            description: form.description.trim() ? '' : 'Short description is required.',
            subcategoryId: form.subcategoryId ? '' : 'Select a subcategory.',
            image: imagePreview ? '' : 'Cover image is required.',
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
            throw new Error('The existing product image could not be prepared for submission.');
        }

        const blob = await response.blob();
        const type = blob.type || 'image/png';
        const extension = (type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '') || 'png';
        const fileName = `${createSku(form.sku || `PRODUCT-${productId}`) || `PRODUCT-${productId}`}.${extension}`;

        return new File([blob], fileName, { type });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!canMutate) {
            enqueueSnackbar('Only superadmin can update products.', { variant: 'warning' });
            return;
        }

        if (!validateForm()) {
            enqueueSnackbar('Complete the missing fields.', { variant: 'warning' });
            return;
        }

        try {
            setSubmitting(true);

            const submitImage = await resolveImageFileForSubmit();

            if (!submitImage) {
                setErrors((current) => ({ ...current, image: 'Cover image is required.' }));
                enqueueSnackbar('Cover image is required.', { variant: 'warning' });
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
            payload.set('variants', JSON.stringify(normalizedVariants));
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
                throw new Error(data?.error || 'Product could not be updated.');
            }

            const nextStoredImagePreview = data?.image || imagePreview;
            const nextDraft = {
                form,
                colors,
                sizes,
                materialItems,
                careItems,
                bulletPointItems,
                variants,
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

            enqueueSnackbar('Product updated successfully.', { variant: 'success' });
            router.refresh();
        } catch (error) {
            enqueueSnackbar(error.message || 'Product could not be updated.', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    function openDeleteDialog() {
        if (!canMutate || deleting) {
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
        if (!canMutate || !productId || deleting) {
            if (!canMutate) {
                enqueueSnackbar('Only superadmin can delete products.', { variant: 'warning' });
            }
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
                throw new Error(data?.error || 'Product could not be deleted.');
            }

            setDeleteDialogOpen(false);
            enqueueSnackbar('Product deleted.', { variant: 'success' });
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            enqueueSnackbar(error.message || 'Product could not be deleted.', { variant: 'error' });
        } finally {
            setDeleting(false);
        }
    }

    if (loading || adminLoading) {
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
                        Product details could not be loaded
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
                        Back to product list
                    </Button>
                </SurfaceCard>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            {!canMutate ? (
                <ReadOnlyNotice description="This account can review product details but only superadmin can update or delete products." />
            ) : null}

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
                            Back to product list
                        </Link>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-main">
                                Product #{productMeta.id || productId}
                            </span>
                            <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-main">
                                Created {formatDate(productMeta.createdAt)}
                            </span>
                        </div>

                        <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-text-main">
                            Edit the product and preserve catalog quality
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
                            This screen brings storefront preview and admin structure onto the same surface. Update
                            the content, category placement, and variation structure without breaking the setup.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            onClick={handleReset}
                            disabled={!canMutate || submitting || deleting || !initialDraft}
                            startIcon={<RestartAltRoundedIcon />}
                            className="!rounded-2xl !border !border-primary/10 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-background-light"
                        >
                            Revert Changes
                        </Button>
                        <Button
                            type="button"
                            onClick={openDeleteDialog}
                            disabled={!canMutate || submitting || deleting}
                            startIcon={<DeleteRoundedIcon />}
                            className="!rounded-2xl !border !border-red-100 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-red-500 hover:!bg-red-50"
                        >
                            {canMutate ? (deleting ? 'Deleting...' : 'Delete Product') : 'Read Only'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canMutate || submitting || deleting || !selectedSubcategory}
                            startIcon={<SaveRoundedIcon />}
                            className="!rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white disabled:!bg-primary/40 disabled:!text-text-main/70"
                        >
                            {canMutate ? (submitting ? 'Saving...' : 'Save Changes') : 'Read Only'}
                        </Button>
                    </div>
                </div>
            </SurfaceCard>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <ProductGeneralInfoSection
                        values={form}
                        errors={errors}
                        disabled={!canMutate}
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
                        disabled={!canMutate}
                        onCategoryChange={(event) => handleCategorySelect(event.target.value)}
                        onSubcategoryChange={(event) => handleSubcategorySelect(event.target.value)}
                    />

                    <ProductVariationsSection
                        colors={colors}
                        colorLookupOptions={lookupOptions.colors}
                        normalizedColors={normalizedColors}
                        sizes={sizes}
                        sizeLookupOptions={lookupOptions.sizes}
                        normalizedSizes={normalizedSizes}
                        variants={variants}
                        normalizedVariants={normalizedVariants}
                        disabled={!canMutate}
                        onAddColor={() => setColors((current) => [...current, createEmptyColor()])}
                        onColorChange={handleColorChange}
                        onOpenCreateColor={openColorCreateModal}
                        onRemoveColor={handleRemoveColor}
                        onAddSize={() => setSizes((current) => [...current, createEmptySize()])}
                        onSizeChange={handleSizeChange}
                        onRemoveSize={handleRemoveSize}
                        onAddVariant={() => setVariants((current) => [...current, createEmptyVariant({ price: form.price.trim() })])}
                        onVariantChange={handleVariantChange}
                        onRemoveVariant={handleRemoveVariant}
                        onGenerateVariants={handleGenerateVariants}
                        onSetDefaultVariant={handleSetDefaultVariant}
                    />

                    <ProductContentSection
                        materialItems={materialItems}
                        careItems={careItems}
                        bulletPointItems={bulletPointItems}
                        normalizedMaterials={normalizedMaterials}
                        normalizedCare={normalizedCare}
                        normalizedBulletPoints={normalizedBulletPoints}
                        descriptionLongValue={form.descriptionLong}
                        disabled={!canMutate}
                        onAddMaterialItem={() => setMaterialItems((current) => [...current, createEmptyTextRow()])}
                        onMaterialItemChange={handleMaterialItemChange}
                        onRemoveMaterialItem={handleRemoveMaterialItem}
                        onAddCareItem={() => setCareItems((current) => [...current, createEmptyTextRow()])}
                        onCareItemChange={handleCareItemChange}
                        onRemoveCareItem={handleRemoveCareItem}
                        onAddBulletPoint={() => setBulletPointItems((current) => [...current, createEmptyTextRow()])}
                        onBulletPointChange={handleBulletPointChange}
                        onRemoveBulletPoint={handleRemoveBulletPoint}
                        onDescriptionLongChange={(event) => updateForm('descriptionLong', event.target.value)}
                        imageField={(
                            <ProductImageField
                                imageFile={imageFile || (imagePreview ? { name: 'Using existing image' } : null)}
                                error={errors.image}
                                disabled={!canMutate}
                                onImageChange={handleImageChange}
                            />
                        )}
                    />
                </div>

                <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                    <SurfaceCard className="overflow-hidden">
                        <div className="border-b border-primary/10 px-6 py-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">
                                Quality Panel
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
                                        <p className="mt-4 text-sm font-semibold">Cover image pending</p>
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
                                        {form.brand.trim() || 'Brand'}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight text-text-main">
                                        {form.title.trim() || 'Product title will appear here'}
                                    </h3>
                                </div>
                                <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-text-main">
                                    {form.sku.trim() || 'SKU'}
                                </span>
                            </div>

                            <p className="text-sm leading-7 text-text-muted">
                                {form.description.trim() || 'The short description is previewed here to set the product card tone and benefit framing.'}
                            </p>

                            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-primary/10 bg-background-light px-4 py-3">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <LocalOfferRoundedIcon className="!text-lg" />
                                    <span className="text-sm font-semibold">List price</span>
                                </div>
                                <span className="text-lg font-black text-text-main">
                                    {form.price ? formatCurrency(form.price) : formatCurrency(0)}
                                </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[24px] border border-primary/10 bg-white p-4">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <ColorLensRoundedIcon className="!text-lg" />
                                        <span className="text-xs font-black uppercase tracking-[0.16em]">Color</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-text-main">{normalizedColors.length}</p>
                                </div>
                                <div className="rounded-[24px] border border-primary/10 bg-white p-4">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <StraightenRoundedIcon className="!text-lg" />
                                        <span className="text-xs font-black uppercase tracking-[0.16em]">Size</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-text-main">{normalizedSizes.length}</p>
                                </div>
                                <div className="rounded-[24px] border border-primary/10 bg-white p-4">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <AutoAwesomeRoundedIcon className="!text-lg" />
                                        <span className="text-xs font-black uppercase tracking-[0.16em]">Detail</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-text-main">{detailSectionCount}</p>
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
                                    Active Variations
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {normalizedVariants.map((variant) => (
                                        <span
                                            key={variant.sku}
                                            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/10 px-3 py-1.5 text-xs font-bold text-text-main"
                                        >
                                            {variant.sku}
                                        </span>
                                    ))}
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
                                    {normalizedColors.length === 0 && normalizedSizes.length === 0 && normalizedVariants.length === 0 ? (
                                        <p className="text-sm font-medium text-text-muted">
                                            No variations defined yet.
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </SurfaceCard>

                    <SurfaceCard className="p-6">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">
                            Edit Notes
                        </p>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">The existing image is preserved</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    If you do not choose a new file, the current cover image is automatically reused on save.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Products in inactive categories can still be edited</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    If the product is currently tied to an inactive category, the current assignment stays in the form and you can move it to an active path if needed.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-primary/10 bg-background-light p-4">
                                <p className="text-sm font-black text-text-main">Deletion cannot be undone</p>
                                <p className="mt-2 text-sm leading-6 text-text-muted">
                                    When the product is deleted, the catalog record is removed permanently and the flow returns to the list screen.
                                </p>
                            </div>
                        </div>
                    </SurfaceCard>
                </aside>
            </div>

            <ProductDeleteDialog
                open={deleteDialogOpen}
                productTitle={form.title.trim() || 'Product'}
                loading={deleting}
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
            />

            <ColorForm
                open={colorFormOpen}
                mode="create"
                initialValues={null}
                submitting={colorFormSubmitting}
                onClose={closeColorCreateModal}
                onSubmit={handleCreateColor}
            />
        </form>
    );
}
