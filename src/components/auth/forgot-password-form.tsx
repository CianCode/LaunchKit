"use client";

import { AlertCircleIcon, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import {
  Field,
  FieldDescription,
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
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/validations/auth";
import { Alert, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type ForgotPasswordFormProps = {
  /** Callback fired when OTP is successfully sent */
  onOTPSent?: (email: string) => void;
};

/**
 * A form component for requesting a password reset OTP.
 * Validates the email and sends a verification code to the user's email address.
 *
 * @param {ForgotPasswordFormProps} props - The component props
 * @returns {JSX.Element} The forgot password form component
 *
 * @example
 * ```tsx
 * const handleOTPSent = (email: string) => {
 *   console.log(`OTP sent to ${email}`);
 *   // Navigate to OTP verification step
 * };
 *
 * <ForgotPasswordForm onOTPSent={handleOTPSent} />
 * ```
 */
export function ForgotPasswordForm({ onOTPSent }: ForgotPasswordFormProps) {
  const { sendResetOTP, isLoading, error, success } = useForgotPassword();

  const [formData, setFormData] = useState({
    email: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({
      email: "",
    });

    // Validate form data
    const validation = forgotPasswordSchema.safeParse(formData);

    if (!validation.success) {
      // Extract and set field-specific errors
      const errors = validation.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0] || "",
      });
      return;
    }

    // Type-safe validated data
    const validatedData: ForgotPasswordInput = validation.data;

    // Send reset OTP
    await sendResetOTP(validatedData.email);

    // If successful, notify parent component
    if (onOTPSent) {
      onOTPSent(validatedData.email);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-2xl">Forgot your password?</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Enter your email address and we&apos;ll send you a verification code
          </p>
        </div>
        <Field data-invalid={!!fieldErrors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupInput
              aria-invalid={!!fieldErrors.email}
              disabled={isLoading || success}
              id="email"
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="m@example.com"
              type="email"
              value={formData.email}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger type="button">
                  <Mail className="mr-2 size-4" />
                </TooltipTrigger>
                <TooltipContent>Enter your email address</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
        </Field>
        <Field>
          <Button disabled={isLoading || success} type="submit">
            {isLoading ? (
              <>
                <Spinner />
                Sending code...
              </>
            ) : (
              "Send verification code"
            )}
          </Button>
        </Field>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle />
            <AlertTitle>
              Verification code sent! Check your email and enter the code below.
            </AlertTitle>
          </Alert>
        )}
        <FieldDescription className="text-center">
          Remember your password? <a href="/login">Sign in</a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
