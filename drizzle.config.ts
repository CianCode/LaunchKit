/**
 * Drizzle ORM Configuration
 * Configuration for Drizzle Kit (migrations & introspection)
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */

// Load .env.local so CLI tools (drizzle-kit, scripts) can read DATABASE_URL
// Next.js loads .env.local automatically for the app, but separate Node
// processes (like drizzle-kit) don't — so load it explicitly here.
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { serverEnv } from "../../launchkit-project/src/env";

const isProduction = serverEnv.NODE_ENV === "production";
const envFile = isProduction ? ".env.production" : ".env.local";

config({ path: envFile });

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
  schema: ["./src/db/schema/**/*"],
  out: "./drizzle/migrations",
  verbose: true,
  strict: true,
  tablesFilter: ["*"],
});
