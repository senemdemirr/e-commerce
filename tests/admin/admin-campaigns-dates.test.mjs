import {
    normalizeCampaignPayload,
    normalizeDateTimeLocalWithOffset,
} from '../../lib/admin/campaigns.js';

function expectedLocalOffset(value) {
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absoluteOffsetMinutes = Math.abs(offsetMinutes);
    const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, '0');
    const offsetRemainderMinutes = String(absoluteOffsetMinutes % 60).padStart(2, '0');

    return `${sign}${offsetHours}:${offsetRemainderMinutes}`;
}

describe('Admin campaign date normalization', () => {
    test('normalizes datetime-local values with the local offset', () => {
        const startsAt = '2026-04-28T02:00';
        const endsAt = '2026-04-29T08:00';

        expect(normalizeDateTimeLocalWithOffset(startsAt)).toBe(
            `2026-04-28T02:00:00.000${expectedLocalOffset(startsAt)}`
        );
        expect(normalizeDateTimeLocalWithOffset(endsAt)).toBe(
            `2026-04-29T08:00:00.000${expectedLocalOffset(endsAt)}`
        );
    });

    test('keeps admin form payload dates at the selected local time', () => {
        const startsAt = '2026-04-28T02:00';
        const endsAt = '2026-04-29T08:00';
        const payload = normalizeCampaignPayload({
            title: 'test',
            code: 'TEST',
            discount_type: 'percent',
            discount_value: 10,
            starts_at: startsAt,
            ends_at: endsAt,
            is_active: true,
            usage_limit: 2,
        }, {
            preserveDateTimeOffset: true,
        });

        expect(payload.starts_at).toBe(`2026-04-28T02:00:00.000${expectedLocalOffset(startsAt)}`);
        expect(payload.ends_at).toBe(`2026-04-29T08:00:00.000${expectedLocalOffset(endsAt)}`);
        expect(payload.starts_at).not.toBe(new Date(startsAt).toISOString());
        expect(payload.ends_at).not.toBe(new Date(endsAt).toISOString());
    });
});
