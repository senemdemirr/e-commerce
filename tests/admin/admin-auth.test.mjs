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

    test('isAdmin - superadmin rolüne sahip kullanıcı için true döner', async () => {
        const user = { email: 'superadmin@example.com', role: 'superadmin' };
        expect(auth.isAdmin(user)).toBe(true);
    });

    test('canManageAdmin - superadmin rolüne sahip kullanıcı için true döner', async () => {
        const user = { email: 'superadmin@example.com', role: 'superadmin' };
        expect(auth.canManageAdmin(user)).toBe(true);
    });

    test('canManageAdmin - admin rolüne sahip kullanıcı için false döner', async () => {
        const user = { email: 'admin@example.com', role: 'admin' };
        expect(auth.canManageAdmin(user)).toBe(false);
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

    test('requireAdmin - superadmin kullanıcı için null döner (erişime izin verilir)', async () => {
        const user = { email: 'superadmin@example.com', role: 'superadmin' };
        const result = await auth.requireAdmin({ user });
        expect(result).toBeNull();
    });

    test('requireSuperAdmin - admin kullanıcı için 403 döner', async () => {
        const user = { email: 'admin@example.com', role: 'admin' };
        const result = await auth.requireSuperAdmin({ user });
        expect(result.status).toBe(403);
    });

    test('requireSuperAdmin - superadmin kullanıcı için null döner', async () => {
        const user = { email: 'superadmin@example.com', role: 'superadmin' };
        const result = await auth.requireSuperAdmin({ user });
        expect(result).toBeNull();
    });

    test('isAdminRequest - superadmin header için true döner', async () => {
        const req = {
            headers: {
                get: (key) => (key === 'role' ? 'superadmin' : null),
            },
        };
        expect(auth.isAdminRequest(req)).toBe(true);
    });

    test('isAdminRequest - customer header için false döner', async () => {
        const req = {
            headers: {
                get: (key) => (key === 'role' ? 'customer' : null),
            },
        };
        expect(auth.isAdminRequest(req)).toBe(false);
    });

    test('isSuperAdminRequest - superadmin header için true döner', async () => {
        const req = {
            headers: {
                get: (key) => (key === 'role' ? 'superadmin' : null),
            },
        };
        expect(auth.isSuperAdminRequest(req)).toBe(true);
    });

    test('isSuperAdminRequest - admin header için false döner', async () => {
        const req = {
            headers: {
                get: (key) => (key === 'role' ? 'admin' : null),
            },
        };
        expect(auth.isSuperAdminRequest(req)).toBe(false);
    });
});
