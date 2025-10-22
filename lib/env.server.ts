// Server-only environment variable loader and validator
// This module should only be imported in server-side code (API routes, server components)

import { z } from 'zod';

const EnvSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
});

type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates and returns server environment variables.
 * Caches the result after first validation.
 * @throws {Error} If validation fails
 */
export function getServerEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = EnvSchema.safeParse({
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  });

  if (!result.success) {
    const errors = result.error.format();
    throw new Error(
      `Server environment validation failed: ${JSON.stringify(errors)}`
    );
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Checks if server environment is configured without throwing
 */
export function isServerEnvConfigured(): boolean {
  try {
    getServerEnv();
    return true;
  } catch {
    return false;
  }
}
