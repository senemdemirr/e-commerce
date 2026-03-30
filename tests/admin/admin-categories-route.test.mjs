import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Categories Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/categories/route.js');
        GET = module.GET;
        POST = module.POST;
    });

    // --- GET ---
    test('GET /api/admin/categories - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } }; // Mock auth
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/categories - tüm kategorileri alt kategorileriyle döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
    });

    // --- POST ---
    test('POST /api/admin/categories - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/categories - eksik alanlarla 400 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test' }) // slug eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/categories - geçerli verilerle 201 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Elektronik', slug: 'elektronik' })
        };
        const response = await POST(req);
        expect(response.status).toBe(201);
    });
});
