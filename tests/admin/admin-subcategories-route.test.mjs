import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Subcategories Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/subcategories/route.js');
        GET = module.GET;
        POST = module.POST;
    });

    test('GET /api/admin/subcategories - tüm alt kategorileri döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
    });

    test('POST /api/admin/subcategories - geçerli verilerle 201 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test Alt Kategori', slug: 'test-alt', category_id: 1 })
        };
        const response = await POST(req);
        expect(response.status).toBe(201);
    });
});
