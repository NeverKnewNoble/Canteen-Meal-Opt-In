import 'server-only';
import { Pool, PoolClient } from 'pg';

/**
 * Server-only Postgres pool. Set DATABASE_URL (e.g. postgresql://user:pass@host:5432/dbname).
 * Matches docs/database-schema-and-postgres-migration.md (public schema).
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
