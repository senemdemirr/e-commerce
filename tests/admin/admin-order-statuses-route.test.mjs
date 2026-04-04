import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Order Statuses Route', () => {
    let GET;

    beforeEach(async () => {
        jest.resetModules();
    });

    async function loadRouteWithMock(queryMock) {
        jest.unstable_mockModule('@/lib/db', () => ({
            pool: { query: queryMock },
        }));

        const module = await loadFresh('app/api/admin/order-statuses/route.js');
        return module.GET;
    }

    test('GET /api/admin/order-statuses - status sayilari ve kart ozeti doner', async () => {
        const queryMock = jest.fn().mockResolvedValue({
            rows: [
                { id: 8, code: 'order_received', title: 'Order Received', count: 1 },
                { id: 9, code: 'preparing', title: 'Preparing', count: 2 },
                { id: 10, code: 'shipped', title: 'Shipped', count: 3 },
                { id: 11, code: 'delivered', title: 'Delivered', count: 4 },
                { id: 12, code: 'cancelled', title: 'Cancelled', count: 5 },
            ],
        });

        GET = await loadRouteWithMock(queryMock);
        const response = await GET({ headers: { get: () => 'admin' } });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.statuses).toEqual([
            { id: 8, title: 'Order Received', count: 1 },
            { id: 9, title: 'Preparing', count: 2 },
            { id: 10, title: 'Shipped', count: 3 },
            { id: 11, title: 'Delivered', count: 4 },
            { id: 12, title: 'Cancelled', count: 5 },
        ]);
        expect(data.summary).toEqual({
            total: 15,
            pending: 1,
            processing: 2,
            completed: 4,
        });
        expect(data.totalOrders).toBe(15);
        expect(queryMock).toHaveBeenCalledTimes(1);
    });

    test('GET /api/admin/order-statuses - admin olmayan kullanıcı 403 alır', async () => {
        const queryMock = jest.fn();
        GET = await loadRouteWithMock(queryMock);

        const response = await GET({ headers: { get: () => 'customer' } });
        expect(response.status).toBe(403);
        expect(queryMock).not.toHaveBeenCalled();
    });
});
