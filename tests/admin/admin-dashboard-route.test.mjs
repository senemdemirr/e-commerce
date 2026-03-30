import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Dashboard Route', () => {
    let GET;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/dashboard/route.js');
        GET = module.GET;
    });

    test('GET /api/admin/dashboard - tüm istatistikleri döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        
        expect(data).toHaveProperty('totalOrders');
        expect(data).toHaveProperty('totalRevenue');
        expect(data).toHaveProperty('totalCustomers');
        expect(data).toHaveProperty('totalProducts');
        expect(data).toHaveProperty('recentOrders');
    });
});
