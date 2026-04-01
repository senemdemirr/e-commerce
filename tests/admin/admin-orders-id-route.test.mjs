import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Order ID Route', () => {
    let GET, PATCH;

    beforeEach(() => {
        jest.resetModules();
    });

    async function loadRouteWithMock(queryMock) {
        jest.unstable_mockModule('@/lib/db', () => ({
            pool: { query: queryMock },
        }));

        const routeModule = await loadFresh('app/api/admin/orders/[orderNumber]/route.js');
        return {
            GET: routeModule.GET,
            PATCH: routeModule.PATCH,
        };
    }

    test('GET /api/admin/orders/[orderNumber] - sipariş detayını döner', async () => {
        const queryMock = jest.fn()
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 7, order_number: 'ORD123', status_title: 'Beklemede' }],
            })
            .mockResolvedValueOnce({
                rows: [{ id: 1, item_title: 'Nike Air Max', quantity: 1 }],
            });
        ({ GET } = await loadRouteWithMock(queryMock));
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req, { params: Promise.resolve({ orderNumber: 'ORD123' }) });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('order_number');
        expect(data).toHaveProperty('items');
        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    test('PATCH /api/admin/orders/[orderNumber] - geçerli durum ile günceller', async () => {
        const queryMock = jest.fn()
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 3, title: 'Kargoda' }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ order_number: 'ORD123', status: 3 }],
            });
        ({ PATCH } = await loadRouteWithMock(queryMock));
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ status: '3' })
        };
        const response = await PATCH(req, { params: Promise.resolve({ orderNumber: 'ORD123' }) });
        expect(response.status).toBe(200);
        expect(queryMock).toHaveBeenLastCalledWith(
            'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_number = $2 RETURNING *',
            [3, 'ORD123']
        );
    });

    test('PATCH /api/admin/orders/[orderNumber] - sadece status alanı güncellenebilir diğer alanlar hata verir', async () => {
        const queryMock = jest.fn();
        ({ PATCH } = await loadRouteWithMock(queryMock));
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ status: 'shipped', total_amount: 5000, user_id: 10 })
        };
        const response = await PATCH(req, { params: Promise.resolve({ orderNumber: 'ORD123' }) });
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(queryMock).not.toHaveBeenCalled();
    });
});
