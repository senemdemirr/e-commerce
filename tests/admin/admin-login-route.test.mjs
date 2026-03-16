import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- POST: Admin Login ---

test.todo('POST /api/admin/login - geçerli credentials ile 200 ve token döner');

test.todo('POST /api/admin/login - geçersiz credentials ile 401 döner');

test.todo('POST /api/admin/login - eksik alanlarla 400 döner');

test.todo('POST /api/admin/login - admin olmayan kullanıcı ile 403 döner');
