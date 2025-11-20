/**
 * Type-safe environment variable configuration
 * This file validates and exports all environment variables used in the application.
 *
 * Client-side variables (NEXT_PUBLIC_*) are available in the browser.
 * Server-side variables are only available in server-side code.
 */

const isServer = typeof window === "undefined";

/**
 * Gets an environment variable and throws if it's not defined
 */
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

/**
 * Gets a server-only environment variable
 * Returns empty string on client to prevent errors
 */
function getServerEnvVar(key: string, fallback?: string): string {
  if (!isServer) {
    return "";
  }
  return getEnvVar(key, fallback);
}

/**
 * Gets an optional server-only environment variable
 */
function getOptionalServerEnvVar(key: string, fallback?: string): string {
  if (!isServer) {
    return "";
  }
  return getOptionalEnvVar(key, fallback) ?? "";
}

/**
 * Gets a boolean server-only environment variable
 */
function getServerBooleanEnvVar(key: string, fallback = false): boolean {
  if (!isServer) {
    return fallback;
  }
  return getBooleanEnvVar(key, fallback);
}

/**
 * Gets a number server-only environment variable
 */
function getServerNumberEnvVar(key: string, fallback?: number): number {
  if (!isServer) {
    return fallback ?? 0;
  }
  return getNumberEnvVar(key, fallback);
}

/**
 * Gets an optional environment variable
 */
function getOptionalEnvVar(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

/**
 * Parses a boolean environment variable
 */
function getBooleanEnvVar(key: string, fallback = false): boolean {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  return value === "true" || value === "1";
}

/**
 * Parses a number environment variable
 */
function getNumberEnvVar(key: string, fallback?: number): number {
  const value = process.env[key];
  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} is not a valid number: ${value}`
    );
  }
  return parsed;
}

/**
 * Client-side environment variables (NEXT_PUBLIC_*)
 * These are safe to expose to the browser
 */
export const clientEnv = {
  NEXT_PUBLIC_APP_URL: getEnvVar(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000"
  ),
  NEXT_PUBLIC_PROJECT_NAME: getEnvVar("NEXT_PUBLIC_PROJECT_NAME", "LaunchKit"),
  NEXT_PUBLIC_SUPPORT_EMAIL: getEnvVar(
    "NEXT_PUBLIC_SUPPORT_EMAIL",
    "contact@launchkit.com"
  ),
} as const;

/**
 * Server-side environment variables
 * These are NOT exposed to the browser
 */
export const serverEnv = {
  // Node environment
  NODE_ENV: getEnvVar("NODE_ENV", "development") as
    | "development"
    | "production"
    | "test",

  // Database
  DATABASE_URL: getServerEnvVar("DATABASE_URL"),
  DIRECT_DATABASE_URL: getOptionalServerEnvVar("DIRECT_DATABASE_URL"),
  DATABASE_LOGGING: getServerBooleanEnvVar("DATABASE_LOGGING", false),

  // Better Auth
  BETTER_AUTH_SECRET: getServerEnvVar("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getServerEnvVar("BETTER_AUTH_URL", "http://localhost:3000"),
  BETTER_AUTH_TRUST_HOST: getServerBooleanEnvVar(
    "BETTER_AUTH_TRUST_HOST",
    true
  ),
  BETTER_AUTH_SESSION_MAX_AGE: getServerNumberEnvVar(
    "BETTER_AUTH_SESSION_MAX_AGE",
    604_800
  ),

  // OAuth Providers
  GITHUB_CLIENT_ID: getServerEnvVar("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET: getServerEnvVar("GITHUB_CLIENT_SECRET"),
  GOOGLE_CLIENT_ID: getOptionalServerEnvVar("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getOptionalServerEnvVar("GOOGLE_CLIENT_SECRET"),

  // Email (Resend)
  RESEND_API_KEY: getOptionalServerEnvVar("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: getOptionalServerEnvVar("RESEND_FROM_EMAIL"),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: getServerNumberEnvVar(
    "RATE_LIMIT_MAX_REQUESTS",
    100
  ),
  RATE_LIMIT_WINDOW_MS: getServerNumberEnvVar("RATE_LIMIT_WINDOW_MS", 60_000),

  // Docker Postgres (for reference, not typically used in app code)
  POSTGRES_USER: getOptionalServerEnvVar("POSTGRES_USER"),
  POSTGRES_PASSWORD: getOptionalServerEnvVar("POSTGRES_PASSWORD"),
  POSTGRES_DB: getOptionalServerEnvVar("POSTGRES_DB"),
  POSTGRES_PORT: getOptionalServerEnvVar("POSTGRES_PORT"),
} as const;

/**
 * Type definitions for environment variables
 */
export type ClientEnv = typeof clientEnv;
export type ServerEnv = typeof serverEnv;
