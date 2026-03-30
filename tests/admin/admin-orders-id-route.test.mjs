import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Order ID Route', () => {
    let GET, PATCH;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/orders/[orderNumber]/route.js');
        GET = module.GET;
        PATCH = module.PATCH;
    });

    test('GET /api/admin/orders/[orderNumber] - sipariş detayını döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req, { params: { orderNumber: 'ORD123' } });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('orderNumber');
    });

    test('PATCH /api/admin/orders/[orderNumber] - geçerli durum ile günceller', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ status: 'shipped' })
        };
        const response = await PATCH(req, { params: { orderNumber: 'ORD123' } });
        expect(response.status).toBe(200);
    });
});
