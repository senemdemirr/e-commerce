CREATE TABLE categories(
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    auth0_id VARCHAR(200) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sub_categories(
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subcategory_category 
        FOREIGN KEY(category_id) 
        REFERENCES categories(id) 
        ON DELETE CASCADE
);
CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    sub_category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500) NOT NULL,
    sku TEXT UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    brand VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_subcategory 
        FOREIGN KEY(sub_category_id) 
        REFERENCES sub_categories(id) 
        ON DELETE CASCADE
);
CREATE TABLE FAVORITES(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorite_user 
        FOREIGN KEY(user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE, 
    CONSTRAINT fk_favorite_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_favorite UNIQUE (user_id, product_id)
);

-- ON DELETE CASCADES = This sql was added so that if a category is deleted, all subcategories attached to it will be deleted.
-- CONSTRAINT FOREIGN KEY REFERENCES = This sql shows that id is an existing id in another table. This means it is not a separate number and an irrelevant value cannot be entered.
