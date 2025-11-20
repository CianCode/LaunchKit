import { z } from "zod";

/** Minimum length required for passwords */
const PASSWORD_MIN_LENGTH = 8;

/** Minimum length required for user names */
const NAME_MIN_LENGTH = 2;

/** Maximum length required for user names */
const NAME_MAX_LENGTH = 100;

/** Otp length */
const OTP_LENGTH = 6;

/**
 * Validation schema for user registration
 *
 * @property {string} name - User's full name (2-100 characters, letters/spaces/hyphens/apostrophes only)
 * @property {string} email - User's email address (must be valid email format)
 * @property {string} password - User's password (min 8 chars, requires uppercase, lowercase, number, and special character)
 * @property {string} confirmPassword - Password confirmation (must match password)
 *
 * @example
 * ```typescript
 * const result = registerSchema.safeParse({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "SecurePass123!",
 *   confirmPassword: "SecurePass123!"
 * });
 * ```
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(NAME_MIN_LENGTH, {
        message: `Name must be at least ${NAME_MIN_LENGTH} characters`,
      })
      .max(NAME_MAX_LENGTH, { message: "Name must not exceed 100 characters" })
      .regex(/^[a-zA-Z\s'-]+$/, {
        message:
          "Name can only contain letters, spaces, hyphens, and apostrophes",
      }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Validation schema for user login
 *
 * @property {string} email - User's email address
 * @property {string} password - User's password
 *
 * @example
 * ```typescript
 * const result = loginSchema.safeParse({
 *   email: "john@example.com",
 *   password: "SecurePass123!"
 * });
 * ```
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

/**
 * Validation schema for forgot password request
 *
 * @property {string} email - User's email address to send password reset link
 *
 * @example
 * ```typescript
 * const result = forgotPasswordSchema.safeParse({
 *   email: "john@example.com"
 * });
 * ```
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

/**
 * Validation schema for resetting password
 *
 * @property {string} password - New password (min 8 chars, requires uppercase, lowercase, number, and special character)
 * @property {string} confirmPassword - Password confirmation (must match password)
 *
 * @example
 * ```typescript
 * const result = resetPasswordSchema.safeParse({
 *   password: "NewSecurePass123!",
 *   confirmPassword: "NewSecurePass123!"
 * });
 * ```
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Validation schema for OTP verification
 *
 * @property {string} otp - 6-digit one-time password (numbers only)
 *
 * @example
 * ```typescript
 * const result = otpVerificationSchema.safeParse({
 *   otp: "123456"
 * });
 * ```
 */
export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(OTP_LENGTH, { message: `OTP must be exactly ${OTP_LENGTH} digits` })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

/**
 * TypeScript type inferred from registerSchema
 * @typedef {Object} RegisterInput
 */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * TypeScript type inferred from loginSchema
 * @typedef {Object} LoginInput
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * TypeScript type inferred from forgotPasswordSchema
 * @typedef {Object} ForgotPasswordInput
 */
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * TypeScript type inferred from resetPasswordSchema
 * @typedef {Object} ResetPasswordInput
 */
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * TypeScript type inferred from otpVerificationSchema
 * @typedef {Object} OtpVerificationInput
 */
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
