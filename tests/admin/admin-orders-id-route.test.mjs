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
                rows: [{ id: 7, order_number: 'ORD123', status_title: 'Beklemede', status_updated_by_admin_email: null }],
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
                rows: [{ id: 24, email: 'admin@example.com', name: 'Admin', surname: null, role: 'admin' }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 3, title: 'Kargoda' }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ order_number: 'ORD123', status: 3, status_updated_by_admin_id: 24 }],
            });
        ({ PATCH } = await loadRouteWithMock(queryMock));
        const req = {
            headers: { get: () => 'admin' },
            cookies: {
                get: () => ({ value: `admin-session-token:${Buffer.from('admin@example.com').toString('base64')}` }),
            },
            json: async () => ({ status: '3', statusUpdateNote: 'Kargoya verildi' })
        };
        const response = await PATCH(req, { params: Promise.resolve({ orderNumber: 'ORD123' }) });
        expect(response.status).toBe(200);
        expect(queryMock).toHaveBeenLastCalledWith(
            `UPDATE orders_table
            SET
                status = $1,
                status_updated_by_admin_id = $2,
                status_update_note = $3,
                status_updated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE order_number = $4
            RETURNING *`,
            [3, 24, 'Kargoya verildi', 'ORD123']
        );
    });

    test('PATCH /api/admin/orders/[orderNumber] - sadece status ve statusUpdateNote alanlari guncellenebilir', async () => {
        const queryMock = jest.fn();
        ({ PATCH } = await loadRouteWithMock(queryMock));
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ status: 'shipped', statusUpdateNote: 'Not', total_amount: 5000, user_id: 10 })
        };
        const response = await PATCH(req, { params: Promise.resolve({ orderNumber: 'ORD123' }) });
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(queryMock).not.toHaveBeenCalled();
    });

    test('PATCH /api/admin/orders/[orderNumber] - admin session yoksa 401 döner', async () => {
        const queryMock = jest.fn();
        ({ PATCH } = await loadRouteWithMock(queryMock));
        const req = {
            headers: { get: () => 'admin' },
            cookies: { get: () => null },
            json: async () => ({ status: '3' }),
        };

        const response = await PATCH(req, { params: Promise.resolve({ orderNumber: 'ORD123' }) });
        expect(response.status).toBe(401);
        expect(queryMock).not.toHaveBeenCalled();
    });
});
