CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_colors_name_code_unique
ON colors (LOWER(name), code);

CREATE TABLE IF NOT EXISTS sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sizes_name_unique
ON sizes (LOWER(name));

CREATE TABLE IF NOT EXISTS product_details (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_details_product_order
ON product_details (product_id, section, display_order, id);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS colors_id INT[] NOT NULL DEFAULT ARRAY[]::INT[],
ADD COLUMN IF NOT EXISTS sizes_id INT[] NOT NULL DEFAULT ARRAY[]::INT[];

ALTER TABLE products
ALTER COLUMN colors_id TYPE INT[]
USING CASE
    WHEN colors_id IS NULL THEN ARRAY[]::INT[]
    ELSE ARRAY[colors_id]
END;

ALTER TABLE products
ALTER COLUMN sizes_id TYPE INT[]
USING CASE
    WHEN sizes_id IS NULL THEN ARRAY[]::INT[]
    ELSE ARRAY[sizes_id]
END;

CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    color_id INT,
    size_id INT,
    sku VARCHAR(200) NOT NULL,
    price DECIMAL(10,2),
    stock INT NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS color_id INT,
ADD COLUMN IF NOT EXISTS size_id INT;

DROP INDEX IF EXISTS idx_product_variants_combination_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku_unique
ON product_variants (sku);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'cart_items'
    ) THEN
        ALTER TABLE cart_items
        ADD COLUMN IF NOT EXISTS variant_id INT;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items
        ADD COLUMN IF NOT EXISTS variant_id INT;
    END IF;
END $$;

ALTER TABLE products
DROP COLUMN IF EXISTS colors,
DROP COLUMN IF EXISTS sizes,
DROP COLUMN IF EXISTS details,
DROP COLUMN IF EXISTS color_group_id,
DROP COLUMN IF EXISTS size_group_id,
DROP COLUMN IF EXISTS detail_id;

ALTER TABLE product_variants
DROP COLUMN IF EXISTS color_name,
DROP COLUMN IF EXISTS color_hex,
DROP COLUMN IF EXISTS size_label;

DROP TABLE IF EXISTS details;
DROP TABLE IF EXISTS product_colors;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS product_color_groups;
DROP TABLE IF EXISTS product_size_groups;
