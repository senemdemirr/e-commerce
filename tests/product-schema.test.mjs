import { buildBackfillVariants } from '../lib/productSchema.js';

test('buildBackfillVariants creates a full color-size matrix for legacy products', () => {
  const variants = buildBackfillVariants(
    { id: 18, sku: 'sports-tshirt-001', price: 249.9 },
    [
      { id: 6, name: 'Metallic Gold' },
      { id: 8, name: 'Matte Black' },
    ],
    [
      { id: 2, name: 'S' },
      { id: 3, name: 'M' },
    ],
  );

  expect(variants).toEqual([
    {
      product_id: 18,
      color_id: 6,
      size_id: 2,
      sku: 'SPORTS-TSHIRT-001-METALLIC-GOLD-S',
      price: 249.9,
      stock: 0,
      is_default: true,
      display_order: 0,
    },
    {
      product_id: 18,
      color_id: 6,
      size_id: 3,
      sku: 'SPORTS-TSHIRT-001-METALLIC-GOLD-M',
      price: 249.9,
      stock: 0,
      is_default: false,
      display_order: 1,
    },
    {
      product_id: 18,
      color_id: 8,
      size_id: 2,
      sku: 'SPORTS-TSHIRT-001-MATTE-BLACK-S',
      price: 249.9,
      stock: 0,
      is_default: false,
      display_order: 2,
    },
    {
      product_id: 18,
      color_id: 8,
      size_id: 3,
      sku: 'SPORTS-TSHIRT-001-MATTE-BLACK-M',
      price: 249.9,
      stock: 0,
      is_default: false,
      display_order: 3,
    },
  ]);
});

test('buildBackfillVariants falls back to a single base variant when no option refs exist', () => {
  const variants = buildBackfillVariants({ id: 99, sku: 'özel ürün', price: '1000.90' });

  expect(variants).toEqual([
    {
      product_id: 99,
      color_id: null,
      size_id: null,
      sku: 'OZEL-URUN',
      price: 1000.9,
      stock: 0,
      is_default: true,
      display_order: 0,
    },
  ]);
});
