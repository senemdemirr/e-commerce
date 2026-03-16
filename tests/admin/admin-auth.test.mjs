import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- Admin Yetkilendirme Testleri ---

test.todo('isAdmin - admin rolüne sahip kullanıcı için true döner');

test.todo('isAdmin - admin rolü olmayan kullanıcı için false döner');

test.todo('isAdmin - session yoksa false döner');

test.todo('requireAdmin - admin olmayan kullanıcı için 403 döner');

test.todo('requireAdmin - admin kullanıcı için null döner (devam et)');
