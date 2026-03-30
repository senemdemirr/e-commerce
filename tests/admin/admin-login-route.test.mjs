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

    test('POST /api/admin/login - geçerli bilgiler ve admin rolü ile 200 döner', async () => {
        const req = {
            json: async () => ({ email: 'admin@example.com', password: 'password123' })
        };
        
        const response = await POST(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
    });

    test('POST /api/admin/login - yanlış şifre ile 401 döner', async () => {
        const req = {
            json: async () => ({ email: 'admin@example.com', password: 'wrongpassword' })
        };
        
        const response = await POST(req);
        expect(response.status).toBe(401);
    });

    test('POST /api/admin/login - admin rolü olmayan kullanıcı ile 403 döner', async () => {
        const req = {
            json: async () => ({ email: 'user@example.com', password: 'password123' })
        };
        
        const response = await POST(req);
        expect(response.status).toBe(403);
    });

    test('POST /api/admin/login - eksik bilgiler ile 400 döner', async () => {
        const req = {
            json: async () => ({ email: 'admin@example.com' }) // şifre eksik
        };
        
        const response = await POST(req);
        expect(response.status).toBe(400);
    });
});
