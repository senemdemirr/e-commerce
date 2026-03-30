import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Login Route (API)', () => {
    let POST;

    beforeEach(async () => {
        jest.resetModules();
        // app/api/admin/login/route.js dosyasındaki POST fonksiyonunu yüklüyoruz
        const module = await loadFresh('app/api/admin/login/route.js');
        POST = module.POST;
    });

    test('POST /api/admin/login - email alanı eksikse 400 döner', async () => {
        const req = {
            json: async () => ({ password: 'password123' }) // email eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/login - şifre alanı eksikse 400 döner', async () => {
        const req = {
            json: async () => ({ email: 'admin@example.com' }) // şifre eksik
        };
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    test('POST /api/admin/login - email veritabanında yoksa 401 döner', async () => {
        const req = {
            json: async () => ({ email: 'nonexistent@example.com', password: 'password123' })
        };
        const response = await POST(req);
        // Güvenlik gereği genelde 401 döneriz, ancak mevcudiyet kontrolü için 401 veya 404 beklebiliriz.
        expect(response.status).toBe(401);
    });

    test('POST /api/admin/login - şifre yanlışsa 401 döner', async () => {
        const req = {
            json: async () => ({ email: 'admin@example.com', password: 'wrongpassword' })
        };
        const response = await POST(req);
        expect(response.status).toBe(401);
    });

    test('POST /api/admin/login - kullanıcı admin değilse 403 döner', async () => {
        const req = {
            json: async () => ({ email: 'user@example.com', password: 'password123' }) // geçerli kullanıcı ama admin değil
        };
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/login - tüm bilgiler doğru ve admin ise 200 döner', async () => {
        const req = {
            json: async () => ({ email: 'admin@example.com', password: 'password123' })
        };
        const response = await POST(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
    });
});
