"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type OTPType = "sign-in" | "email-verification" | "forget-password";

type VerifyOTPData = {
  email: string;
  otp: string;
  type: OTPType;
};

type VerifyEmailData = {
  email: string;
  otp: string;
};

type UseOTPVerificationReturn = {
  checkOTP: (data: VerifyOTPData) => Promise<boolean>;
  verifyEmail: (data: VerifyEmailData) => Promise<void>;
  sendOTP: (email: string, type: OTPType) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  isValid: boolean | null;
};

/**
 * Universal hook for OTP verification operations.
 * Handles sending, checking, and verifying OTPs for various authentication flows.
 *
 * @returns {UseOTPVerificationReturn} An object containing OTP verification functions and state
 *
 * @example
 * ```tsx
 * const { sendOTP, checkOTP, verifyEmail, isLoading, error, isValid } = useOTPVerification();
 *
 * // Send OTP for email verification
 * await sendOTP("john@example.com", "email-verification");
 *
 * // Check if OTP is valid
 * const valid = await checkOTP({
 *   email: "john@example.com",
 *   otp: "123456",
 *   type: "email-verification"
 * });
 *
 * // Verify email with OTP
 * await verifyEmail({
 *   email: "john@example.com",
 *   otp: "123456"
 * });
 * ```
 */
export function useOTPVerification(): UseOTPVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  /**
   * Sends an OTP to the specified email address.
   *
   * @param {string} email - The email address to send the OTP to
   * @param {OTPType} type - The type of OTP ("sign-in" | "email-verification" | "forget-password")
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await sendOTP("john@example.com", "email-verification");
   * if (success) {
   *   console.log("OTP sent successfully");
   * }
   * ```
   */
  const sendOTP = async (email: string, type: OTPType) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp(
        {
          email,
          type,
        }
      );

      if (otpError) {
        setError(otpError.message || "Failed to send OTP");
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
   * Validates an OTP without consuming it.
   * This is useful for checking OTP validity before performing the actual verification.
   *
   * @param {VerifyOTPData} data - The OTP verification data
   * @param {string} data.email - The email address associated with the OTP
   * @param {string} data.otp - The OTP code to validate
   * @param {OTPType} data.type - The type of OTP being verified
   * @returns {Promise<boolean>} Returns true if OTP is valid, false otherwise
   *
   * @example
   * ```tsx
   * const isValid = await checkOTP({
   *   email: "john@example.com",
   *   otp: "123456",
   *   type: "email-verification"
   * });
   * ```
   */
  const checkOTP = async (data: VerifyOTPData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsValid(null);

    try {
      const { error: checkError } =
        await authClient.emailOtp.checkVerificationOtp({
          email: data.email,
          otp: data.otp,
          type: data.type,
        });

      if (checkError) {
        setError(checkError.message || "Invalid OTP");
        setIsValid(false);
        return false;
      }

      setIsValid(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsValid(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Completes email verification using an OTP.
   *
   * @param {VerifyEmailData} data - The email verification data
   * @param {string} data.email - The email address to verify
   * @param {string} data.otp - The OTP code for verification
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await verifyEmail({
   *   email: "john@example.com",
   *   otp: "123456"
   * });
   * if (success) {
   *   console.log("Email verified successfully");
   * }
   * ```
   */
  const verifyEmail = async (data: VerifyEmailData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: data.email,
        otp: data.otp,
      });

      if (verifyError) {
        setError(verifyError.message || "Failed to verify email");
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
    checkOTP,
    verifyEmail,
    sendOTP,
    isLoading,
    error,
    success,
    isValid,
  };
}
