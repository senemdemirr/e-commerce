import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Settings Management', () => {
    let GET, PUT;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/settings/route.js');
        GET = module.GET;
        PUT = module.PUT;
    });

    test('GET /api/admin/settings - genel site ayarlarını döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('shipping_fee');
    });

    test('PUT /api/admin/settings - ayarları günceller', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ shipping_fee: 50, free_shipping_threshold: 1000 })
        };
        const response = await PUT(req);
        expect(response.status).toBe(200);
    });
});
