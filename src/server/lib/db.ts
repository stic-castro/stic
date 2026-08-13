import { Pool } from 'pg';

// Using a global variable in development to prevent connection exhaustion from hot reloads
const globalForPg = global as unknown as { pgPool: Pool | undefined };

export const db =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add additional settings if needed, e.g., max connections
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = db;
