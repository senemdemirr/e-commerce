const DISCOUNT_TYPES = new Set(['percent', 'fixed']);
export const CAMPAIGN_DATE_TIME_ZONE = 'Europe/Istanbul';
const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const DATE_TIME_OFFSET_PATTERN = /(Z|[+-]\d{2}:\d{2})$/i;
const CAMPAIGN_DATE_TIME_PARTS_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
    timeZone: CAMPAIGN_DATE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});
const CAMPAIGN_OFFSET_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US', {
    timeZone: CAMPAIGN_DATE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
});

function toTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function padNumber(value, length = 2) {
    return String(value).padStart(length, '0');
}

function parseLocalDateTimeParts(value) {
    const match = LOCAL_DATE_TIME_PATTERN.exec(value);

    if (!match) {
        return null;
    }

    const [
        ,
        yearValue,
        monthValue,
        dayValue,
        hourValue,
        minuteValue,
        secondValue = '0',
        millisecondValue = '0',
    ] = match;
    const parts = {
        year: Number(yearValue),
        month: Number(monthValue),
        day: Number(dayValue),
        hour: Number(hourValue),
        minute: Number(minuteValue),
        second: Number(secondValue),
        millisecond: Number(millisecondValue.padEnd(3, '0')),
        yearValue,
        monthValue,
        dayValue,
        hourValue,
        minuteValue,
        secondValue,
        millisecondValue,
    };
    const date = new Date(Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
    ));

    if (
        Number.isNaN(date.getTime())
        || date.getUTCFullYear() !== parts.year
        || date.getUTCMonth() !== parts.month - 1
        || date.getUTCDate() !== parts.day
        || date.getUTCHours() !== parts.hour
        || date.getUTCMinutes() !== parts.minute
        || date.getUTCSeconds() !== parts.second
    ) {
        return null;
    }

    return parts;
}

function getFormattedDateTimeParts(date, formatter = CAMPAIGN_DATE_TIME_PARTS_FORMATTER) {
    const values = {};

    formatter.formatToParts(date).forEach((part) => {
        if (part.type !== 'literal') {
            values[part.type] = part.value;
        }
    });

    return {
        year: Number(values.year),
        month: Number(values.month),
        day: Number(values.day),
        hour: Number(values.hour === '24' ? '00' : values.hour),
        minute: Number(values.minute),
        second: Number(values.second || 0),
    };
}

function formatDateTimeParts(parts) {
    return `${padNumber(parts.day)}.${padNumber(parts.month)}.${parts.year} ${padNumber(parts.hour)}.${padNumber(parts.minute)}`;
}

function getCampaignTimeZoneOffsetMinutes(timestamp) {
    const parts = getFormattedDateTimeParts(new Date(timestamp), CAMPAIGN_OFFSET_PARTS_FORMATTER);
    const zonedTimestamp = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
    );

    return Math.round((zonedTimestamp - timestamp) / 60000);
}

function getCampaignOffsetForLocalParts(parts) {
    const localTimestamp = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
    );
    const firstOffset = getCampaignTimeZoneOffsetMinutes(localTimestamp);
    const candidateTimestamp = localTimestamp - firstOffset * 60000;

    return getCampaignTimeZoneOffsetMinutes(candidateTimestamp);
}

function formatOffset(offsetMinutes) {
    const offsetSign = offsetMinutes >= 0 ? '+' : '-';
    const absoluteOffsetMinutes = Math.abs(offsetMinutes);
    const offsetHours = Math.floor(absoluteOffsetMinutes / 60);
    const offsetRemainderMinutes = absoluteOffsetMinutes % 60;

    return `${offsetSign}${padNumber(offsetHours)}:${padNumber(offsetRemainderMinutes)}`;
}

export function normalizeDateTimeLocalWithOffset(value) {
    const normalized = toTrimmedString(value);

    if (!normalized) {
        return null;
    }

    if (DATE_TIME_OFFSET_PATTERN.test(normalized)) {
        return normalized;
    }

    const parts = parseLocalDateTimeParts(normalized);

    if (!parts) {
        return normalized;
    }

    const offset = formatOffset(getCampaignOffsetForLocalParts(parts));

    return [
        [
            `${parts.yearValue}-${parts.monthValue}-${parts.dayValue}`,
            `${parts.hourValue}:${parts.minuteValue}:${padNumber(parts.second)}.${padNumber(parts.millisecond, 3)}`,
        ].join('T'),
        offset,
    ].join('');
}

function normalizeOptionalDate(value, options = {}) {
    const normalized = toTrimmedString(value);

    if (!normalized) {
        return null;
    }

    if (options.preserveDateTimeOffset) {
        return normalizeDateTimeLocalWithOffset(normalized);
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

function toOptionalDateString(value) {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? '' : value.toISOString();
    }

    return toTrimmedString(value);
}

export function areCampaignDateValuesEqual(left, right) {
    const normalizedLeft = toOptionalDateString(left);
    const normalizedRight = toOptionalDateString(right);

    if (!normalizedLeft && !normalizedRight) {
        return true;
    }

    if (!normalizedLeft || !normalizedRight) {
        return false;
    }

    const leftDate = new Date(normalizedLeft);
    const rightDate = new Date(normalizedRight);

    if (!Number.isNaN(leftDate.getTime()) && !Number.isNaN(rightDate.getTime())) {
        return leftDate.getTime() === rightDate.getTime();
    }

    return normalizedLeft === normalizedRight;
}

export function formatCampaignDateTime(value, fallback = 'No date') {
    if (!value) {
        return fallback;
    }

    const normalized = toTrimmedString(value);
    const localParts = normalized ? parseLocalDateTimeParts(normalized) : null;

    if (localParts && !DATE_TIME_OFFSET_PATTERN.test(normalized)) {
        return formatDateTimeParts(localParts);
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return formatDateTimeParts(getFormattedDateTimeParts(date));
}

export function toCampaignDateTimeInputValue(value) {
    if (!value) {
        return '';
    }

    const normalized = toTrimmedString(value);
    const localParts = normalized ? parseLocalDateTimeParts(normalized) : null;

    if (localParts && !DATE_TIME_OFFSET_PATTERN.test(normalized)) {
        return `${localParts.yearValue}-${localParts.monthValue}-${localParts.dayValue}T${localParts.hourValue}:${localParts.minuteValue}`;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const parts = getFormattedDateTimeParts(date);

    return `${parts.year}-${padNumber(parts.month)}-${padNumber(parts.day)}T${padNumber(parts.hour)}:${padNumber(parts.minute)}`;
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

export function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
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
    const source = payload || {};
    const dateOptions = {
        preserveDateTimeOffset: options.preserveDateTimeOffset === true,
    };

    return {
        title: toTrimmedString(source.title),
        code: normalizeCampaignCode(source.code),
        description: toTrimmedString(source.description),
        discount_type: isValidDiscountType(source.discount_type)
            ? toTrimmedString(source.discount_type).toLowerCase()
            : 'percent',
        discount_value: normalizeMoney(source.discount_value),
        starts_at: normalizeOptionalDate(source.starts_at, dateOptions),
        ends_at: normalizeOptionalDate(source.ends_at, dateOptions),
        is_active: normalizeBoolean(source.is_active ?? source.active, options.defaultActive ?? true),
        usage_limit: normalizeOptionalInteger(source.usage_limit),
    };
}

export function getCampaignStatus(campaign = {}, now = new Date()) {
    const source = campaign && typeof campaign === 'object' ? campaign : {};

    if (!source?.is_active) {
        return 'inactive';
    }

    const startsAt = source?.starts_at ? new Date(source.starts_at) : null;
    const endsAt = source?.ends_at ? new Date(source.ends_at) : null;

    if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt > now) {
        return 'scheduled';
    }

    if (endsAt && !Number.isNaN(endsAt.getTime()) && endsAt < now) {
        return 'expired';
    }

    const usageLimit = normalizeOptionalInteger(source.usage_limit);
    const usedCount = Math.max(0, Number(source.used_count || 0));

    if (usageLimit && usedCount >= usageLimit) {
        return 'expired';
    }

    return 'active';
}

export function getCampaignAvailabilityIssue(campaign = {}, now = new Date()) {
    const source = campaign && typeof campaign === 'object' ? campaign : {};

    if (!source?.is_active) {
        return 'inactive';
    }

    const startsAt = source?.starts_at ? new Date(source.starts_at) : null;
    const endsAt = source?.ends_at ? new Date(source.ends_at) : null;

    if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt > now) {
        return 'scheduled';
    }

    if (endsAt && !Number.isNaN(endsAt.getTime()) && endsAt < now) {
        return 'date_expired';
    }

    const usageLimit = normalizeOptionalInteger(source.usage_limit);
    const usedCount = Math.max(0, Number(source.used_count || 0));

    if (usageLimit && usedCount >= usageLimit) {
        return 'usage_limit_reached';
    }

    return '';
}

export function getCampaignAvailabilityMessage(campaign = {}, now = new Date()) {
    switch (getCampaignAvailabilityIssue(campaign, now)) {
        case 'inactive':
            return 'Campaign code is currently inactive.';
        case 'scheduled':
            return 'Campaign code has not started yet.';
        case 'date_expired':
            return 'Campaign code has expired.';
        case 'usage_limit_reached':
            return 'Campaign code has reached its usage limit.';
        default:
            return '';
    }
}

export function isCampaignRedeemable(campaign = {}, now = new Date()) {
    const source = campaign && typeof campaign === 'object' ? campaign : {};
    return getCampaignStatus(source, now) === 'active';
}

export function calculateCampaignDiscountAmount(campaign = {}, subtotal = 0) {
    const source = campaign && typeof campaign === 'object' ? campaign : {};

    if (!isCampaignRedeemable(source)) {
        return 0;
    }

    const subtotalValue = Math.max(0, Number(subtotal) || 0);

    if (subtotalValue <= 0) {
        return 0;
    }

    const discountValue = Math.max(0, Number(source.discount_value) || 0);
    const discountType = toTrimmedString(source.discount_type).toLowerCase();

    if (discountType === 'percent') {
        return roundMoney(Math.min(subtotalValue, subtotalValue * (discountValue / 100)));
    }

    return roundMoney(Math.min(subtotalValue, discountValue));
}

export function normalizeCampaignRecord(campaign = {}) {
    const source = campaign && typeof campaign === 'object' ? campaign : {};

    const normalized = {
        id: Number(source.id || 0),
        title: toTrimmedString(source.title),
        code: normalizeCampaignCode(source.code),
        description: toTrimmedString(source.description),
        discount_type: isValidDiscountType(source.discount_type)
            ? toTrimmedString(source.discount_type).toLowerCase()
            : 'percent',
        discount_value: normalizeMoney(source.discount_value),
        starts_at: normalizeDateOutput(source.starts_at),
        ends_at: normalizeDateOutput(source.ends_at),
        is_active: normalizeBoolean(source.is_active, true),
        usage_limit: normalizeOptionalInteger(source.usage_limit),
        used_count: Math.max(0, Number(source.used_count || 0)),
        created_at: source.created_at || null,
        updated_at: source.updated_at || null,
    };

    return {
        ...normalized,
        status: getCampaignStatus(normalized),
        is_used: normalized.used_count > 0,
    };
}

export function getCampaignUsageSummary(campaign = {}) {
    const source = campaign && typeof campaign === 'object' ? campaign : {};
    const usedCount = Math.max(0, Number(source.used_count || 0));
    const usageLimit = normalizeOptionalInteger(source.usage_limit);

    return {
        usedCount,
        usageLimit,
        remainingCount: usageLimit ? Math.max(0, usageLimit - usedCount) : null,
        hasLimit: usageLimit !== null,
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
