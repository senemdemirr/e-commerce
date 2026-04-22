import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Colors Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/colors/route.js');
        GET = routeModule.GET;
        POST = routeModule.POST;
    });

    test('GET /api/admin/colors - non-admin gets 403', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/colors - returns colors from fallback list for admin', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data[0]).toHaveProperty('hex');
        expect(data[0]).toHaveProperty('product_count');
        expect(data[0]).toHaveProperty('variant_count');
        expect(data[0].name).toBe('Midnight Black');
    });

    test('POST /api/admin/colors - non-superadmin gets 403', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Stone', hex: '#8DC8A1' }),
        };
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/colors - name is required', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ hex: '#8DC8A1' }),
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/colors - hex is required and must be valid', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'Stone', hex: '#GGGGGG' }),
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/colors - creates color and normalizes hex', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'Stone Beige', hex: '#8dc8a1' }),
        };
        const response = await POST(req);
        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.name).toBe('Stone Beige');
        expect(data.hex).toBe('#8DC8A1');
        expect(data.product_count).toBe(0);
        expect(data.variant_count).toBe(0);
    });
});
