import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Product ID Route', () => {
    let GET, PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/products/[id]/route.js');
        GET = module.GET;
        PUT = module.PUT;
        DELETE = module.DELETE;
    });

    const createMockRequest = (overrides = {}, deleteKeys = []) => {
        const data = new Map([
            ['title', 'Güncellenmiş Ürün'],
            ['description', 'Açıklama'],
            ['sku', 'TEST-123'],
            ['price', '250.00'],
            ['brand', 'Test Brand'],
            ['subcategory_id', '1'],
            ['image', { name: 'test.png', size: 1024 * 1024, type: 'image/png', arrayBuffer: async () => new ArrayBuffer(10) }]
        ]);

        for (const [key, value] of Object.entries(overrides)) {
            data.set(key, value);
        }

        for (const key of deleteKeys) {
            data.delete(key);
        }

        return {
            headers: { get: () => 'admin' },
            formData: async () => ({
                get: (key) => data.get(key),
                has: (key) => data.has(key),
                entries: () => Array.from(data.entries()),
                keys: () => Array.from(data.keys()),
                values: () => Array.from(data.values()),
            }),
            json: async () => Object.fromEntries(data)
        };
    };

    test('GET /api/admin/products/[id] - mevcut ürünü döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await GET(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('id');
    });

    test('PUT /api/admin/products/[id] - geçerli verilerle ürünü günceller (FormData)', async () => {
        const req = createMockRequest();
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });

    test('PUT /api/admin/products/[id] - eğer üründe güncelleme yapılmadıysa (veri yoksa) database e istek gitmeden 200 döner (hata dönmez)', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            formData: async () => ({
                entries: () => [],
                get: () => null,
                keys: () => []
            }),
            json: async () => ({})
        };
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data).not.toHaveProperty('error');
    });

    test('PUT /api/admin/products/[id] - title eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['title']);
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/title/i);
    });

    test('PUT /api/admin/products/[id] - description eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['description']);
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/description/i);
    });

    test('PUT /api/admin/products/[id] - sku eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['sku']);
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/sku/i);
    });

    test('PUT /api/admin/products/[id] - sku Türkçe karakter içeriyorsa 400 döner', async () => {
        const req = createMockRequest({ sku: 'TEST-ŞKÜ' });
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/türkçe|turkish|karakter/i);
    });

    test('PUT /api/admin/products/[id] - price eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['price']);
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/price/i);
    });

    test('PUT /api/admin/products/[id] - price formatı hatalıysa (virgüllü veya harf) 400 döner', async () => {
        const reqInvalid1 = createMockRequest({ price: '250,00' });
        const response1 = await PUT(reqInvalid1, { params: { id: '1' } });
        expect(response1.status).toBe(400);
        const data1 = await response1.json();
        expect(data1.error).toMatch(/price|fiyat|format/i);
        
        const reqInvalid2 = createMockRequest({ price: 'abc' });
        const response2 = await PUT(reqInvalid2, { params: { id: '1' } });
        expect(response2.status).toBe(400);
    });

    test('PUT /api/admin/products/[id] - alt kategori (subcategory_id) eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['subcategory_id']);
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/subcategory_id|kategori/i);
    });

    test('PUT /api/admin/products/[id] - brand eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['brand']);
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/brand/i);
    });

    test('PUT /api/admin/products/[id] - image eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['image']);
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/image|resim/i);
    });

    test('PUT /api/admin/products/[id] - image boyutu 3MB dan büyükse 400 döner', async () => {
        const req = createMockRequest({ 
            image: { name: 'large.png', size: 4 * 1024 * 1024, type: 'image/png', arrayBuffer: async () => new ArrayBuffer(10) } 
        }); // 4MB
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/boyut|size|3MB/i);
    });

    test('DELETE /api/admin/products/[id] - ürünü siler ve 200 döner', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });
});
