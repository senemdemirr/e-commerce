import { InputBase, Paper } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ProductsFilterMenuButton from './ProductsFilterMenuButton';

export default function ProductsFiltersPanel({
    searchInput,
    onSearchChange,
    selectedCategoryLabel,
    categoryOptions,
    categoryFilter,
    selectedSubcategoryLabel,
    subcategoryOptions,
    subcategoryFilter,
    selectedPriceLabel,
    priceOptions,
    priceFilter,
    selectedSortLabel,
    sortOptions,
    sortBy,
    menuState,
    onOpenMenu,
    onCloseMenu,
    onCategoryChange,
    onSubcategoryChange,
    onPriceChange,
    onSortChange}) {
    return (
        <div className="border-b border-primary/10 p-4 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <Paper className="flex w-full items-center gap-3 !rounded-2xl !border !border-primary/10 !bg-background-light !px-4 !py-3 !shadow-none xl:max-w-md">
                    <SearchRoundedIcon className="text-text-muted" />
                    <InputBase
                        value={searchInput}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search product name, SKU, brand, or category..."
                        className="w-full text-sm text-text-main"
                        inputProps={{ 'aria-label': 'Search products' }}
                    />
                </Paper>

                <div className="flex flex-wrap gap-3">
                    <ProductsFilterMenuButton
                        label="Category"
                        valueLabel={selectedCategoryLabel}
                        options={categoryOptions.map((option) => ({
                            ...option,
                            selected: option.value === categoryFilter,
                        }))}
                        anchorEl={menuState.anchorEl}
                        open={menuState.key === 'category'}
                        onOpen={(event) => onOpenMenu('category', event)}
                        onClose={onCloseMenu}
                        onSelect={onCategoryChange}
                    />

                    <ProductsFilterMenuButton
                        label="Subcategory"
                        valueLabel={selectedSubcategoryLabel}
                        options={subcategoryOptions.map((option) => ({
                            ...option,
                            selected: option.value === subcategoryFilter,
                        }))}
                        anchorEl={menuState.anchorEl}
                        open={menuState.key === 'subcategory'}
                        onOpen={(event) => onOpenMenu('subcategory', event)}
                        onClose={onCloseMenu}
                        onSelect={onSubcategoryChange}
                    />

                    <ProductsFilterMenuButton
                        label="Price"
                        valueLabel={selectedPriceLabel}
                        options={priceOptions.map((option) => ({
                            ...option,
                            selected: option.value === priceFilter,
                        }))}
                        anchorEl={menuState.anchorEl}
                        open={menuState.key === 'price'}
                        onOpen={(event) => onOpenMenu('price', event)}
                        onClose={onCloseMenu}
                        onSelect={onPriceChange}
                    />

                    <ProductsFilterMenuButton
                        label="Sort"
                        valueLabel={selectedSortLabel}
                        options={sortOptions.map((option) => ({
                            ...option,
                            selected: option.value === sortBy,
                        }))}
                        anchorEl={menuState.anchorEl}
                        open={menuState.key === 'sort'}
                        onOpen={(event) => onOpenMenu('sort', event)}
                        onClose={onCloseMenu}
                        onSelect={onSortChange}
                    />
                </div>
            </div>
        </div>
    );
}
