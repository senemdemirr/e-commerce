import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- PUT: Kategori Güncelleme ---

test.todo('PUT /api/admin/categories/[id] - admin olmayan kullanıcı 403 alır');

test.todo('PUT /api/admin/categories/[id] - geçerli verilerle kategoriyi günceller');

test.todo('PUT /api/admin/categories/[id] - olmayan kategori için 404 döner');

// --- DELETE: Kategori Silme ---

test.todo('DELETE /api/admin/categories/[id] - admin olmayan kullanıcı 403 alır');

test.todo('DELETE /api/admin/categories/[id] - mevcut kategoriyi siler ve 200 döner');

test.todo('DELETE /api/admin/categories/[id] - olmayan kategori için 404 döner');

test.todo('DELETE /api/admin/categories/[id] - alt kategorisi olan kategoriyi silmeye çalışırsa 400 döner');
