import pkg from "pg";
import { readBooleanEnv } from "@/lib/env";

const { Pool } = pkg;

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (readBooleanEnv("DATABASE_SSL", process.env.NODE_ENV === "production")) {
  poolConfig.ssl = {
    rejectUnauthorized: readBooleanEnv("DATABASE_SSL_REJECT_UNAUTHORIZED", false),
  };
}

export const pool = new Pool(poolConfig);
