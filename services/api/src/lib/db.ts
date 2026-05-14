import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const client = postgres(process.env.DATABASE_URL ?? "postgresql://jay:jay_dev_password@localhost:5432/jay_office")
export const db = drizzle(client)
