import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- Pagination Helper ---

test.todo('paginate - sayfa ve limit ile doğru offset hesaplar');

test.todo('paginate - negatif sayfa numarası için varsayılan değer kullanır');

test.todo('paginate - limit 0 veya negatifse varsayılan değer kullanır');

// --- Search Clause Builder ---

test.todo('buildSearchClause - arama terimi ile WHERE koşulu oluşturur');

test.todo('buildSearchClause - boş arama terimi için boş string döner');

test.todo('buildSearchClause - birden fazla kolon için OR ile birleştirir');

// --- Admin Response Format ---

test.todo('formatAdminResponse - data, total, page, limit ile standart yanıt oluşturur');

test.todo('formatAdminResponse - toplam sayfa sayısını doğru hesaplar');
