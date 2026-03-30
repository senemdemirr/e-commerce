import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Subcategory ID Route', () => {
    let PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/subcategories/[id]/route.js');
        PUT = module.PUT;
        DELETE = module.DELETE;
    });

    test('PUT /api/admin/subcategories/[id] - geçerli verilerle günceller', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Yeni Alt İsim' })
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/subcategories/[id] - siler ve 200 döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });
});
