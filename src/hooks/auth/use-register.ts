"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type RegisterData = {
  name: string;
  email: string;
  password: string;
  image?: string;
};

type OAuthProvider = "github" | "google" | "discord";

type RegisterWithOAuthOptions = {
  callbackURL?: string;
  errorCallbackURL?: string;
};

type UseRegisterReturn = {
  register: (data: RegisterData) => Promise<void>;
  registerWithOAuth: (
    provider: OAuthProvider,
    options?: RegisterWithOAuthOptions
  ) => Promise<void>;
  sendVerificationOTP: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
};

/**
 * Hook for user registration with email/password or OAuth providers.
 *
 * @returns {UseRegisterReturn} An object containing registration functions and state
 *
 * @example
 * ```tsx
 * const { register, registerWithOAuth, sendVerificationOTP, isLoading, error, success } = useRegister();
 *
 * // Option 1: Register with email/password
 * await register({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "SecurePassword123",
 *   image: "https://example.com/avatar.jpg" // optional
 * });
 *
 * // Option 2: Register with OAuth (GitHub, Google, etc.)
 * await registerWithOAuth("github", {
 *   callbackURL: "/dashboard",
 *   errorCallbackURL: "/register"
 * });
 *
 * // Step 3: Send verification OTP (for email/password registration)
 * if (success) {
 *   await sendVerificationOTP("john@example.com");
 * }
 * ```
 */
export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Registers a new user with email and password.
   *
   * @param {RegisterData} data - The registration data
   * @param {string} data.name - The user's full name
   * @param {string} data.email - The user's email address
   * @param {string} data.password - The user's password (min 8 characters)
   * @param {string} [data.image] - Optional profile image URL
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await register({
   *   name: "John Doe",
   *   email: "john@example.com",
   *   password: "SecurePassword123"
   * });
   * ```
   */
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        image: data.image,
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to register");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initiates OAuth registration flow with the specified provider.
   * This will redirect the user to the OAuth provider's authorization page.
   *
   * @param {OAuthProvider} provider - The OAuth provider to use ("github" | "google" | "discord" | "microsoft")
   * @param {RegisterWithOAuthOptions} [options] - Optional configuration
   * @param {string} [options.callbackURL] - URL to redirect after successful authentication
   * @param {string} [options.errorCallbackURL] - URL to redirect on authentication error
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * // Register with GitHub
   * await registerWithOAuth("github", {
   *   callbackURL: "/dashboard",
   *   errorCallbackURL: "/register?error=oauth"
   * });
   *
   * // Register with Google
   * await registerWithOAuth("google");
   * ```
   */
  const registerWithOAuth = async (
    provider: OAuthProvider,
    options?: RegisterWithOAuthOptions
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: options?.callbackURL || "/",
        errorCallbackURL: options?.errorCallbackURL || "/register",
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with OAuth"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sends an email verification OTP to the specified email address.
   *
   * @param {string} email - The email address to send the verification OTP to
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await sendVerificationOTP("john@example.com");
   * if (success) {
   *   console.log("Verification OTP sent successfully");
   * }
   * ```
   */
  const sendVerificationOTP = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp(
        {
          email,
          type: "email-verification",
        }
      );

      if (otpError) {
        setError(otpError.message || "Failed to send verification OTP");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    registerWithOAuth,
    sendVerificationOTP,
    isLoading,
    error,
    success,
  };
}
