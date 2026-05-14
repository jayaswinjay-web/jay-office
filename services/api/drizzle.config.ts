import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "../../packages/schema/src/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://jay:jay_dev_password@localhost:5432/jay_office",
  },
  verbose: true,
  strict: true,
})
