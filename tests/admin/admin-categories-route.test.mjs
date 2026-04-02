import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Categories Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/categories/route.js');
        GET = routeModule.GET;
        POST = routeModule.POST;
    });

    // --- GET ---
    test('GET /api/admin/categories - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/categories - kategorileri (varsa alt kategorileriyle) döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();

        expect(Array.isArray(data)).toBe(true);
        // Eğer data varsa, subcategories alanının (boş olsa bile) var olduğunu kontrol ediyoruz
        if (data.length > 0) {
            expect(data[0]).toHaveProperty('subcategories');
            expect(data[0]).toHaveProperty('activate');
            expect([0, 1]).toContain(data[0].activate);
            expect(Array.isArray(data[0].subcategories)).toBe(true);
        }
    });

    // --- POST: Kategori Oluşturma ---
    test('POST /api/admin/categories - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/categories - name alanı eksikse 400 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ slug: 'test-kategori' }) // name eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/categories - slug alanı eksikse 400 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test Kategori' }) // slug eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/categories - slug alanı Türkçe karakter içeremez (400 döner)', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Elektronik', slug: 'elektronik-ürünler' }) // 'ü' ve 'ü' geçersiz
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/categories - activate alanını da kaydederek 201 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Elektronik', slug: 'elektronik', activate: 0 })
        };
        const response = await POST(req);
        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.activate).toBe(0);
    });
});
