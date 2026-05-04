import 'server-only';
import { Pool } from 'pg';

/**
 * Server-only Postgres pool. Set DATABASE_URL (e.g. postgresql://user:pass@host:5432/dbname).
 * Matches docs/database-schema-and-postgres-migration.md (public schema).
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});
