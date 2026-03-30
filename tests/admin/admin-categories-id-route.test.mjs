import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Category ID Route', () => {
    let PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/categories/[id]/route.js');
        PUT = module.PUT;
        DELETE = module.DELETE;
    });

    // --- PUT ---
    test('PUT /api/admin/categories/[id] - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await PUT(req);
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/categories/[id] - geçerli verilerle günceller ve 200 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Yeni İsim' })
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });

    // --- DELETE ---
    test('DELETE /api/admin/categories/[id] - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await DELETE(req);
        expect(response.status).toBe(403);
    });

    test('DELETE /api/admin/categories/[id] - siler ve 200 döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });
});
