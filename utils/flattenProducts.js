export function flattenProducts(data) {
    const product = [];
    data.categories.forEach((category) => {
        category.children.forEach((item) => {
            item.products.forEach((productItem) => {
                product.push( productItem) 
                // here we are pushing the productItem into the product array(without changing productItem)
                // if I use spread operator here, it will not work because when I use spread operator data will be an independent object
                // the function of the spread operator is to copy the properties of an object into another object
                // so if I use spread operator, the code should be updated like this( product.push({...productItem})
            })
        })
    })
    console.log("flattened products", product);
    return product;
}