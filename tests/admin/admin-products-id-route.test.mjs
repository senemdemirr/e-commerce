import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Product ID Route', () => {
    let GET, PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/products/[id]/route.js');
        GET = module.GET;
        PUT = module.PUT;
        DELETE = module.DELETE;
    });

    test('GET /api/admin/products/[id] - mevcut ürünü döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('id');
    });

    test('PUT /api/admin/products/[id] - geçerli verilerle ürünü günceller', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Güncellenmiş Ürün' })
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/products/[id] - ürünü siler ve 200 döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });
});
