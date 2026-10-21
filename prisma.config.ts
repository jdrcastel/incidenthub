import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Read directly (not with env()) so `prisma generate` also works before .env exists;
  // migrate commands still fail with a clear message if it's missing.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
