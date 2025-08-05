export function flattenProducts(data) {
    const product = [];
    data.categories.forEach(category => {
        category.children.forEach(item => {
            item.products.forEach(productItem => {
                product.push({
                    ...productItem,
                    id: productItem.id,
                    code: productItem.sku,
                    title: productItem.title,
                    description: productItem.description,
                    price: productItem.price,
                    image: productItem.image
                })
            })
        })
    })
    return product;
}