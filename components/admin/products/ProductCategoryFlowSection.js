import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { Chip } from '@mui/material';
import {
    Field,
    SectionIntro,
    Select,
    SurfaceCard,
} from './ProductFormPrimitives';

export default function ProductCategoryFlowSection({
    loadError,
    categories,
    selectedCategory,
    selectedSubcategory,
    availableSubcategories,
    errors,
    categoryId,
    subcategoryId,
    disabled = false,
    onCategoryChange,
    onSubcategoryChange,
}) {
    return (
        <SurfaceCard className="p-6 sm:p-8">
            <SectionIntro
                eyebrow="Placement"
                title="Choose the category path"
                description="Lock the top-level category first, then place the product in the right subcategory. The public path on the right updates instantly."
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
                            label="Category"
                            hint={`${categories.length} active categories`}
                        >
                            <Select
                                value={categoryId}
                                onChange={onCategoryChange}
                                disabled={disabled || categories.length === 0}
                            >
                                <option value="">Select an active category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field
                            label="Subcategory"
                            hint={`${availableSubcategories.length} active subcategories`}
                            error={errors.subcategoryId}
                        >
                            <Select
                                value={subcategoryId}
                                onChange={onSubcategoryChange}
                                disabled={disabled || !selectedCategory || availableSubcategories.length === 0}
                            >
                                <option value="">
                                    {selectedCategory
                                        ? 'Select an active subcategory'
                                        : 'Select a category first'}
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
                            Current Selection
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Chip
                                label={selectedCategory?.name || 'No category selected'}
                                className="!rounded-full !bg-primary/10 !font-semibold !text-primary-dark"
                            />
                            <Chip
                                label={selectedSubcategory?.name || 'No subcategory selected'}
                                className="!rounded-full !bg-white !font-semibold !text-text-main"
                            />
                        </div>
                        <p className="mt-4 text-sm leading-6 text-text-muted">
                            Only categories and subcategories marked as `active` appear in these dropdown lists.
                        </p>
                    </div>
                </>
            )}
        </SurfaceCard>
    );
}
