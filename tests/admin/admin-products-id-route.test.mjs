import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Product ID Route', () => {
    let GET, PUT, DELETE;

    beforeEach(async () => {
        jest.resetModules();
        const routeModule = await loadFresh('app/api/admin/products/[id]/route.js');
        GET = routeModule.GET;
        PUT = routeModule.PUT;
        DELETE = routeModule.DELETE;
    });

    const createMockRequest = (overrides = {}, deleteKeys = [], role = 'admin') => {
        const data = new Map([
            ['title', 'Güncellenmiş Ürün'],
            ['description', 'Açıklama'],
            ['sku', 'TEST-123'],
            ['price', '250.00'],
            ['brand', 'Test Brand'],
            ['subcategory_id', '1'],
            ['colors', JSON.stringify([{ name: 'Red', hex: '#FF0000' }, { name: 'Blue', hex: '#0000FF' }])],
            ['sizes', JSON.stringify(['S', 'M', 'L'])],
            ['details', JSON.stringify({
                care: ["Machine wash cold", "Tumble dry low", "Iron low heat"],
                material: ["100% Organic Cotton"],
                bullet_point: [
                    "100% Sustainable Organic Cotton",
                    "Natural dyes used",
                    "Classic fit",
                    "Reinforced seams"
                ],
                description_long: ["A sustainable and stylish choice for your daily wardrobe. Made from premium organic cotton for maximum breathability and comfort."]
            })],
            ['image', { name: 'test.png', size: 1024 * 1024, type: 'image/png', arrayBuffer: async () => new ArrayBuffer(10) }]
        ]);

        for (const [key, value] of Object.entries(overrides)) {
            data.set(key, value);
        }

        for (const key of deleteKeys) {
            data.delete(key);
        }

        return {
            headers: { get: () => role },
            formData: async () => ({
                get: (key) => {
                    const val = data.get(key);
                    return Array.isArray(val) ? val[0] : val;
                },
                getAll: (key) => {
                    const val = data.get(key);
                    if (val === undefined) return [];
                    return Array.isArray(val) ? val : [val];
                },
                has: (key) => data.has(key),
                entries: function* () {
                    for (const [k, v] of data.entries()) {
                        if (Array.isArray(v)) {
                            for (const item of v) yield [k, item];
                        } else {
                            yield [k, v];
                        }
                    }
                },
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
        const req = createMockRequest({}, [], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });

    test('PUT /api/admin/products/[id] - admin rolü ürünü güncelleyemez ve 403 alır', async () => {
        const req = createMockRequest();
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });

    test('PUT /api/admin/products/[id] - eğer üründe güncelleme yapılmadıysa (veri yoksa) database e istek gitmeden 200 döner (hata dönmez)', async () => {
        const req = { 
            headers: { get: () => 'superadmin' },
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
        const req = createMockRequest({}, ['title'], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/title/i);
    });

    test('PUT /api/admin/products/[id] - description eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['description'], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/description/i);
    });

    test('PUT /api/admin/products/[id] - sku eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['sku'], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/sku/i);
    });

    test('PUT /api/admin/products/[id] - sku Türkçe karakter içeriyorsa 400 döner', async () => {
        const req = createMockRequest({ sku: 'TEST-ŞKÜ' }, [], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/türkçe|turkish|karakter/i);
    });

    test('PUT /api/admin/products/[id] - price eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['price'], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/price/i);
    });

    test('PUT /api/admin/products/[id] - price formatı hatalıysa (virgüllü veya harf) 400 döner', async () => {
        const reqInvalid1 = createMockRequest({ price: '250,00' }, [], 'superadmin');
        const response1 = await PUT(reqInvalid1, { params: { id: '1' } });
        expect(response1.status).toBe(400);
        const data1 = await response1.json();
        expect(data1.error).toMatch(/price|fiyat|format/i);
        
        const reqInvalid2 = createMockRequest({ price: 'abc' }, [], 'superadmin');
        const response2 = await PUT(reqInvalid2, { params: { id: '1' } });
        expect(response2.status).toBe(400);
    });

    test('PUT /api/admin/products/[id] - alt kategori (subcategory_id) eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['subcategory_id'], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/subcategory_id|kategori/i);
    });

    test('PUT /api/admin/products/[id] - alt kategori (subcategory_id) birden fazla (dizi) olamaz, olursa 400 döner', async () => {
        const req = createMockRequest({ subcategory_id: ['1', '2'] }, [], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/subcategory_id|kategori|dizi|array/i);
    });

    test('PUT /api/admin/products/[id] - brand eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['brand'], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/brand/i);
    });

    test('PUT /api/admin/products/[id] - image eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['image'], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/image|resim/i);
    });

    test('PUT /api/admin/products/[id] - image boyutu 3MB dan büyükse 400 döner', async () => {
        const req = createMockRequest({ 
            image: { name: 'large.png', size: 4 * 1024 * 1024, type: 'image/png', arrayBuffer: async () => new ArrayBuffer(10) } 
        }, [], 'superadmin'); // 4MB
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/boyut|size|3MB/i);
    });

    test('PUT /api/admin/products/[id] - colors alanı geçerli bir JSON formatında değilse 400 döner', async () => {
        const req = createMockRequest({ colors: 'invalid-json' }, [], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/colors|json/i);
    });

    test('PUT /api/admin/products/[id] - colors alanı JSON dizisi (array) değilse 400 döner', async () => {
        const req = createMockRequest({ colors: '{"name": "Red"}' }, [], 'superadmin'); // Object instead of array
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/colors|dizi|array/i);
    });

    test('PUT /api/admin/products/[id] - sizes alanı geçerli bir JSON formatında değilse 400 döner', async () => {
        const req = createMockRequest({ sizes: 'invalid-json' }, [], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/sizes|json/i);
    });

    test('PUT /api/admin/products/[id] - sizes alanı JSON dizisi (array) değilse 400 döner', async () => {
        const req = createMockRequest({ sizes: '{"size": "M"}' }, [], 'superadmin'); // Object instead of array
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/sizes|dizi|array/i);
    });

    test('PUT /api/admin/products/[id] - details alanı geçerli bir JSON formatında değilse 400 döner', async () => {
        const req = createMockRequest({ details: 'invalid-json' }, [], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/details|json/i);
    });

    test('PUT /api/admin/products/[id] - details alanı JSON nesnesi (object) değilse 400 döner', async () => {
        const req = createMockRequest({ details: '["detail1", "detail2"]' }, [], 'superadmin'); // Array instead of object
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/details|nesne|object/i);
    });

    test('PUT /api/admin/products/[id] - colors JSON dizisi içindeki öğeler name ve hex objesi değilse 400 döner', async () => {
        const req = createMockRequest({ colors: JSON.stringify([{ name: 'Red' }]) }, [], 'superadmin'); // hex eksik
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/colors|name|hex/i);
    });

    test('PUT /api/admin/products/[id] - sizes dizisi içindeki öğeler string değilse 400 döner', async () => {
        const req = createMockRequest({ sizes: JSON.stringify([1, 2, 3]) }, [], 'superadmin'); // string yerine sayı
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/sizes|string/i);
    });

    test('PUT /api/admin/products/[id] - details nesnesi gerekli alan (care, material, vb.) formatlarına uymazsa 400 döner', async () => {
        const req = createMockRequest({ 
            details: JSON.stringify({ 
                care: "String gönderiyoruz ama dizi (array) olmalı", 
                material: ["Cotton"], 
                bullet_point: ["Point 1", "Point 2"], 
                description_long: ["Açıklama"] 
            }) 
        }, [], 'superadmin');
        const response = await PUT(req, { params: { id: '1' } });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/details|format|array|dizi/i);
    });

    test('DELETE /api/admin/products/[id] - ürünü siler ve 200 döner', async () => {
        const req = { headers: { get: () => 'superadmin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/products/[id] - admin rolü ürünü silemez ve 403 alır', async () => {
        const req = { headers: { get: () => 'admin' } };
        const response = await DELETE(req, { params: { id: '1' } });
        expect(response.status).toBe(403);
    });
});
