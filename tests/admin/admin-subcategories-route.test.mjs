import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Subcategories Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/subcategories/route.js');
        GET = module.GET;
        POST = module.POST;
    });

    // --- POST: Alt Kategori Oluşturma ---
    test('POST /api/admin/subcategories - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/subcategories - name alanı eksikse 400 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ category_id: 1, slug: 'test-alt' }) // name eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });
    test('POST /api/admin/subcategories - category_id eksikse 400 döner (kategoriye bağlı olmalı)', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test Alt', slug: 'test-alt' }) // category_id eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });
    test('POST /api/admin/subcategories - slug alanı eksikse 400 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test Alt', category_id: 1 }) // slug eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/subcategories - slug alanı Türkçe karakter içeremez (400 döner)', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({
                name: 'Moda',
                slug: 'çocuk-modası', // 'ç' ve 'ı' geçersiz
                category_id: 1
            })
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/subcategories - geçerli verilerle 201 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({
                name: 'Test Alt Kategori',
                slug: 'test-alt',
                category_id: 1
            })
        };
        const response = await POST(req);
        expect(response.status).toBe(201);
    });
});
