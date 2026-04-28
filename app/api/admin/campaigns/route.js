import { pool } from '@/lib/db.js';
import { requireAdminReadAccess, requireAdminWriteAccess } from '@/lib/admin/auth.js';
import { ensureCampaignSchema } from '@/lib/admin/campaignSchema.js';
import { normalizeCampaignPayload, normalizeCampaignRecord, validateCampaignPayload, } from '@/lib/admin/campaigns.js';
import { isAdminTestMode, listFallbackCampaignRecords } from '@/lib/admin/test-data.js';

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function sortCampaigns(campaigns = []) {
    return [...campaigns].sort((left, right) => {
        const leftTime = Date.parse(left.created_at || 0);
        const rightTime = Date.parse(right.created_at || 0);

        if (rightTime !== leftTime) {
            return rightTime - leftTime;
        }

        return Number(right.id || 0) - Number(left.id || 0);
    });
}

function listFallbackCampaigns() {
    return sortCampaigns(
        listFallbackCampaignRecords().map((campaign) => normalizeCampaignRecord(campaign))
    );
}

function createFallbackCampaign(payload) {
    const campaigns = listFallbackCampaigns();
    const nextId = campaigns.reduce((maxId, campaign) => Math.max(maxId, campaign.id), 0) + 1;

    return normalizeCampaignRecord({
        id: nextId,
        ...payload,
        used_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
}

export async function GET(req) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    if (isAdminTestMode()) {
        return Response.json(listFallbackCampaigns(), { status: 200 });
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
            ORDER BY created_at DESC NULLS LAST, id DESC
        `);

        return Response.json(
            result.rows.map((campaign) => normalizeCampaignRecord(campaign)),
            { status: 200 }
        );
    } catch {
        return Response.json({ error: 'Campaigns could not be loaded' }, { status: 500 });
    }
}

export async function POST(req) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const body = await req.json();
        const payload = normalizeCampaignPayload(body);
        const validationError = validateCampaignPayload(payload);

        if (validationError) {
            return invalidFieldResponse(validationError);
        }

        if (isAdminTestMode()) {
            return Response.json(createFallbackCampaign(payload), { status: 201 });
        }

        await ensureCampaignSchema();

        const result = await pool.query(
            `
                INSERT INTO campaigns (
                    title,
                    code,
                    description,
                    discount_type,
                    discount_value,
                    starts_at,
                    ends_at,
                    is_active,
                    usage_limit
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `,
            [
                payload.title,
                payload.code,
                payload.description,
                payload.discount_type,
                payload.discount_value,
                payload.starts_at,
                payload.ends_at,
                payload.is_active,
                payload.usage_limit,
            ]
        );

        return Response.json(normalizeCampaignRecord(result.rows[0]), { status: 201 });
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Campaign code already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
