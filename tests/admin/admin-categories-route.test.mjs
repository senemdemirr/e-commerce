import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- GET: Kategori Listeleme ---

test.todo('GET /api/admin/categories - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/categories - tüm kategorileri alt kategorileriyle döner');

// --- POST: Kategori Oluşturma ---

test.todo('POST /api/admin/categories - admin olmayan kullanıcı 403 alır');

test.todo('POST /api/admin/categories - eksik alanlarla 400 döner');

test.todo('POST /api/admin/categories - geçerli verilerle kategori oluşturur ve 201 döner');

test.todo('POST /api/admin/categories - duplicate slug ile 409 döner');
