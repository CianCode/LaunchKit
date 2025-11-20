"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type ResetPasswordData = {
  email: string;
  otp: string;
  password: string;
};

type UseForgotPasswordReturn = {
  sendResetOTP: (email: string) => Promise<void>;
  checkResetOTP: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  isOTPValid: boolean | null;
};

/**
 * Hook for managing the forgot password flow with OTP verification.
 *
 * @returns {UseForgotPasswordReturn} An object containing functions and state for password reset
 *
 * @example
 * ```tsx
 * const { sendResetOTP, checkResetOTP, resetPassword, isLoading, error, success } = useForgotPassword();
 *
 * // Step 1: Send OTP to user's email
 * await sendResetOTP("user@example.com");
 *
 * // Step 2: Optionally check if OTP is valid
 * const isValid = await checkResetOTP("user@example.com", "123456");
 *
 * // Step 3: Reset password with OTP
 * await resetPassword({
 *   email: "user@example.com",
 *   otp: "123456",
 *   password: "NewSecurePassword123"
 * });
 * ```
 */
export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOTPValid, setIsOTPValid] = useState<boolean | null>(null);

  /**
   * Sends a password reset OTP to the specified email address.
   *
   * @param {string} email - The email address to send the reset OTP to
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await sendResetOTP("user@example.com");
   * if (success) {
   *   console.log("Reset OTP sent successfully");
   * }
   * ```
   */
  const sendResetOTP = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: otpError } = await authClient.forgetPassword.emailOtp({
        email,
      });

      if (otpError) {
        setError(otpError.message || "Failed to send reset OTP");
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
   * Validates a password reset OTP without consuming it.
   * This is an optional step before resetting the password.
   *
   * @param {string} email - The email address associated with the reset request
   * @param {string} otp - The OTP code to validate
   * @returns {Promise<boolean>} Returns true if OTP is valid, false otherwise
   *
   * @example
   * ```tsx
   * const isValid = await checkResetOTP("user@example.com", "123456");
   * if (isValid) {
   *   // Proceed to password reset
   * }
   * ```
   */
  const checkResetOTP = async (
    email: string,
    otp: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsOTPValid(null);

    try {
      const { error: checkError } =
        await authClient.emailOtp.checkVerificationOtp({
          email,
          otp,
          type: "forget-password",
        });

      if (checkError) {
        setError(checkError.message || "Invalid OTP");
        setIsOTPValid(false);
        return false;
      }

      setIsOTPValid(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsOTPValid(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resets the user's password using a verified OTP.
   *
   * @param {ResetPasswordData} data - The reset password data
   * @param {string} data.email - The user's email address
   * @param {string} data.otp - The verified OTP code
   * @param {string} data.password - The new password (min 8 characters)
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await resetPassword({
   *   email: "user@example.com",
   *   otp: "123456",
   *   password: "NewSecurePassword123"
   * });
   * if (success) {
   *   // Password reset successful, redirect to login
   * }
   * ```
   */
  const resetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetError } = await authClient.emailOtp.resetPassword({
        email: data.email,
        otp: data.otp,
        password: data.password,
      });

      if (resetError) {
        setError(resetError.message || "Failed to reset password");
        return;
      }

      await authClient.revokeOtherSessions();

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendResetOTP,
    checkResetOTP,
    resetPassword,
    isLoading,
    error,
    success,
    isOTPValid,
  };
}
