import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqlClient: postgres.Sql | null = null;
let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is not set. Cloud SQL / PostgreSQL connection will not work.");
    return null;
  }

  if (!sqlClient) {
    sqlClient = postgres(connectionString, { max: 10 });
    dbInstance = drizzle(sqlClient, { schema });
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        await sqlClient`
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            icon_name TEXT NOT NULL,
            color TEXT,
            is_custom BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        `;

        await sqlClient`
          CREATE TABLE IF NOT EXISTS movements (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            amount DOUBLE PRECISION NOT NULL,
            category_id TEXT NOT NULL,
            description TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            fixed_payment_id TEXT
          );
        `;

        await sqlClient`
          CREATE TABLE IF NOT EXISTS fixed_payments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            amount DOUBLE PRECISION NOT NULL,
            due_day INTEGER NOT NULL,
            category_id TEXT NOT NULL,
            notes TEXT,
            reminder_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        `;

        await sqlClient`
          CREATE TABLE IF NOT EXISTS fixed_payment_records (
            id TEXT PRIMARY KEY,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            fixed_payment_id TEXT NOT NULL,
            is_paid BOOLEAN DEFAULT false NOT NULL,
            paid_date TEXT,
            movement_id TEXT,
            override_amount DOUBLE PRECISION,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        `;
        try { await sqlClient`ALTER TABLE fixed_payment_records ADD COLUMN override_amount DOUBLE PRECISION;`; } catch (e) {}

        await sqlClient`
          CREATE TABLE IF NOT EXISTS budget_limits (
            category_id TEXT PRIMARY KEY,
            monthly_limit DOUBLE PRECISION NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        `;
        console.log("PostgreSQL database tables verified / created successfully.");
      } catch (err) {
        console.error("Failed to initialize PostgreSQL schema:", err);
      }
    })();
  }

  await initPromise;
  return dbInstance;
}

export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("DATABASE_URL is not set. Cloud SQL / PostgreSQL connection will not work.");
      return null;
    }
    sqlClient = postgres(connectionString, { max: 10 });
    dbInstance = drizzle(sqlClient, { schema });
  }
  return dbInstance;
}
