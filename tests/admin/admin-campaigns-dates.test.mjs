import {
    areCampaignDateValuesEqual,
    formatCampaignDateTime,
    normalizeCampaignPayload,
    normalizeDateTimeLocalWithOffset,
    toCampaignDateTimeInputValue,
} from '../../lib/admin/campaigns.js';

describe('Admin campaign date normalization', () => {
    test('normalizes datetime-local values with the campaign timezone offset', () => {
        const startsAt = '2026-04-28T02:00';
        const endsAt = '2026-04-29T08:00';

        expect(normalizeDateTimeLocalWithOffset(startsAt)).toBe(
            '2026-04-28T02:00:00.000+03:00'
        );
        expect(normalizeDateTimeLocalWithOffset(endsAt)).toBe(
            '2026-04-29T08:00:00.000+03:00'
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

        expect(payload.starts_at).toBe('2026-04-28T02:00:00.000+03:00');
        expect(payload.ends_at).toBe('2026-04-29T08:00:00.000+03:00');
        expect(payload.starts_at).not.toBe(new Date(startsAt).toISOString());
        expect(payload.ends_at).not.toBe(new Date(endsAt).toISOString());
    });

    test('formats campaign dates in the campaign timezone', () => {
        expect(formatCampaignDateTime('2026-04-27T23:00:00.000Z')).toBe('28.04.2026 02.00');
        expect(formatCampaignDateTime('2026-04-28T02:00:00.000+03:00')).toBe('28.04.2026 02.00');
        expect(formatCampaignDateTime('2026-04-28T02:00')).toBe('28.04.2026 02.00');
    });

    test('builds datetime-local values in the campaign timezone', () => {
        expect(toCampaignDateTimeInputValue('2026-04-27T23:00:00.000Z')).toBe('2026-04-28T02:00');
        expect(toCampaignDateTimeInputValue('2026-04-28T02:00:00.000+03:00')).toBe('2026-04-28T02:00');
    });

    test('compares equivalent stored and submitted campaign dates', () => {
        expect(areCampaignDateValuesEqual(
            '2026-04-27T23:00:00.000Z',
            '2026-04-28T02:00:00.000+03:00'
        )).toBe(true);
        expect(areCampaignDateValuesEqual(
            new Date('2026-04-27T23:00:00.000Z'),
            '2026-04-28T02:00:00.000+03:00'
        )).toBe(true);
        expect(areCampaignDateValuesEqual(
            '2026-04-27T23:00:00.000Z',
            '2026-04-28T03:00:00.000+03:00'
        )).toBe(false);
    });
});
