import { pool } from './lib/db.js';
async function run() {
  const result = await pool.query('SELECT * FROM campaigns');
  console.log(result.rows);
  process.exit(0);
}
run();
