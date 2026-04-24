import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Campaigns Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/campaigns/route.js');
        GET = routeModule.GET;
        POST = routeModule.POST;
    });

    test('GET /api/admin/campaigns - non-admin gets 403', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/campaigns - returns campaign list for admin', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data[0]).toHaveProperty('code');
        expect(data[0]).toHaveProperty('discount_type');
        expect(data[0]).toHaveProperty('status');
    });

    test('POST /api/admin/campaigns - non-superadmin gets 403', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ title: 'Promo', code: 'PROMO10', discount_value: 10 }),
        };
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/campaigns - title is required', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ code: 'PROMO10', discount_value: 10 }),
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/campaigns - invalid code returns 400', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ title: 'Promo', code: 'promo 10', discount_value: 10 }),
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/campaigns - percent discount cannot exceed 100', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({
                title: 'Promo',
                code: 'PROMO101',
                discount_type: 'percent',
                discount_value: 101,
            }),
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/campaigns - creates campaign', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({
                title: 'Weekend Promo',
                code: 'weekend-20',
                description: 'Weekend campaign',
                discount_type: 'percent',
                discount_value: 20,
                is_active: true,
                usage_limit: 50,
            }),
        };
        const response = await POST(req);
        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.title).toBe('Weekend Promo');
        expect(data.code).toBe('WEEKEND-20');
        expect(data.discount_value).toBe(20);
        expect(data.usage_limit).toBe(50);
    });
});
