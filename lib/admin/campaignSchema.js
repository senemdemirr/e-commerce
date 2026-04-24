import { pool } from '../db.js';

let campaignSchemaReadyPromise = null;

export async function ensureCampaignSchema() {
    if (!campaignSchemaReadyPromise) {
        campaignSchemaReadyPromise = (async () => {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS campaigns (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    code VARCHAR(80) NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
                    discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
                    starts_at TIMESTAMP,
                    ends_at TIMESTAMP,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    usage_limit INT,
                    used_count INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                ALTER TABLE campaigns
                ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
                ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
                ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
                ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS usage_limit INT,
                ADD COLUMN IF NOT EXISTS used_count INT NOT NULL DEFAULT 0,
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);

            await pool.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_code_unique
                ON campaigns (UPPER(code))
            `);

            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_campaigns_status_dates
                ON campaigns (is_active, starts_at, ends_at)
            `);
        })().catch((error) => {
            campaignSchemaReadyPromise = null;
            throw error;
        });
    }

    await campaignSchemaReadyPromise;
}
