import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

describe('Admin Helpers', () => {
    let helpers;

    beforeEach(async () => {
        jest.resetModules();
        helpers = await loadFresh('lib/admin/helpers.js');
    });

    // --- Pagination Helper ---
    test('paginate - sayfa ve limit ile doğru offset hesaplar', () => {
        const result = helpers.paginate(2, 10);
        expect(result.offset).toBe(10);
        expect(result.limit).toBe(10);
    });

    // --- Search Clause Builder ---
    test('buildSearchClause - güvenli WHERE koşulu ve parametreler oluşturur', () => {
        const result = helpers.buildSearchClause('iphone', ['name', 'description']);

        expect(result.clause).toBe('AND (name ILIKE $1 OR description ILIKE $2)');
        expect(result.values).toEqual(['%iphone%', '%iphone%']);
    });

    test('buildSearchClause - searchTerm boşsa boş clause döner', () => {
        const result = helpers.buildSearchClause('', ['name', 'description']);

        expect(result.clause).toBe('');
        expect(result.values).toEqual([]);
    });

    // --- Admin Response Format ---
    test('formatAdminResponse - data ve meta bilgileriyle standart yanıt oluşturur', () => {
        const data = [{ id: 1 }];
        const result = helpers.formatAdminResponse(data, 100, 1, 10);
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
        expect(result.meta.totalPages).toBe(10);
    });
});
