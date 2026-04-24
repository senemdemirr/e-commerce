import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Campaign ID Route', () => {
    let PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/campaigns/[id]/route.js');
        PUT = routeModule.PUT;
        DELETE = routeModule.DELETE;
    });

    test('PUT /api/admin/campaigns/[id] - non-admin gets 403', async () => {
        const req = {
            headers: { get: () => 'customer' },
            json: async () => ({ title: 'Promo', code: 'PROMO10', discount_value: 10 }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/campaigns/[id] - admin cannot write', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ title: 'Promo', code: 'PROMO10', discount_value: 10 }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/campaigns/[id] - updates campaign', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({
                title: 'Updated Promo',
                code: 'UPDATED10',
                discount_type: 'fixed',
                discount_value: 25,
                is_active: false,
            }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.title).toBe('Updated Promo');
        expect(data.code).toBe('UPDATED10');
        expect(data.discount_type).toBe('fixed');
        expect(data.updated).toBe(true);
    });

    test('PUT /api/admin/campaigns/[id] - works with async params', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ title: 'Updated Promo', code: 'UPDATED10', discount_value: 10 }),
        };
        const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
        expect(response.status).toBe(200);
    });

    test('PUT /api/admin/campaigns/[id] - missing campaign returns 404', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ title: 'Updated Promo', code: 'UPDATED10', discount_value: 10 }),
        };
        const response = await PUT(req, { params: { id: '99999' } });
        expect(response.status).toBe(404);
    });

    test('PUT /api/admin/campaigns/[id] - same data returns updated false', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({
                title: 'Spring Launch',
                code: 'SPRING10',
                description: 'Fixture campaign with existing usage.',
                discount_type: 'percent',
                discount_value: 10,
                starts_at: '2026-01-01T00:00:00.000Z',
                ends_at: '2026-12-31T23:59:59.000Z',
                is_active: true,
                usage_limit: 100,
            }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.updated).toBe(false);
    });

    test('DELETE /api/admin/campaigns/[id] - used campaign cannot be deleted', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(409);
    });

    test('DELETE /api/admin/campaigns/[id] - deletes unused campaign', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: { id: '2' } });
        expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/campaigns/[id] - admin cannot delete', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '2' } });
        expect(response.status).toBe(403);
    });
});
