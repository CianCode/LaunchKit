import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  emailOTP,
  organization as organizationPlugin,
  twoFactor as twoFactorPlugin,
} from "better-auth/plugins";
import { db } from "@/db";
import { clientEnv, serverEnv } from "@/env";

const APP_NAME = clientEnv.NEXT_PUBLIC_PROJECT_NAME;
const SECONDS_PER_MINUTE = 60;
const OTP_EXPIRY_MINUTES = 5;
const OTP_EXPIRY_SECONDS = SECONDS_PER_MINUTE * OTP_EXPIRY_MINUTES;

export const auth = betterAuth({
  appName: APP_NAME,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    twoFactorPlugin(),
    organizationPlugin(),
    admin(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      expiresIn: OTP_EXPIRY_SECONDS,
      // biome-ignore lint/suspicious/useAwait: Required by better-auth interface
      sendVerificationOTP: async ({
        email: _email,
        otp: _otp,
        type: _type,
      }: {
        email: string;
        otp: string;
        type: "sign-in" | "email-verification" | "forget-password";
      }): Promise<void> => {
        const subjectMap = {
          "sign-in": "Sign In",
          "email-verification": "Email Verification",
          "forget-password": "Password Reset",
        };

        console.log(`[OTP] ${subjectMap[_type]} - ${APP_NAME}`);
        console.log(`[OTP] Email: ${_email}`);
        console.log(`[OTP] Code: ${_otp}`);
        console.log(`[OTP] Expires in: ${OTP_EXPIRY_MINUTES} minutes`);
      },
    }),
  ],
});
