import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Logout Route', () => {
    test('POST /api/admin/logout - admin_token çerezini temizler', async () => {
        const routeModule = await loadFresh('app/api/admin/logout/route.js');
        const response = await routeModule.POST();

        expect(response.status).toBe(200);

        const setCookie = response.headers.get('set-cookie');
        expect(setCookie).toContain('admin_token=');
        expect(setCookie.toLowerCase()).toContain('max-age=0');
        expect(setCookie).toContain('Path=/');
    });
});
