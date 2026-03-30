import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Subcategory ID Route', () => {
    let PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/subcategories/[id]/route.js');
        PUT = module.PUT;
        DELETE = module.DELETE;
    });

    // --- PUT: Alt Kategori Güncelleme ---
    test('PUT /api/admin/subcategories/[id] - geçerli verilerle günceller ve 200 döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            json: async () => ({ 
                name: 'Yeni Alt İsim', 
                slug: 'yeni-alt-slug', 
                category_id: 2 // Başka BİR tekil kategoriye taşıma
            })
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.category_id).toBe(2); // Tekil olarak güncellendiğini doğrulama
    });
    test('PUT /api/admin/subcategories/[id] - name eksikse 400 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ category_id: 1, slug: 'test-slug' }) // name eksik
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
    });
    test('PUT /api/admin/subcategories/[id] - category_id eksikse 400 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test', slug: 'test-slug' }) // category_id eksik
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
    });
    test('PUT /api/admin/subcategories/[id] - slug eksikse 400 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test', category_id: 1 }) // slug eksik
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
    });

    test('PUT /api/admin/subcategories/[id] - slug alanı Türkçe karakter içeremez (400 döner)', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Moda', slug: 'ayakkabı-modası', category_id: 1 }) // 'ı' var
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
    });

    test('PUT /api/admin/subcategories/[id] - id geçersizse 404 döner', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Test', slug: 'test', category_id: 1 })
        };
        const response = await PUT(req, { params: { id: '999999' } });
        expect(response.status).toBe(404);
    });

    test('PUT /api/admin/subcategories/[id] - veriler aynıysa güncelleme yapmaz (updated: false)', async () => {
        const req = {
            headers: { get: () => 'admin' },
            json: async () => ({ name: 'Eski İsim', slug: 'eski-slug', category_id: 1 })
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.updated).toBe(false);
    });

    test('DELETE /api/admin/subcategories/[id] - siler ve 200 döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });
});
