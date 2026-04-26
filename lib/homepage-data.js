import { pool } from "@/lib/db";
import { ensureCampaignSchema } from "@/lib/admin/campaignSchema";
import { normalizeCampaignRecord } from "@/lib/admin/campaigns";
import { isAdminTestMode, listFallbackCampaignRecords } from "@/lib/admin/test-data";
import {
  buildProductRelationsJoins,
  buildProductRelationsSelect,
  normalizeProductRow,
} from "@/lib/products-data";
import { ensureProductVariantSchema } from "@/lib/productSchema";

export async function fetchHomepageProducts() {
  try {
    await ensureProductVariantSchema();

    const query = `
      SELECT
        ${buildProductRelationsSelect("p")},
        sc.slug AS "subCategorySlug",
        c.slug AS "categorySlug"
      FROM products p
      ${buildProductRelationsJoins("p")}
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON c.id = sc.category_id
      ORDER BY p.created_at DESC NULLS LAST, p.id DESC
    `;
    const res = await pool.query(query);
    return res.rows.map((row) => normalizeProductRow(row, { ensureDefaults: false }));
  } catch (error) {
    console.error("Failed to fetch homepage products:", error);
    return [];
  }
}

export async function fetchHomepageCampaigns() {
  if (isAdminTestMode()) {
    return listFallbackCampaignRecords()
      .map((campaign) => normalizeCampaignRecord(campaign))
      .filter((campaign) => campaign.status === "active");
  }

  try {
    await ensureCampaignSchema();

    const result = await pool.query(`
      SELECT
        id,
        title,
        code,
        description,
        discount_type,
        discount_value,
        starts_at,
        ends_at,
        is_active,
        usage_limit,
        used_count,
        created_at,
        updated_at
      FROM campaigns
      WHERE is_active = true
        AND (ends_at IS NULL OR ends_at > NOW())
      ORDER BY created_at DESC NULLS LAST, id DESC
    `);

    return result.rows
      .map((campaign) => normalizeCampaignRecord(campaign))
      .filter((campaign) => campaign.status === "active");
  } catch (error) {
    console.error("Failed to fetch homepage campaigns:", error);
    return [];
  }
}
