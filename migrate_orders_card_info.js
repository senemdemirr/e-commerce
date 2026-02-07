const { pool } = require('./lib/db');

async function migrate() {
    try {
        console.log("Starting migration: Adding card info columns to orders table...");
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS card_mask VARCHAR(20),
            ADD COLUMN IF NOT EXISTS card_family VARCHAR(50),
            ADD COLUMN IF NOT EXISTS card_bank VARCHAR(100);
        `);
        console.log("Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
