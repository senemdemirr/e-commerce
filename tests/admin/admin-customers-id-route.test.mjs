import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Customer ID Route', () => {
    let GET, PATCH, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/customers/[id]/route.js');
        GET = module.GET;
        PATCH = module.PATCH;
        // DELETE = module.DELETE; // Not in todos but might be useful
    });

    // --- GET ---
    test('GET /api/admin/customers/[id] - müşteri detayını siparişleriyle döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('orders');
    });

    test('GET /api/admin/customers/[id] - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    // --- PATCH ---
    test('PATCH /api/admin/customers/[id] - müşteri bilgilerini günceller', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Güncellenmiş İsim' })
        };
        const response = await PATCH(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });
});
