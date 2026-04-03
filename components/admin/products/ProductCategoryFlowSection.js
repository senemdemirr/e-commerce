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
    onCategoryChange,
    onSubcategoryChange,
}) {
    return (
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
                                value={categoryId}
                                onChange={onCategoryChange}
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
                                value={subcategoryId}
                                onChange={onSubcategoryChange}
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
    );
}
