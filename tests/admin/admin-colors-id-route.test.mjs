import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Color ID Route', () => {
    let PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/colors/[id]/route.js');
        PUT = routeModule.PUT;
        DELETE = routeModule.DELETE;
    });

    test('PUT /api/admin/colors/[id] - non-admin gets 403', async () => {
        const req = {
            headers: { get: () => 'customer' },
            json: async () => ({ name: 'New Name', hex: '#111827' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/colors/[id] - admin cannot write', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'New Name', hex: '#111827' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/colors/[id] - updates color', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'Jet Black', hex: '#000000' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.name).toBe('Jet Black');
        expect(data.hex).toBe('#000000');
    });

    test('PUT /api/admin/colors/[id] - works with async params', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'Jet Black', hex: '#000000' }),
        };
        const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
        expect(response.status).toBe(200);
    });

    test('PUT /api/admin/colors/[id] - invalid hex returns 400', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'Jet Black', hex: '#XYZXYZ' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
    });

    test('PUT /api/admin/colors/[id] - missing color returns 404', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'Jet Black', hex: '#000000' }),
        };
        const response = await PUT(req, { params: { id: '99999' } });
        expect(response.status).toBe(404);
    });

    test('PUT /api/admin/colors/[id] - same data returns updated false', async () => {
        const req = {
            headers: { get: () => 'superadmin' },
            json: async () => ({ name: 'Midnight Black', hex: '#111827' }),
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.updated).toBe(false);
    });

    test('DELETE /api/admin/colors/[id] - non-admin gets 403', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await DELETE(req, { params: { id: '2' } });
        expect(response.status).toBe(403);
    });

    test('DELETE /api/admin/colors/[id] - admin cannot delete', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '2' } });
        expect(response.status).toBe(403);
    });

    test('DELETE /api/admin/colors/[id] - used colors cannot be deleted', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(409);
    });

    test('DELETE /api/admin/colors/[id] - deletes unused color', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: { id: '2' } });
        expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/colors/[id] - works with async params', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: Promise.resolve({ id: '2' }) });
        expect(response.status).toBe(200);
    });
});
