import { pool } from '@/lib/db.js';
import { ensureCampaignSchema } from '@/lib/admin/campaignSchema.js';
import {
    isCampaignRedeemable,
    normalizeCampaignCode,
    normalizeCampaignRecord,
} from '@/lib/admin/campaigns.js';
import { isAdminTestMode, listFallbackCampaignRecords } from '@/lib/admin/test-data.js';

function listActiveCampaigns(campaigns = []) {
    return campaigns.filter((campaign) => isCampaignRedeemable(campaign));
}

export async function GET(req) {
    const url = new URL(req.url);
    const requestedCode = normalizeCampaignCode(url.searchParams.get('code'));

    if (isAdminTestMode()) {
        const fallbacks = listFallbackCampaignRecords()
            .map(normalizeCampaignRecord);

        if (requestedCode) {
            const campaign = fallbacks.find((item) => item.code === requestedCode) || null;
            return Response.json(campaign ? [campaign] : [], { status: 200 });
        }

        return Response.json(listActiveCampaigns(fallbacks), { status: 200 });
    }

    try {
        await ensureCampaignSchema();

        if (requestedCode) {
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
                WHERE UPPER(code) = UPPER($1)
                LIMIT 1
            `, [requestedCode]);

            const campaign = result.rows[0] ? normalizeCampaignRecord(result.rows[0]) : null;
            return Response.json(campaign ? [campaign] : [], { status: 200 });
        }

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
            .filter((campaign) => isCampaignRedeemable(campaign));

        return Response.json(campaigns, { status: 200 });
    } catch {
        return Response.json({ error: 'Campaigns could not be loaded' }, { status: 500 });
    }
}
