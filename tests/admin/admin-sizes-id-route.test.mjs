import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Size ID Route', () => {
    let PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/sizes/[id]/route.js');
        PUT = routeModule.PUT;
        DELETE = routeModule.DELETE;
    });

    test('PUT /api/admin/sizes/[id] - non-admin gets 403', async () => {
        const req = {
            headers: { get: () => 'customer' },
            json: async () => ({ name: 'L' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/sizes/[id] - admin cannot write', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'L' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/sizes/[id] - updates size', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'SMALL' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.name).toBe('SMALL');
    });

    test('PUT /api/admin/sizes/[id] - works with async params', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'SMALL' }),
        };
        const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
        expect(response.status).toBe(200);
    });

    test('PUT /api/admin/sizes/[id] - missing size returns 404', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'SMALL' }),
        };
        const response = await PUT(req, { params: { id: '99999' } });
        expect(response.status).toBe(404);
    });

    test('PUT /api/admin/sizes/[id] - same data returns updated false', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'S' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.updated).toBe(false);
    });

    test('DELETE /api/admin/sizes/[id] - non-admin gets 403', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await DELETE(req, { params: { id: '3' } });
        expect(response.status).toBe(403);
    });

    test('DELETE /api/admin/sizes/[id] - admin cannot delete', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '3' } });
        expect(response.status).toBe(403);
    });

    test('DELETE /api/admin/sizes/[id] - used sizes cannot be deleted', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(409);
    });

    test('DELETE /api/admin/sizes/[id] - deletes unused size', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: { id: '3' } });
        expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/sizes/[id] - works with async params', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: Promise.resolve({ id: '3' }) });
        expect(response.status).toBe(200);
    });
});
