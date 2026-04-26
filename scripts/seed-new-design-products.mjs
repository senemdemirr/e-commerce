import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function parseEnvFile(content) {
  const env = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function loadEnvironment(target = "development") {
  const fileName =
    target === "production" ? ".env.production.local" : ".env.development.local";
  const content = await fs.readFile(path.join(projectRoot, fileName), "utf8");
  const parsed = parseEnvFile(content);

  Object.entries(parsed).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

const categories = {
  homeLiving: {
    name: "Home & Living",
    slug: "home-living",
  },
  beautyWellness: {
    name: "Beauty & Wellness",
    slug: "beauty-wellness",
  },
  electronics: {
    name: "Electronics",
    slug: "electronics",
  },
  sports: {
    name: "Sports",
    slug: "sports",
  },
  accessories: {
    name: "Accessories",
    slug: "accessories",
  },
};

const products = [
  {
    title: "Essential Linen Set",
    sku: "NEW-LINEN-SET-001",
    price: 189,
    brand: "LinenHouse",
    category: categories.homeLiving,
    subcategory: { name: "Home Textiles", slug: "home-textiles" },
    image: "/img/products/new-essential-linen-set.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Mj81dgWFUEJ7P8m267n_RYAVgLJRPSBniVJzHpVBcwVG1jO9lJ6tHTAlQNaq63ufjdtZ_uEU-D2WSNMrDJGF2-rfwxK3X3PHaQwhng-g6buN04_sAqOp8tgfmyqxvXz45KA3aTmTqbY7KKki5xC7MAju72N3OmDnXgFBRCmootWuGnyNCCGph0DnIzHfTlQU1hslwPazBlw91R-1RPOxFSy0ii30BM5lx72SiFaxeaepiOqOVfQjUF8VrgOMOjVemKHRj06DFr4",
    description: "100% Organic certified Belgian linen.",
    colors: [
      { name: "Natural Linen", hex: "#d8c8b8" },
      { name: "Cloud White", hex: "#f9fafb" },
      { name: "Mist Green", hex: "#8dc8a1" },
    ],
    sizes: ["Standard"],
    details: {
      material: ["100% Organic certified Belgian linen"],
      care: ["Machine wash cold", "Tumble dry low", "Iron low heat"],
      bullet_point: ["Organic Belgian linen", "Breathable texture", "New product"],
      description_long: [
        "A soft linen set designed for calm, modern interiors and everyday comfort.",
      ],
    },
  },
  {
    title: "Artisan Ceramic Vase",
    sku: "NEW-CERAMIC-VASE-001",
    price: 45,
    brand: "TerraCraft",
    category: categories.homeLiving,
    subcategory: { name: "Home Decor", slug: "home-decor" },
    image: "/img/products/new-artisan-ceramic-vase.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7RUBe_VNE5wNC2Qkr1YXZ5oHHGbw9ai5BBST3kVPQOyTFmGOZS5BJIs4Xw2HL9e60atb17pXMKdY0_aXLailt60JlgfqLmJ28GeeDUSdU-buClKWF28_4pSk6EDF0dK4MlAKZ4N32IORX2P1bmoTa0XeDjwCQcIuG6jEIRN4_TOJ_rmzMkEbmf9uTPqc0Wat8KyQoJJegXxhso6okTnVxKKd5qwd8618XHFoI5wE_jr1XZcZ686zCACMmyMQY9V0mBZv1KpZdkfQ",
    description: "Minimalist ceramic vase with a handmade finish.",
    colors: [
      { name: "Warm Ivory", hex: "#f5f1e8" },
      { name: "Soft Sage", hex: "#a0c8a0" },
    ],
    sizes: ["Standard"],
    details: {
      material: ["Hand-finished ceramic"],
      care: ["Wipe with a soft dry cloth", "Avoid abrasive cleaners"],
      bullet_point: ["Handmade look", "Minimal silhouette", "New product"],
      description_long: [
        "A sculptural vase made to anchor shelves, consoles and dining tables.",
      ],
    },
  },
  {
    title: "Botanical Glow Oil",
    sku: "NEW-GLOW-OIL-001",
    price: 64,
    brand: "Botanica",
    category: categories.beautyWellness,
    subcategory: { name: "Skincare", slug: "skincare" },
    image: "/img/products/new-botanical-glow-oil.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZj_5ehhu4F7Gzegi7thg1xcfuP6eLGrUMgv30tUPqOr_4n-G_SvGAnmssLNyw2J6Ts9WKzx3pN0QULkQf9_yJNL4Ik02JJAssfN1B8LDkw_Di9wYnxmbPg7F9K4UzWTPcfm0eIE88kqciiATrWXG5iinrR_p_lN5ZKhReNwNGy4yYdRT7ixrYoXtrIxmaF7fCKnTm4ZqzcRYunai9caxIh-LZ_E3bB8jJiqQEfj0tRAyoVDbNyE2dxMs8JDDXQzIR1F8KtTIJBqE",
    description: "Botanical facial oil for a fresh natural glow.",
    colors: [
      { name: "Green Glass", hex: "#2f6b4f" },
      { name: "Amber Drop", hex: "#f0b48c" },
    ],
    sizes: ["30 ml"],
    details: {
      material: ["Botanical extract blend"],
      care: ["Store away from direct sunlight", "Use after cleansing"],
      bullet_point: ["Lightweight formula", "Botanical extracts", "New product"],
      description_long: [
        "A daily facial oil formulated for soft radiance and a smooth finish.",
      ],
    },
  },
  {
    title: "PureSound Headset",
    sku: "NEW-PURESOUND-HEADSET-001",
    price: 299,
    brand: "PureSound",
    category: categories.electronics,
    subcategory: { name: "Audio", slug: "audio" },
    image: "/img/products/new-puresound-headset.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj25OBnz7SUtB3-IMlA_jSuJjR2xFcL8wGMm_ENAoDe-uyyJFgAD9aGRekXDx7lhyGYyc5k8J7sMQUwGchsjC0nwoAaifPWZySDM5VO2ufZnatNhrkKdvH9sKflcTzJ3z3O5_4rhpQVnFiRXsCZgUgK8S-yzuM7kf4-1BwP_WoPbzRY5JZL1uKzk_jnxxnxLWvWZnQpon91aOV0eTl07jONl7CaS63pPx2AKmdEOxCsE-_yK-BUMNN_JaOW-Bs5-y5nChnsNENZ-w",
    description: "Wireless headset with a clean sand-toned finish.",
    colors: [
      { name: "Sand", hex: "#d8c8b8" },
      { name: "Matte Black", hex: "#282828" },
    ],
    sizes: ["Standard"],
    details: {
      material: ["Wireless audio components", "Soft-touch finish"],
      care: ["Keep dry", "Clean with a microfiber cloth"],
      bullet_point: ["Wireless design", "Soft ear cushions", "New product"],
      description_long: [
        "A lightweight headset built for daily listening, meetings and travel.",
      ],
    },
  },
  {
    title: "Cloud Runner Eco",
    sku: "NEW-CLOUD-RUNNER-ECO-001",
    price: 120,
    brand: "EcoStride",
    category: categories.sports,
    subcategory: { name: "Footwear", slug: "footwear" },
    image: "/img/products/new-cloud-runner-eco.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCDGpMmEsSPiv103g_DxngcrhZAj4BrdTo5BuVRv12sF7S0hxtKNthDkFZGOQYRZVGOitnOGp_D-EL0Bwk-a6A5dCgszscSHdcpJVFbGXHWQFXPfCDFnoyb4YhNmen-7SSI72kX7jAC3ML6MrGvSOGr-tIkx7oYKxl5WhVs3DyLMbBYwmabdB_pnkr2SASuLG0Jf5ps341iR_oBGbZAMOwzeK60guaJm9QEu05oMgybIibdmA6guTw83pgeqnHkASEKj2hBoZJRJaY",
    description: "Minimalist sneaker made from sustainable leather alternatives.",
    colors: [
      { name: "Cloud White", hex: "#f9fafb" },
      { name: "Stone Grey", hex: "#d1d5db" },
    ],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    details: {
      material: ["Sustainable leather alternative", "Recycled rubber sole"],
      care: ["Wipe clean", "Air dry naturally"],
      bullet_point: ["Lightweight sole", "Eco-minded materials", "New product"],
      description_long: [
        "A versatile everyday sneaker with clean lines and comfortable support.",
      ],
    },
  },
  {
    title: "Luxury Soap Duo",
    sku: "NEW-LUXURY-SOAP-DUO-001",
    price: 48,
    brand: "PureBath",
    category: categories.beautyWellness,
    subcategory: { name: "Bath & Body", slug: "bath-body" },
    image: "/img/products/new-luxury-soap-duo.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6YQXjYmKZ9WoPzcK7nQDvWkuTntrx-2YNVTfQI9TuAyLjixvqxyj3Ib6yKr1rrc31ICz2oTUu1FBNTDkl7A7Wy3a09VAURWV0FUgjWKNb0vCKj3wkrLndGqlCbtdHrP5q90dJYqrSCoeT2kpeOZng_2cboszj-t4MO_RTjDZcDhXB5USXKiUOY7pr6MdCV1Tb91P78_hDShaPb_3NkMLluOwBf9AsLv_mM6r_zClTQPra8VSyxTbpgHxo6vH2Sc72B-0LTzuK5cg",
    description: "A refined soap duo for everyday hand and body care.",
    colors: [
      { name: "Clean White", hex: "#ffffff" },
      { name: "Stone", hex: "#d1d5db" },
    ],
    sizes: ["Duo"],
    details: {
      material: ["Plant-based cleansing blend"],
      care: ["Keep bottles closed", "Store at room temperature"],
      bullet_point: ["Refill-friendly set", "Soft scent", "New product"],
      description_long: [
        "A polished bathroom essential designed for a calm daily routine.",
      ],
    },
  },
  {
    title: "Performance Trainers",
    sku: "NEW-PERFORMANCE-TRAINERS-001",
    price: 155,
    brand: "RunForm",
    category: categories.sports,
    subcategory: { name: "Footwear", slug: "footwear" },
    image: "/img/products/new-performance-trainers.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuATF5uhC4VX5S5-eWdfSMaVo0_FJ178Qy_jUB-EBWiBESdbv7ljStKEE53os6BxQPx6VTVimtPuAALRxYe0NW3CxWhNsIwsjAoJBXjl3WL9cRua8sjQFE7sTkEUrE96kQJFKige3UY1m7okp9ZsrNqsJiu_vyOwKKXg5DSPV6i9PWLfY8dFFILb_xOP1BB7dTXZ89h63JZRPmQCZGSX-MCk73a6c89QtA7R6IU3u-qrpY1ceF95Snq3S6fX2Of-9sEiKP8FuEHwfYA",
    description: "Vibrant trainers built for active days.",
    colors: [
      { name: "Signal Red", hex: "#c62828" },
      { name: "Graphite", hex: "#374151" },
    ],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    details: {
      material: ["Breathable textile upper", "Rubber traction sole"],
      care: ["Brush off dry dirt", "Spot clean only"],
      bullet_point: ["Responsive cushioning", "Athletic profile", "New product"],
      description_long: [
        "A bold training shoe made for movement, comfort and everyday energy.",
      ],
    },
  },
  {
    title: "Heritage Wristwatch",
    sku: "NEW-HERITAGE-WRISTWATCH-001",
    price: 210,
    brand: "Heritage Time",
    category: categories.accessories,
    subcategory: { name: "Watches", slug: "watches" },
    image: "/img/products/new-heritage-wristwatch.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDX_BfPBGMKWYGPCbebD1l4kJb6uIwHXUK6YMeCls2xxgTVGnncgSkZKq4c6knvN9LRdhPPxRNpSI4vJXTP4I6aO0fR2K6DaviiL4nqdnho11X1kv3PQqWuxpcw6qC0tEo9V2z4Al_hdlhuqPrsc2y8yIJ3amdB7CjYpyi1WhaPzh4ec7pm8otWzVy1c4BssNlUPWtXK4nhav-n7x-lmXRVPWkMk3YJzgqVIY1b74aNeBbrHWDvJH2i6W8kSXtIzoeduAEIbonBnCQ",
    description: "Minimalist watch with a timeless leather strap.",
    colors: [
      { name: "Cognac Leather", hex: "#8b5a2b" },
      { name: "Silver", hex: "#c0c0c0" },
    ],
    sizes: ["Standard"],
    details: {
      material: ["Leather strap", "Stainless steel case"],
      care: ["Keep away from water", "Clean with a dry cloth"],
      bullet_point: ["Minimal dial", "Leather strap", "New product"],
      description_long: [
        "A refined wristwatch with clean proportions and everyday versatility.",
      ],
    },
  },
  {
    title: "Sienna Sunglasses",
    sku: "NEW-SIENNA-SUNGLASSES-001",
    price: 89,
    brand: "Sienna",
    category: categories.accessories,
    subcategory: { name: "Sunglasses", slug: "sunglasses" },
    image: "/img/products/new-sienna-sunglasses.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCTuWrZqULJgGlZy_7HhI9MVbHzdUje1c5OLEuE-wehUXAp1udV6xD3N8jL-KQrtBFcmL7OyL7CplkfnIM0uAnORXteEqjfMqJMRDsE6Z9MU3_kOiGhry09tLaMHXSYvpN8qKjZvXzxTs_Xwvf2Hj4C9XfKCfNWZ7s-PCcS7ppZeFh_1HB0Z4bGea9pUhFkR7sCS3hPjnFfKF_Y0g5rZyiMbux8HN43C-kJWwfII--972xCFh3XsDc29V2vkdJUBmjpnhEJ2Mqwsac",
    description: "Chic sunglasses with amber frames and dark lenses.",
    colors: [
      { name: "Amber", hex: "#c47f48" },
      { name: "Smoke Lens", hex: "#374151" },
    ],
    sizes: ["Standard"],
    details: {
      material: ["Acetate frame", "Tinted lenses"],
      care: ["Store in case", "Clean lenses with microfiber cloth"],
      bullet_point: ["Amber frame", "Dark lenses", "New product"],
      description_long: [
        "Statement sunglasses designed to finish warm-weather looks with ease.",
      ],
    },
  },
  {
    title: "Geo Table Lamp",
    sku: "NEW-GEO-TABLE-LAMP-001",
    price: 135,
    brand: "GeoLight",
    category: categories.homeLiving,
    subcategory: { name: "Lighting", slug: "lighting" },
    image: "/img/products/new-geo-table-lamp.png",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCg9ciVGkzfAe2sArLR83UHtgn35CiCwr0thv5ZfcLSi9nePGe77XTNlo9444dbYEPwNteUERRiF8ZTILGsMqVcjN4BVbCAIlS5ZwfUbkwaup3IycDS3K4xkAKk8ARhwcRYCtncGTuy-5lyFMnlDIfSyl-y-e_ISGleZPtEWCOo-U8MiyFaycJwJzCpI4eA8x5Pq9-wr1spSRslIwhpOvQRTKgPpyRjfhgQFYHck7z3LIrjASshHmv6eM3iBF7klTQ1UlV9a6msOk",
    description: "Modern table lamp with a geometric brass base.",
    colors: [
      { name: "Brass", hex: "#b08d57" },
      { name: "Warm White", hex: "#f5f1e8" },
    ],
    sizes: ["Standard"],
    details: {
      material: ["Brass-finish base", "Fabric shade"],
      care: ["Dust regularly", "Use with recommended bulb only"],
      bullet_point: ["Geometric base", "Warm ambient light", "New product"],
      description_long: [
        "A compact lamp that adds soft lighting and sculptural form to side tables.",
      ],
    },
  },
];

function normalizeLookupKey(value) {
  return String(value || "").trim().toLocaleLowerCase("tr-TR");
}

async function ensureImage(product) {
  const imagePath = path.join(projectRoot, "public", product.image.replace(/^\//, ""));

  try {
    await fs.access(imagePath);
    return;
  } catch {
    // Download below.
  }

  const response = await fetch(product.imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image for ${product.title}: ${response.status}`);
  }

  await fs.mkdir(path.dirname(imagePath), { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(imagePath, buffer);
}

async function hasColumn(client, tableName, columnName) {
  const result = await client.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [tableName, columnName]
  );
  return result.rowCount > 0;
}

async function ensureCategory(client, category) {
  const hasActivate = await hasColumn(client, "categories", "activate");
  const existing = await client.query(
    "SELECT id FROM categories WHERE slug = $1 LIMIT 1",
    [category.slug]
  );

  if (existing.rowCount > 0) {
    const categoryId = Number(existing.rows[0].id);

    if (hasActivate) {
      await client.query(
        "UPDATE categories SET name = $1, activate = 1 WHERE id = $2",
        [category.name, categoryId]
      );
    } else {
      await client.query("UPDATE categories SET name = $1 WHERE id = $2", [
        category.name,
        categoryId,
      ]);
    }

    return categoryId;
  }

  const result = hasActivate
    ? await client.query(
        "INSERT INTO categories (name, slug, activate) VALUES ($1, $2, 1) RETURNING id",
        [category.name, category.slug]
      )
    : await client.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
        [category.name, category.slug]
      );

  return Number(result.rows[0].id);
}

async function ensureSubcategory(client, categoryId, subcategory) {
  const hasActivate = await hasColumn(client, "sub_categories", "activate");
  const existing = await client.query(
    `
      SELECT id
      FROM sub_categories
      WHERE category_id = $1
        AND slug = $2
      LIMIT 1
    `,
    [categoryId, subcategory.slug]
  );

  if (existing.rowCount > 0) {
    const subcategoryId = Number(existing.rows[0].id);

    if (hasActivate) {
      await client.query(
        "UPDATE sub_categories SET name = $1, activate = 1 WHERE id = $2",
        [subcategory.name, subcategoryId]
      );
    } else {
      await client.query("UPDATE sub_categories SET name = $1 WHERE id = $2", [
        subcategory.name,
        subcategoryId,
      ]);
    }

    return subcategoryId;
  }

  const result = hasActivate
    ? await client.query(
        `
          INSERT INTO sub_categories (category_id, name, slug, activate)
          VALUES ($1, $2, $3, 1)
          RETURNING id
        `,
        [categoryId, subcategory.name, subcategory.slug]
      )
    : await client.query(
        `
          INSERT INTO sub_categories (category_id, name, slug)
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [categoryId, subcategory.name, subcategory.slug]
      );

  return Number(result.rows[0].id);
}

async function findOrCreateColorId(client, color) {
  const existing = await client.query(
    `
      SELECT id
      FROM colors
      WHERE LOWER(name) = LOWER($1)
        AND code = $2
      LIMIT 1
    `,
    [color.name, color.hex]
  );

  if (existing.rowCount > 0) {
    return Number(existing.rows[0].id);
  }

  const created = await client.query(
    "INSERT INTO colors (name, code) VALUES ($1, $2) RETURNING id",
    [color.name, color.hex]
  );

  return Number(created.rows[0].id);
}

async function findOrCreateSizeId(client, size) {
  const existing = await client.query(
    "SELECT id FROM sizes WHERE LOWER(name) = LOWER($1) LIMIT 1",
    [size]
  );

  if (existing.rowCount > 0) {
    return Number(existing.rows[0].id);
  }

  const created = await client.query(
    "INSERT INTO sizes (name) VALUES ($1) RETURNING id",
    [size]
  );

  return Number(created.rows[0].id);
}

async function prepareRelations(client, product) {
  const colorsId = [];
  const colorIdMap = new Map();
  const sizesId = [];
  const sizeIdMap = new Map();

  for (const color of product.colors) {
    const id = await findOrCreateColorId(client, color);
    colorsId.push(id);
    colorIdMap.set(normalizeLookupKey(color.name), id);
  }

  for (const size of product.sizes) {
    const id = await findOrCreateSizeId(client, size);
    sizesId.push(id);
    sizeIdMap.set(normalizeLookupKey(size), id);
  }

  return { colorsId, colorIdMap, sizesId, sizeIdMap };
}

async function replaceDetails(client, productId, details) {
  await client.query("DELETE FROM product_details WHERE product_id = $1", [productId]);

  const rows = [
    ...(details.material || []).map((value, index) => ({
      section: "material",
      value,
      displayOrder: index,
    })),
    ...(details.care || []).map((value, index) => ({
      section: "care",
      value,
      displayOrder: index,
    })),
    ...(details.bullet_point || []).map((value, index) => ({
      section: "bullet_point",
      value,
      displayOrder: index,
    })),
    ...(details.description_long || []).map((value, index) => ({
      section: "description_long",
      value,
      displayOrder: index,
    })),
  ];

  for (const row of rows) {
    await client.query(
      `
        INSERT INTO product_details (product_id, section, value, display_order)
        VALUES ($1, $2, $3, $4)
      `,
      [productId, row.section, row.value, row.displayOrder]
    );
  }
}

function buildVariants(product) {
  const firstColor = product.colors[0] || null;
  const firstSize = product.sizes[0] || null;

  return [
    {
      sku: `${product.sku}-DEFAULT`,
      price: product.price,
      stock: 20,
      isDefault: true,
      colorName: firstColor?.name || "",
      sizeLabel: firstSize || "",
    },
  ];
}

async function replaceVariants(client, productId, product, relationState) {
  await client.query("DELETE FROM product_variants WHERE product_id = $1", [productId]);

  for (const [index, variant] of buildVariants(product).entries()) {
    const colorId = variant.colorName
      ? relationState.colorIdMap.get(normalizeLookupKey(variant.colorName)) || null
      : null;
    const sizeId = variant.sizeLabel
      ? relationState.sizeIdMap.get(normalizeLookupKey(variant.sizeLabel)) || null
      : null;

    await client.query(
      `
        INSERT INTO product_variants (
          product_id,
          color_id,
          size_id,
          sku,
          price,
          stock,
          is_default,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        productId,
        colorId,
        sizeId,
        variant.sku,
        variant.price,
        variant.stock,
        variant.isDefault,
        index,
      ]
    );
  }
}

async function upsertProduct(client, categoryId, product) {
  await ensureImage(product);
  const subcategoryId = await ensureSubcategory(client, categoryId, product.subcategory);
  const relationState = await prepareRelations(client, product);

  const existing = await client.query(
    "SELECT id FROM products WHERE sku = $1 LIMIT 1",
    [product.sku]
  );

  let productId;

  if (existing.rowCount > 0) {
    productId = Number(existing.rows[0].id);
    await client.query(
      `
        UPDATE products
        SET
          sub_category_id = $1,
          title = $2,
          description = $3,
          price = $4,
          image = $5,
          brand = $6,
          colors_id = $7,
          sizes_id = $8
        WHERE id = $9
      `,
      [
        subcategoryId,
        product.title,
        product.description,
        product.price,
        product.image,
        product.brand,
        relationState.colorsId,
        relationState.sizesId,
        productId,
      ]
    );
  } else {
    const created = await client.query(
      `
        INSERT INTO products (
          sub_category_id,
          title,
          description,
          sku,
          price,
          image,
          brand,
          colors_id,
          sizes_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `,
      [
        subcategoryId,
        product.title,
        product.description,
        product.sku,
        product.price,
        product.image,
        product.brand,
        relationState.colorsId,
        relationState.sizesId,
      ]
    );
    productId = Number(created.rows[0].id);
  }

  await replaceDetails(client, productId, product.details);
  await replaceVariants(client, productId, product, relationState);

  return productId;
}

async function deleteLegacyNewProductsCategory(client) {
  const legacy = await client.query(
    "SELECT id FROM categories WHERE slug = $1 LIMIT 1",
    ["new-products"]
  );

  if (legacy.rowCount === 0) {
    return { deleted: false, reason: "not_found" };
  }

  const categoryId = Number(legacy.rows[0].id);
  const productsResult = await client.query(
    `
      SELECT COUNT(*)::int AS total
      FROM products p
      INNER JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE sc.category_id = $1
    `,
    [categoryId]
  );
  const productCount = Number(productsResult.rows[0]?.total || 0);

  if (productCount > 0) {
    throw new Error(
      `New Products category still has ${productCount} product(s); refusing cascade delete.`
    );
  }

  await client.query("DELETE FROM categories WHERE id = $1", [categoryId]);
  return { deleted: true, reason: "empty" };
}

async function main() {
  const target = process.argv[2] || "development";
  await loadEnvironment(target);

  const { ensureProductVariantSchema } = await import("../lib/productSchema.js");
  const { pool } = await import("../lib/db.js");

  await ensureProductVariantSchema();

  const client = await pool.connect();
  const upserted = [];
  let legacyCleanup;

  try {
    await client.query("BEGIN");
    for (const product of products) {
      const categoryId = await ensureCategory(client, product.category);
      const id = await upsertProduct(client, categoryId, product);
      upserted.push({ id, sku: product.sku, title: product.title, price: product.price });
    }

    legacyCleanup = await deleteLegacyNewProductsCategory(client);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`Seeded ${upserted.length} new design products into ${target} database.`);
  console.log(
    legacyCleanup?.deleted
      ? "Deleted empty legacy New Products category."
      : "Legacy New Products category was not present."
  );
  console.table(upserted);
}

await main();
