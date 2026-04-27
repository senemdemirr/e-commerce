const DISCOUNT_TYPES = new Set(['percent', 'fixed']);

function toTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalDate(value) {
    const normalized = toTrimmedString(value);

    if (!normalized) {
        return null;
    }

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? normalized : date.toISOString();
}

function normalizeDateOutput(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

export function formatCampaignDateTime(value, fallback = 'No date') {
    if (!value) {
        return fallback;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    const datePart = new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
    const timePart = new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date).replace(':', '.');

    return `${datePart} ${timePart}`;
}

function normalizeBoolean(value, fallback = true) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    return ['1', 'true', 't', 'yes', 'y', 'on'].includes(String(value).trim().toLowerCase());
}

function normalizeOptionalInteger(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const normalized = Number(value);
    return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function normalizeMoney(value) {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
}

export function normalizeCampaignCode(value) {
    return toTrimmedString(value).toUpperCase();
}

export function isValidCampaignCode(value) {
    return /^[A-Z0-9_-]+$/.test(normalizeCampaignCode(value));
}

export function isValidDiscountType(value) {
    return DISCOUNT_TYPES.has(toTrimmedString(value).toLowerCase());
}

export function normalizeCampaignPayload(payload = {}, options = {}) {
    return {
        title: toTrimmedString(payload.title),
        code: normalizeCampaignCode(payload.code),
        description: toTrimmedString(payload.description),
        discount_type: isValidDiscountType(payload.discount_type)
            ? toTrimmedString(payload.discount_type).toLowerCase()
            : 'percent',
        discount_value: normalizeMoney(payload.discount_value),
        starts_at: normalizeOptionalDate(payload.starts_at),
        ends_at: normalizeOptionalDate(payload.ends_at),
        is_active: normalizeBoolean(payload.is_active ?? payload.active, options.defaultActive ?? true),
        usage_limit: normalizeOptionalInteger(payload.usage_limit),
    };
}

export function getCampaignStatus(campaign = {}, now = new Date()) {
    if (!campaign.is_active) {
        return 'inactive';
    }

    const startsAt = campaign.starts_at ? new Date(campaign.starts_at) : null;
    const endsAt = campaign.ends_at ? new Date(campaign.ends_at) : null;

    if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt > now) {
        return 'scheduled';
    }

    if (endsAt && !Number.isNaN(endsAt.getTime()) && endsAt < now) {
        return 'expired';
    }

    return 'active';
}

export function normalizeCampaignRecord(campaign = {}) {
    const normalized = {
        id: Number(campaign.id || 0),
        title: toTrimmedString(campaign.title),
        code: normalizeCampaignCode(campaign.code),
        description: toTrimmedString(campaign.description),
        discount_type: isValidDiscountType(campaign.discount_type)
            ? toTrimmedString(campaign.discount_type).toLowerCase()
            : 'percent',
        discount_value: normalizeMoney(campaign.discount_value),
        starts_at: normalizeDateOutput(campaign.starts_at),
        ends_at: normalizeDateOutput(campaign.ends_at),
        is_active: normalizeBoolean(campaign.is_active, true),
        usage_limit: normalizeOptionalInteger(campaign.usage_limit),
        used_count: Math.max(0, Number(campaign.used_count || 0)),
        created_at: campaign.created_at || null,
        updated_at: campaign.updated_at || null,
    };

    return {
        ...normalized,
        status: getCampaignStatus(normalized),
        is_used: normalized.used_count > 0,
    };
}

export function validateCampaignPayload(payload = {}) {
    if (!payload.title) {
        return 'Campaign title is required';
    }

    if (!payload.code) {
        return 'Campaign code is required';
    }

    if (!isValidCampaignCode(payload.code)) {
        return 'Campaign code can only contain letters, numbers, underscore, and hyphen';
    }

    if (!isValidDiscountType(payload.discount_type)) {
        return 'Discount type must be percent or fixed';
    }

    if (!Number.isFinite(Number(payload.discount_value)) || Number(payload.discount_value) <= 0) {
        return 'Discount value must be greater than 0';
    }

    if (payload.discount_type === 'percent' && Number(payload.discount_value) > 100) {
        return 'Percent discount cannot exceed 100';
    }

    if (payload.starts_at && Number.isNaN(new Date(payload.starts_at).getTime())) {
        return 'Start date is invalid';
    }

    if (payload.ends_at && Number.isNaN(new Date(payload.ends_at).getTime())) {
        return 'End date is invalid';
    }

    if (payload.starts_at && payload.ends_at && new Date(payload.starts_at) > new Date(payload.ends_at)) {
        return 'Start date must be before end date';
    }

    if (payload.usage_limit !== null && (!Number.isInteger(Number(payload.usage_limit)) || Number(payload.usage_limit) <= 0)) {
        return 'Usage limit must be a positive integer';
    }

    return '';
}
