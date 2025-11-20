"use client";

import { AlertCircleIcon, Eye, EyeOff, Info, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
import { useRegister } from "@/hooks/auth/use-register";
import { type RegisterInput, registerSchema } from "@/validations/auth";
import { Alert, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

/**
 * RegisterForm component provides a complete user registration interface.
 *
 * Features:
 * - Email and password registration with validation
 * - OAuth registration (GitHub and Google)
 * - Real-time field validation with error messages
 * - Password and confirm password fields with visibility toggles
 * - Full name collection
 * - Loading states for async operations
 * - Automatic redirect to email verification page
 * - Login page redirect for existing users
 *
 * @component
 * @example
 * ```tsx
 * <RegisterForm />
 * ```
 *
 * @remarks
 * This component uses the `useRegister` hook for registration logic.
 * Form validation is handled using Zod schema (`registerSchema`).
 * Upon successful registration, users are redirected to the email verification page.
 * OAuth registrations redirect to the dashboard upon success.
 *
 * @returns A form component for user registration
 */
export function RegisterForm() {
  const router = useRouter();
  const { register, registerWithOAuth, isLoading, error } = useRegister();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Handles form submission for user registration.
   * Validates form data using Zod schema and creates a new user account.
   * Redirects to email verification page upon successful registration.
   *
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Validate form data
    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
      // Extract and set field-specific errors
      const errors = validation.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0] || "",
        email: errors.email?.[0] || "",
        password: errors.password?.[0] || "",
        confirmPassword: errors.confirmPassword?.[0] || "",
      });
      return;
    }

    // Type-safe validated data
    const validatedData: RegisterInput = validation.data;

    // Register user with email and password
    await register({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Redirect to verification page
    router.push(
      `/verify-email?email=${encodeURIComponent(validatedData.email)}`
    );
  };

  /**
   * Handles OAuth registration with external providers.
   * Redirects to dashboard upon success, or back to register page on error.
   *
   * @param provider - The OAuth provider to use ("github" or "google")
   */
  const handleOAuthRegister = async (provider: "github" | "google") => {
    await registerWithOAuth(provider, {
      callbackURL: "/dashboard",
      errorCallbackURL: "/register",
    });
  };

  /**
   * Handles input field changes and clears field-specific errors.
   *
   * @param field - The name of the field being updated
   * @param value - The new value for the field
   */
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
          <h1 className="font-bold text-2xl">Create your account</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Enter your email below to create your account
          </p>
        </div>
        <Field data-invalid={!!fieldErrors.name}>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <InputGroup>
            <InputGroupInput
              aria-invalid={!!fieldErrors.name}
              disabled={isLoading}
              id="name"
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="John Doe"
              type="text"
              value={formData.name}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger type="button">
                  <Info className="mr-2 size-4" />
                </TooltipTrigger>
                <TooltipContent>Enter your first and last name</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
        </Field>
        <Field data-invalid={!!fieldErrors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupInput
              aria-invalid={!!fieldErrors.email}
              disabled={isLoading}
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
        <Field data-invalid={!!fieldErrors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
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
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Field>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
        <Field className="grid grid-cols-2 gap-4">
          <Button
            disabled={isLoading}
            onClick={() => handleOAuthRegister("github")}
            type="button"
            variant="outline"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <title>Github</title>
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Sign up with Github</span>
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => handleOAuthRegister("google")}
            type="button"
            variant="outline"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <title>Google</title>
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Sign up with Google</span>
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Already have an account? <a href="/login">Sign in</a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
