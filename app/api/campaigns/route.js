import { pool } from '@/lib/db.js';
import { ensureCampaignSchema } from '@/lib/admin/campaignSchema.js';
import { normalizeCampaignRecord } from '@/lib/admin/campaigns.js';
import { isAdminTestMode, listFallbackCampaignRecords } from '@/lib/admin/test-data.js';

export async function GET(req) {
    if (isAdminTestMode()) {
        const fallbacks = listFallbackCampaignRecords()
            .map(normalizeCampaignRecord)
            .filter(c => c.status === 'active');
        return Response.json(fallbacks, { status: 200 });
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

        const campaigns = result.rows
            .map(normalizeCampaignRecord)
            .filter(c => c.status === 'active');

        return Response.json(campaigns, { status: 200 });
    } catch {
        return Response.json({ error: 'Campaigns could not be loaded' }, { status: 500 });
    }
}
