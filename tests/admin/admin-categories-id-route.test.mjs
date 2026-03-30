import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Category ID Route', () => {
    let PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/categories/[id]/route.js');
        PUT = module.PUT;
        DELETE = module.DELETE;
    });

    // --- PUT ---
    test('PUT /api/admin/categories/[id] - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await PUT(req);
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/categories/[id] - geçerli verilerle günceller ve 200 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Yeni Kategori', slug: 'yeni-kategori' })
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });

    test('PUT /api/admin/categories/[id] - name alanı boş olamaz (400 döner)', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: '', slug: 'kategori' })
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
    });

    test('PUT /api/admin/categories/[id] - slug alanı Türkçe karakter içeremez (400 döner)', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test', slug: 'türkçe-karakter' }) // 'ü' var
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
    });

    test('PUT /api/admin/categories/[id] - id geçersizse (olmayan kategori) 404 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test', slug: 'test' })
        };
        const response = await PUT(req, { params: { id: '999999' } });
        expect(response.status).toBe(404);
    });

    test('PUT /api/admin/categories/[id] - veriler mevcut veri ile aynıysa güncelleme yapmaz (304 veya 200 döner ama DB tetiklenmez)', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Eski İsim', slug: 'eski-slug' }) // DB'deki ile aynı varsayalım
        };
        const response = await PUT(req, { params: { id: '1' } });

        // Burada 200 de dönebiliriz ama önemli olan içerideki mantıkta 
        // rowCount'un 0 olması veya DB'ye gidilmemesi.
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.updated).toBe(false); // Mantıksal kontrol
    });

    // --- DELETE ---
    test('DELETE /api/admin/categories/[id] - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await DELETE(req);
        expect(response.status).toBe(403);
    });

    test('DELETE /api/admin/categories/[id] - siler ve 200 döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });
});
