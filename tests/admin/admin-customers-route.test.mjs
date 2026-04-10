import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Customers Route', () => {
    let GET;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/customers/route.js');
        GET = module.GET;
    });

    test('GET /api/admin/customers - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/customers - tüm müşterileri pagination ile döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            nextUrl: { searchParams: new URLSearchParams({ page: '1', limit: '10' }) }
        };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('customers');
        expect(data).toHaveProperty('pagination');
    });
});
