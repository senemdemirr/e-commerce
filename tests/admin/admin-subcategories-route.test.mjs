import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- GET: Alt Kategori Listeleme ---

test.todo('GET /api/admin/subcategories - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/subcategories - tüm alt kategorileri döner');

test.todo('GET /api/admin/subcategories - kategori filtresi ile döner');

// --- POST: Alt Kategori Oluşturma ---

test.todo('POST /api/admin/subcategories - admin olmayan kullanıcı 403 alır');

test.todo('POST /api/admin/subcategories - eksik alanlarla 400 döner');

test.todo('POST /api/admin/subcategories - geçerli verilerle alt kategori oluşturur ve 201 döner');

test.todo('POST /api/admin/subcategories - duplicate slug ile 409 döner');
