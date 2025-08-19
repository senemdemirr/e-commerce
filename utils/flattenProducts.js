export function flattenProducts(data) {
    const product = [];
    data.categories.forEach((category) => {
        category.children.forEach((item) => {
            item.products.forEach((productItem) => {
                product.push( {...productItem}) 
                // The spread operator is used to create a shallow copy of the productItem object.
                // The spread operator was used because it is more powerful.
            })
        })
    })
    console.log("flattened products", product);
    return product;
}