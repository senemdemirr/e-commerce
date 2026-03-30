import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Products Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/products/route.js');
        GET = module.GET;
        POST = module.POST;
    });

    test('GET /api/admin/products - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/products - tüm ürünleri pagination ile döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            nextUrl: { searchParams: new URLSearchParams({ page: '1' }) } 
        };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('products');
    });

    test('POST /api/admin/products - geçerli verilerle ürün oluşturur ve 201 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test Ürün', price: 100, stock: 50, category_id: 1 })
        };
        const response = await POST(req);
        expect(response.status).toBe(201);
    });
});
