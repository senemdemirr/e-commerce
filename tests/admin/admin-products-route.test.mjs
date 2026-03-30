import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Products Route', () => {
    let GET, POST;

    beforeEach(async () => {
        jest.resetModules();
        const module = await loadFresh('app/api/admin/products/route.js');
        GET = module.GET;
        POST = module.POST;
    });

    const createMockRequest = (overrides = {}, deleteKeys = []) => {
        const data = new Map([
            ['title', 'Test Ürün'],
            ['description', 'Açıklama'],
            ['sku', 'TEST-123'],
            ['price', '200.90'],
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
                keys: () => data.keys(),
                values: () => data.values(),
            })
        };
    };

    test('GET /api/admin/products - admin olmayan kullanıcı 403 alır', async () => {
        const req = { headers: { get: () => 'customer' } };
        const response = await GET(req);
        expect(response.status).toBe(403);
    });

    test('GET /api/admin/products - tüm ürünleri pagination ile döner', async () => {
        const req = { 
            headers: { get: () => 'admin' },
            nextUrl: { searchParams: new URLSearchParams({ page: '1' }) } 
        };
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('products');
    });

    test('POST /api/admin/products - geçerli verilerle (FormData) ürün oluşturur ve 201 döner', async () => {
        const req = createMockRequest();
        const response = await POST(req);
        expect(response.status).toBe(201);
    });

    test('POST /api/admin/products - title eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['title']);
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/title/i);
    });

    test('POST /api/admin/products - description eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['description']);
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/description/i);
    });

    test('POST /api/admin/products - sku eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['sku']);
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/sku/i);
    });

    test('POST /api/admin/products - sku Türkçe karakter içeriyorsa 400 döner', async () => {
        const req = createMockRequest({ sku: 'TEST-ŞKÜ' });
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/türkçe|turkish|karakter/i);
    });

    test('POST /api/admin/products - price eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['price']);
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/price/i);
    });

    test('POST /api/admin/products - price formatı hatalıysa (virgüllü veya harf) 400 döner', async () => {
        const reqInvalid1 = createMockRequest({ price: '200,90' });
        const response1 = await POST(reqInvalid1);
        expect(response1.status).toBe(400);
        const data1 = await response1.json();
        expect(data1.error).toMatch(/price|fiyat|format/i);
        
        const reqInvalid2 = createMockRequest({ price: 'abc' });
        const response2 = await POST(reqInvalid2);
        expect(response2.status).toBe(400);
    });

    test('POST /api/admin/products - alt kategori (subcategory_id) eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['subcategory_id']);
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/subcategory_id|kategori/i);
    });

    test('POST /api/admin/products - alt kategori (subcategory_id) birden fazla (dizi) olamaz, olursa 400 döner', async () => {
        const req = createMockRequest({ subcategory_id: ['1', '2'] });
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/subcategory_id|kategori|dizi|array/i);
    });

    test('POST /api/admin/products - brand eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['brand']);
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/brand/i);
    });

    test('POST /api/admin/products - image eksikse 400 döner', async () => {
        const req = createMockRequest({}, ['image']);
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/image|resim/i);
    });

    test('POST /api/admin/products - image boyutu 3MB dan büyükse 400 döner', async () => {
        const req = createMockRequest({ 
            image: { name: 'large.png', size: 4 * 1024 * 1024, type: 'image/png', arrayBuffer: async () => new ArrayBuffer(10) } 
        }); // 4MB
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/boyut|size|3MB/i);
    });
});
