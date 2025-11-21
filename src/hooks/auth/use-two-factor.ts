"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type EnableTwoFactorReturn = {
  totpURI?: string;
  backupCodes?: string[];
};

type VerifyTwoFactorData = {
  code: string;
};

type UseTwoFactorReturn = {
  // Enable 2FA
  enableTwoFactor: (password: string) => Promise<EnableTwoFactorReturn | null>;
  isEnabling: boolean;
  enableError: string | null;

  // Verify and activate 2FA
  verifyTwoFactor: (data: VerifyTwoFactorData) => Promise<void>;
  isVerifying: boolean;
  verifyError: string | null;
  verifySuccess: boolean;

  // Disable 2FA
  disableTwoFactor: (password: string) => Promise<void>;
  isDisabling: boolean;
  disableError: string | null;
  disableSuccess: boolean;
};

/**
 * Hook for managing two-factor authentication (2FA) with Better Auth.
 *
 * This hook provides functions to enable, verify, and disable 2FA using TOTP
 * (Time-based One-Time Password) authentication.
 *
 * @returns {UseTwoFactorReturn} An object containing 2FA functions and state
 *
 * @example
 * ```tsx
 * const {
 *   enableTwoFactor,
 *   isEnabling,
 *   enableError,
 *   verifyTwoFactor,
 *   isVerifying,
 *   verifySuccess,
 *   disableTwoFactor,
 *   isDisabling
 * } = useTwoFactor();
 *
 * // Step 1: Enable 2FA
 * const result = await enableTwoFactor("userPassword123");
 * if (result) {
 *   // Display result.totpURI as QR code
 *   // Save result.backupCodes securely
 * }
 *
 * // Step 2: Verify with code from authenticator app
 * await verifyTwoFactor({ code: "123456" });
 *
 * // Disable 2FA
 * await disableTwoFactor("userPassword123");
 * ```
 */
export function useTwoFactor(): UseTwoFactorReturn {
  // Enable 2FA state
  const [isEnabling, setIsEnabling] = useState(false);
  const [enableError, setEnableError] = useState<string | null>(null);

  // Verify 2FA state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Disable 2FA state
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [disableSuccess, setDisableSuccess] = useState(false);

  /**
   * Enables two-factor authentication for the current user.
   *
   * This generates a TOTP URI (for QR code) and backup codes. The user needs to
   * verify with a code from their authenticator app to complete activation.
   *
   * @param {string} password - The user's current password for verification
   * @returns {Promise<EnableTwoFactorReturn | null>} TOTP URI and backup codes, or null on error
   *
   * @example
   * ```tsx
   * const result = await enableTwoFactor("myPassword123");
   * if (result) {
   *   // Display QR code: result.totpURI
   *   // Show backup codes: result.backupCodes
   * }
   * ```
   */
  const enableTwoFactor = async (
    password: string
  ): Promise<EnableTwoFactorReturn | null> => {
    setIsEnabling(true);
    setEnableError(null);

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });

      if (error) {
        setEnableError(
          error.message || "Failed to enable two-factor authentication"
        );
        return null;
      }

      return {
        totpURI: data?.totpURI,
        backupCodes: data?.backupCodes,
      };
    } catch (err) {
      setEnableError(
        err instanceof Error
          ? err.message
          : "An error occurred while enabling 2FA"
      );
      return null;
    } finally {
      setIsEnabling(false);
    }
  };

  /**
   * Verifies and activates two-factor authentication.
   *
   * After enabling 2FA, the user must verify with a code from their authenticator
   * app to complete the activation process.
   *
   * @param {VerifyTwoFactorData} data - The verification data
   * @param {string} data.code - The 6-digit code from the authenticator app
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await verifyTwoFactor({ code: "123456" });
   * if (verifySuccess) {
   *   // 2FA is now active
   * }
   * ```
   */
  const verifyTwoFactor = async (data: VerifyTwoFactorData) => {
    setIsVerifying(true);
    setVerifyError(null);
    setVerifySuccess(false);

    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: data.code,
      });

      if (error) {
        setVerifyError(error.message || "Failed to verify code");
        return;
      }

      setVerifySuccess(true);
    } catch (err) {
      setVerifyError(
        err instanceof Error
          ? err.message
          : "An error occurred during verification"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Disables two-factor authentication for the current user.
   *
   * @param {string} password - The user's current password for verification
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await disableTwoFactor("myPassword123");
   * if (disableSuccess) {
   *   // 2FA has been disabled
   * }
   * ```
   */
  const disableTwoFactor = async (password: string) => {
    setIsDisabling(true);
    setDisableError(null);
    setDisableSuccess(false);

    try {
      const { error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) {
        setDisableError(
          error.message || "Failed to disable two-factor authentication"
        );
        return;
      }

      setDisableSuccess(true);
    } catch (err) {
      setDisableError(
        err instanceof Error
          ? err.message
          : "An error occurred while disabling 2FA"
      );
    } finally {
      setIsDisabling(false);
    }
  };

  return {
    enableTwoFactor,
    isEnabling,
    enableError,
    verifyTwoFactor,
    isVerifying,
    verifyError,
    verifySuccess,
    disableTwoFactor,
    isDisabling,
    disableError,
    disableSuccess,
  };
}
