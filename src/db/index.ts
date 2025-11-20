/**
 * Database Connection
 * Drizzle ORM with Postgres.js driver
 * @see https://orm.drizzle.team/docs/get-started-postgresql#postgresjs
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/env";
import { account } from "./schema/tables/account";
import { invitation } from "./schema/tables/invitation";
import { member } from "./schema/tables/member";
import { organization } from "./schema/tables/organization";
import { session } from "./schema/tables/session";
import { twoFactor } from "./schema/tables/two-factor";
import { user } from "./schema/tables/user";
import { verification } from "./schema/tables/verification";

const queryClient = postgres(serverEnv.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, {
  schema: {
    user,
    session,
    account,
    verification,
    twoFactor,
    organization,
    member,
    invitation,
  },
  logger: serverEnv.DATABASE_LOGGING,
});

export { queryClient };
