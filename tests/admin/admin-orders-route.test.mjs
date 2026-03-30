import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Orders Route', () => {
    let GET;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/orders/route.js');
        GET = module.GET;
    });

    test('GET /api/admin/orders - tüm siparişleri pagination ile döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            nextUrl: { searchParams: new URLSearchParams({ page: '1' }) }
        };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('orders');
    });

    test('GET /api/admin/orders - durum filtresi ile filtreleme yapar', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            nextUrl: { searchParams: new URLSearchParams({ status: 'delivered' }) }
        };
        const response = await GET(req);
        expect(response.status).toBe(200);
    });
});
