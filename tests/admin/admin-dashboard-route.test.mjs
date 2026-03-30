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

        // Kartlarda (Card) gösterilecek temel istatistikler
        expect(data).toHaveProperty('totalSales');
        expect(data).toHaveProperty('newOrders');
        expect(data).toHaveProperty('totalCustomers');
        expect(data).toHaveProperty('dailyVisitors');
        expect(data).toHaveProperty('totalProducts');

        // Liste şeklinde gösterilecek veriler
        expect(data).toHaveProperty('recentOrders');
        expect(Array.isArray(data.recentOrders)).toBe(true);

        expect(data).toHaveProperty('topCategories');
        expect(Array.isArray(data.topCategories)).toBe(true);
    });
});
