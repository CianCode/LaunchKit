"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type SignOutOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
};

type UseSignOutReturn = {
  signOut: (options?: SignOutOptions) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook for signing out the current user.
 *
 * @returns {UseSignOutReturn} An object containing signOut function and state
 *
 * @example
 * ```tsx
 * const { signOut, isLoading, error } = useSignOut();
 *
 * await signOut({
 *   onSuccess: () => console.log("Signed out successfully"),
 *   onError: (error) => console.error("Sign out failed", error),
 *   redirectTo: "/login"
 * });
 * ```
 */
export function useSignOut(): UseSignOutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Signs out the current user and optionally handles callbacks and redirects.
   *
   * @param {SignOutOptions} [options] - Optional configuration for sign out behavior
   * @param {Function} [options.onSuccess] - Callback function to execute on successful sign out
   * @param {Function} [options.onError] - Callback function to execute on sign out error
   * @param {string} [options.redirectTo] - URL to redirect after successful sign out
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await signOut({
   *   onSuccess: () => {
   *     console.log("User signed out");
   *   },
   *   redirectTo: "/login"
   * });
   * ```
   */
  const signOut = async (options?: SignOutOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            options?.onSuccess?.();
            if (options?.redirectTo) {
              window.location.href = options.redirectTo;
            }
          },
          onError: (ctx) => {
            const errorMessage = ctx.error.message || "Failed to sign out";
            setError(errorMessage);
            options?.onError?.(new Error(errorMessage));
          },
        },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      options?.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signOut,
    isLoading,
    error,
  };
}
