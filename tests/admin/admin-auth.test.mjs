import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Auth Helpers (Authorization)', () => {
    let auth;

    beforeEach(async () => {
        jest.resetModules();
        // lib/admin/auth.js dosyasındaki yetkilendirme fonksiyonlarını yüklüyoruz
        auth = await loadFresh('lib/admin/auth.js');
    });

    // --- isAdmin Testleri ---

    test('isAdmin - admin rolüne sahip kullanıcı için true döner', async () => {
        const user = { email: 'admin@example.com', role: 'admin' };
        expect(auth.isAdmin(user)).toBe(true);
    });

    test('isAdmin - admin rolü olmayan kullanıcı için false döner', async () => {
        const user = { email: 'user@example.com', role: 'customer' };
        expect(auth.isAdmin(user)).toBe(false);
    });

    test('isAdmin - kullanıcı nesnesi yoksa false döner', async () => {
        expect(auth.isAdmin(null)).toBe(false);
    });

    // --- requireAdmin Testleri ---

    test('requireAdmin - admin olmayan kullanıcı için hata (error/redirect) fırlatır', async () => {
        const user = { email: 'user@example.com', role: 'customer' };
        // Örn: Yetkisiz erişimde 403 status döndürmesi beklenir
        const result = await auth.requireAdmin({ user });
        expect(result.status).toBe(403);
    });

    test('requireAdmin - admin kullanıcı için null döner (erişime izin verilir)', async () => {
        const user = { email: 'admin@example.com', role: 'admin' };
        const result = await auth.requireAdmin({ user });
        expect(result).toBeNull();
    });
});
