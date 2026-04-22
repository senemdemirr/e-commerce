BEGIN;

CREATE TABLE IF NOT EXISTS product_details (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'detail_id'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'details'
    ) THEN
        INSERT INTO product_details (product_id, section, value, display_order)
        SELECT
            product_rows.product_id,
            detail_rows.detail_key,
            detail_rows.detail_value,
            COALESCE(detail_rows.display_order, product_rows.detail_order - 1)
        FROM (
            SELECT
                p.id AS product_id,
                ref.detail_id,
                ref.detail_order
            FROM products p
            CROSS JOIN LATERAL unnest(COALESCE(p.detail_id, ARRAY[]::INT[]))
                WITH ORDINALITY AS ref(detail_id, detail_order)
        ) AS product_rows
        INNER JOIN details AS detail_rows
            ON detail_rows.id = product_rows.detail_id
        WHERE TRIM(COALESCE(detail_rows.detail_value, '')) <> ''
          AND NOT EXISTS (
              SELECT 1
              FROM product_details pd
              WHERE pd.product_id = product_rows.product_id
          )
        ORDER BY
            product_rows.product_id,
            product_rows.detail_order,
            detail_rows.display_order,
            detail_rows.id;
    END IF;
END $$;

ALTER TABLE products
DROP COLUMN IF EXISTS detail_id;

DROP TABLE IF EXISTS details;

CREATE INDEX IF NOT EXISTS idx_product_details_product_order
ON product_details (product_id, section, display_order, id);

COMMIT;
