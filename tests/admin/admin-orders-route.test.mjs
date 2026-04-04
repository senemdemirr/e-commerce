import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Orders Route', () => {
    let GET;

    beforeEach(() => {
        jest.resetModules();
    });

    async function loadRouteWithMock(queryMock) {
        jest.unstable_mockModule('@/lib/db', () => ({
            pool: { query: queryMock },
        }));

        const routeModule = await loadFresh('app/api/admin/orders/route.js');
        return routeModule.GET;
    }

    test('GET /api/admin/orders - tüm siparişleri pagination ile döner', async () => {
        const queryMock = jest.fn()
            .mockResolvedValueOnce({
                rows: [
                    {
                        order_number: 'ORD-001',
                        shipping_full_name: 'Mehmet Demir',
                        total_amount: 2450,
                        status: 1,
                        status_title: 'Beklemede',
                    },
                ],
            })
            .mockResolvedValueOnce({
                rows: [{ count: 1 }],
            });

        GET = await loadRouteWithMock(queryMock);
        const req = { 
            headers: { get: () => 'admin' },
            nextUrl: { searchParams: new URLSearchParams({ page: '1' }) }
        };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('orders');
    });

    test('GET /api/admin/orders - admin olmayan kullanıcı 403 alır', async () => {
        const queryMock = jest.fn();
        GET = await loadRouteWithMock(queryMock);
        const req = {
            headers: { get: () => 'customer' },
            nextUrl: { searchParams: new URLSearchParams({ page: '1' }) }
        };

        const response = await GET(req);
        expect(response.status).toBe(403);
        expect(queryMock).not.toHaveBeenCalled();
    });

    test('GET /api/admin/orders - durum filtresi ile filtreleme yapar', async () => {
        const queryMock = jest.fn()
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ count: 0 }] });

        GET = await loadRouteWithMock(queryMock);
        const req = { 
            headers: { get: () => 'admin' },
            nextUrl: { searchParams: new URLSearchParams({ status: 'Tamamlandı' }) }
        };
        const response = await GET(req);
        expect(response.status).toBe(200);
        expect(queryMock).toHaveBeenCalledTimes(2);
        expect(queryMock.mock.calls[0][1]).toContain('Tamamlandı');
    });
});
