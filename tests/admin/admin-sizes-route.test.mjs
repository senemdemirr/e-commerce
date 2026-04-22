import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Sizes Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/sizes/route.js');
        GET = routeModule.GET;
        POST = routeModule.POST;
    });

    test('GET /api/admin/sizes - non-admin gets 403', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/sizes - returns sizes from fallback list for admin', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data[0]).toHaveProperty('name');
        expect(data[0]).toHaveProperty('product_count');
        expect(data[0]).toHaveProperty('variant_count');
        expect(data[0].name).toBe('S');
    });

    test('POST /api/admin/sizes - non-superadmin gets 403', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'XXL' }),
        };
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/sizes - name is required', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({}),
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/sizes - creates size', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'XXL' }),
        };
        const response = await POST(req);
        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.name).toBe('XXL');
        expect(data.product_count).toBe(0);
        expect(data.variant_count).toBe(0);
    });
});
