"use client";

import { AlertCircleIcon, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForgotPassword } from "@/hooks/auth/use-forgot-password";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/validations/auth";
import { Alert, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type ResetPasswordFormProps = {
  /** The email address for password reset */
  email: string;
  /** The verified OTP code */
  otp: string;
  /** Callback fired when password is successfully reset */
  onPasswordReset?: () => void;
};

/**
 * A form component for resetting the user's password after OTP verification.
 * Displays password and confirm password fields with validation.
 *
 * @param {ResetPasswordFormProps} props - The component props
 * @returns {JSX.Element} The reset password form component
 *
 * @example
 * ```tsx
 * const handlePasswordReset = () => {
 *   console.log("Password reset successfully");
 *   router.push("/login");
 * };
 *
 * <ResetPasswordForm
 *   email="user@example.com"
 *   otp="123456"
 *   onPasswordReset={handlePasswordReset}
 * />
 * ```
 */
export function ResetPasswordForm({
  email,
  otp,
  onPasswordReset,
}: ResetPasswordFormProps) {
  const { resetPassword, isLoading, error, success } = useForgotPassword();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({
      password: "",
      confirmPassword: "",
    });

    // Validate form data
    const validation = resetPasswordSchema.safeParse(formData);

    if (!validation.success) {
      // Extract and set field-specific errors
      const errors = validation.error.flatten().fieldErrors;
      setFieldErrors({
        password: errors.password?.[0] || "",
        confirmPassword: errors.confirmPassword?.[0] || "",
      });
      return;
    }

    // Type-safe validated data
    const validatedData: ResetPasswordInput = validation.data;

    // Reset password with OTP
    await resetPassword({
      email,
      otp,
      password: validatedData.password,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Trigger callback when success changes to true
  useEffect(() => {
    if (success && onPasswordReset) {
      onPasswordReset();
    }
  }, [success, onPasswordReset]);

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-2xl">Reset your password</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Enter your new password below
          </p>
        </div>
        <Field data-invalid={!!fieldErrors.password}>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              aria-invalid={!!fieldErrors.password}
              disabled={isLoading}
              id="password"
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={formData.password}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="mr-2 size-4" />
                  ) : (
                    <Eye className="mr-2 size-4" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {showPassword ? "Hide password" : "Show password"}
                </TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          {fieldErrors.password && (
            <FieldError>{fieldErrors.password}</FieldError>
          )}
        </Field>
        <Field data-invalid={!!fieldErrors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              aria-invalid={!!fieldErrors.confirmPassword}
              disabled={isLoading}
              id="confirmPassword"
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              placeholder="••••••••"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="mr-2 size-4" />
                  ) : (
                    <Eye className="mr-2 size-4" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          {fieldErrors.confirmPassword && (
            <FieldError>{fieldErrors.confirmPassword}</FieldError>
          )}
        </Field>
        <Field>
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Spinner />
                Resetting password...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </Field>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
      </FieldGroup>
    </form>
  );
}
