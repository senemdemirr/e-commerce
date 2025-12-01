import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    user: "senemdemir",
    host: "localhost",
    database: "ecommerce_db",
    password: "8+257Yq",
    port: 5432
});