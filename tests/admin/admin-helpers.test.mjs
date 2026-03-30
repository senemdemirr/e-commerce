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
    test('buildSearchClause - arama terimi ile WHERE koşulu oluşturur', () => {
        const result = helpers.buildSearchClause('iphone', ['name', 'description']);
        expect(result).toContain("OR name ILIKE '%iphone%'");
        expect(result).toContain("OR description ILIKE '%iphone%'");
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
