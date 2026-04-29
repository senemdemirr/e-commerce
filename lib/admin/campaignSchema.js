import { pool } from '../db.js';

let campaignSchemaReadyPromise = null;
const CAMPAIGN_TIMESTAMP_COLUMNS = ['starts_at', 'ends_at', 'created_at', 'updated_at'];

export function buildCampaignTimestampTypeMigrationQuery(columns = CAMPAIGN_TIMESTAMP_COLUMNS) {
    const migrationBlocks = columns.map((columnName) => `
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = current_schema()
                            AND table_name = 'campaigns'
                            AND column_name = '${columnName}'
                            AND data_type <> 'timestamp with time zone'
                    ) THEN
                        ALTER TABLE campaigns
                        ALTER COLUMN ${columnName} TYPE TIMESTAMPTZ USING ${columnName} AT TIME ZONE 'UTC';
                    END IF;
    `).join('');

    return `
                DO $$
                BEGIN
${migrationBlocks}
                END $$;
            `;
}

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
                    starts_at TIMESTAMPTZ,
                    ends_at TIMESTAMPTZ,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    usage_limit INT,
                    used_count INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                ALTER TABLE campaigns
                ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
                ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
                ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
                ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS usage_limit INT,
                ADD COLUMN IF NOT EXISTS used_count INT NOT NULL DEFAULT 0,
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            `);

            await pool.query(buildCampaignTimestampTypeMigrationQuery());

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
