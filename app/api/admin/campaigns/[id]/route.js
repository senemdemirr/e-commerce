import { pool } from '@/lib/db.js';
import { requireAdminWriteAccess } from '@/lib/admin/auth.js';
import { ensureCampaignSchema } from '@/lib/admin/campaignSchema.js';
import { normalizeCampaignPayload, normalizeCampaignRecord, validateCampaignPayload } from '@/lib/admin/campaigns.js';
import { isAdminTestMode, listFallbackCampaignRecords } from '@/lib/admin/test-data.js';

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function notFoundResponse() {
    return Response.json({ error: 'Campaign not found' }, { status: 404 });
}

async function parseCampaignId(params) {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function findFallbackCampaignById(id) {
    const campaign = listFallbackCampaignRecords()
        .find((item) => Number(item.id) === Number(id));

    return campaign ? normalizeCampaignRecord(campaign) : null;
}

function updateFallbackCampaign(id, payload) {
    const currentCampaign = findFallbackCampaignById(id);

    if (!currentCampaign) {
        return null;
    }

    const updated = !(
        currentCampaign.title === payload.title
        && currentCampaign.code === payload.code
        && currentCampaign.description === payload.description
        && currentCampaign.discount_type === payload.discount_type
        && Number(currentCampaign.discount_value) === Number(payload.discount_value)
        && (currentCampaign.starts_at || null) === (payload.starts_at || null)
        && (currentCampaign.ends_at || null) === (payload.ends_at || null)
        && currentCampaign.is_active === payload.is_active
        && (currentCampaign.usage_limit || null) === (payload.usage_limit || null)
    );

    return {
        ...normalizeCampaignRecord({
            ...currentCampaign,
            ...payload,
            used_count: currentCampaign.used_count,
            created_at: currentCampaign.created_at,
            updated_at: new Date().toISOString(),
        }),
        updated,
    };
}

async function loadCampaignById(id) {
    const result = await pool.query(
        'SELECT * FROM campaigns WHERE id = $1 LIMIT 1',
        [id]
    );

    return result.rowCount > 0 ? normalizeCampaignRecord(result.rows[0]) : null;
}

export async function PUT(req, { params } = {}) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const id = await parseCampaignId(params);

        if (!id) {
            return notFoundResponse();
        }

        const body = await req.json();
        const payload = normalizeCampaignPayload(body);
        const validationError = validateCampaignPayload(payload);

        if (validationError) {
            return invalidFieldResponse(validationError);
        }

        if (isAdminTestMode()) {
            const updatedCampaign = updateFallbackCampaign(id, payload);
            return updatedCampaign
                ? Response.json(updatedCampaign, { status: 200 })
                : notFoundResponse();
        }

        await ensureCampaignSchema();

        const currentCampaign = await loadCampaignById(id);

        if (!currentCampaign) {
            return notFoundResponse();
        }

        const changed = !(
            currentCampaign.title === payload.title
            && currentCampaign.code === payload.code
            && currentCampaign.description === payload.description
            && currentCampaign.discount_type === payload.discount_type
            && Number(currentCampaign.discount_value) === Number(payload.discount_value)
            && (currentCampaign.starts_at || null) === (payload.starts_at || null)
            && (currentCampaign.ends_at || null) === (payload.ends_at || null)
            && currentCampaign.is_active === payload.is_active
            && (currentCampaign.usage_limit || null) === (payload.usage_limit || null)
        );

        if (!changed) {
            return Response.json({ ...currentCampaign, updated: false }, { status: 200 });
        }

        const result = await pool.query(
            `
                UPDATE campaigns
                SET
                    title = $1,
                    code = $2,
                    description = $3,
                    discount_type = $4,
                    discount_value = $5,
                    starts_at = $6,
                    ends_at = $7,
                    is_active = $8,
                    usage_limit = $9,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $10
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
                id,
            ]
        );

        return Response.json({
            ...normalizeCampaignRecord(result.rows[0]),
            updated: true,
        }, { status: 200 });
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Campaign code already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params } = {}) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const id = await parseCampaignId(params);

        if (!id) {
            return notFoundResponse();
        }

        if (isAdminTestMode()) {
            const currentCampaign = findFallbackCampaignById(id);

            if (!currentCampaign) {
                return notFoundResponse();
            }

            if (currentCampaign.is_used) {
                return Response.json({ error: 'Used campaigns cannot be deleted' }, { status: 409 });
            }

            return Response.json({ deleted: true, id }, { status: 200 });
        }

        await ensureCampaignSchema();

        const currentCampaign = await loadCampaignById(id);

        if (!currentCampaign) {
            return notFoundResponse();
        }

        if (currentCampaign.is_used) {
            return Response.json({ error: 'Used campaigns cannot be deleted' }, { status: 409 });
        }

        await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);

        return Response.json({ deleted: true, id }, { status: 200 });
    } catch {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
