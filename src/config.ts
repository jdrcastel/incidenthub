import { z } from "zod";

// Validate environment variables once at startup, so a missing or wrong
// value fails fast with a clear message instead of a mystery error later.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
});

export const config = envSchema.parse(process.env);
