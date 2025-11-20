"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type LoginData = {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
};

type UseLoginReturn = {
  login: (data: LoginData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
};

/**
 * Hook for user authentication with email and password.
 *
 * @returns {UseLoginReturn} An object containing login function and state
 *
 * @example
 * ```tsx
 * const { login, isLoading, error, success } = useLogin();
 *
 * await login({
 *   email: "john@example.com",
 *   password: "SecurePassword123",
 *   rememberMe: true,
 *   callbackURL: "/dashboard"
 * });
 *
 * if (success) {
 *   // User is authenticated
 * }
 * ```
 */
export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Authenticates a user with email and password.
   *
   * @param {LoginData} data - The login credentials
   * @param {string} data.email - The user's email address
   * @param {string} data.password - The user's password
   * @param {boolean} [data.rememberMe=true] - Keep session active after browser close
   * @param {string} [data.callbackURL] - URL to redirect after successful login
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await login({
   *   email: "john@example.com",
   *   password: "SecurePassword123",
   *   rememberMe: true
   * });
   * ```
   */
  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        callbackURL: data.callbackURL,
      });

      if (signInError) {
        setError(signInError.message || "Failed to sign in");
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
    login,
    isLoading,
    error,
    success,
  };
}
