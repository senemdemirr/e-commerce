export function flattenProducts(data) {
    const product = [];
    data.categories.forEach((category) => {
        const catSlug = category.slug;
        const catName = category.name;
        category.children.forEach((item) => {
            const subCatSlug = item.slug;
            const subCatName = item.name;
            
            item.products.forEach((productItem) => {
                product.push( {
                    ...productItem,
                    categorySlug : catSlug,
                    categoryName : catName,
                    subCategorySlug : subCatSlug,
                    subCategoryName : subCatName
                }) 
                // The spread operator is used to create a shallow copy of the productItem object.
                // The spread operator was used because it is more powerful.
            })
        })
    })
    return product;
}