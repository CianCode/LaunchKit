import {
  adminClient,
  emailOTPClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "@/env";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
  plugins: [
    emailOTPClient(),
    adminClient(),
    twoFactorClient(),
    organizationClient(),
  ],
});
