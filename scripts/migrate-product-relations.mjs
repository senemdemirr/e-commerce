import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function parseEnvFile(content) {
    const env = {};

    for (const line of content.split('\n')) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const separatorIndex = trimmed.indexOf('=');

        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"'))
            || (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        env[key] = value;
    }

    return env;
}

async function loadEnvironment() {
    const candidates = [
        path.join(projectRoot, '.env.development.local'),
        path.join(projectRoot, '.env.production.local'),
    ];

    for (const candidate of candidates) {
        try {
            const content = await fs.readFile(candidate, 'utf8');
            const parsed = parseEnvFile(content);

            Object.entries(parsed).forEach(([key, value]) => {
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            });
        } catch {
            // Ignore missing env files.
        }
    }
}

async function main() {
    await loadEnvironment();

    const { ensureProductVariantSchema } = await import('../lib/productSchema.js');
    const { pool } = await import('../lib/db.js');

    await ensureProductVariantSchema();

    const client = await pool.connect();

    try {
        const productsResult = await client.query(`
            SELECT COUNT(*)::int AS total
            FROM products
        `);
        const productTablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name IN ('colors', 'sizes', 'details')
            ORDER BY table_name
        `);

        console.log(`Migrated ${productsResult.rows[0]?.total || 0} products to normalized colors/sizes/details tables.`);
        console.table(productTablesResult.rows);
    } finally {
        client.release();
        await pool.end();
    }
}

await main();
