"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { useSignOut } from "@/hooks/auth/use-sign-out";

/**
 * Props for the LogoutButton component.
 *
 * @extends Omit<ComponentProps<"button">, "onClick">
 * @extends VariantProps<typeof buttonVariants>
 */
type LogoutButtonProps = Omit<ComponentProps<"button">, "onClick"> &
  VariantProps<typeof buttonVariants> & {
    /**
     * URL to redirect to after successful logout.
     * @default "/login"
     */
    redirectTo?: string;
    /**
     * Callback function executed after successful logout.
     */
    onSuccess?: () => void;
    /**
     * Callback function executed if logout fails.
     * @param error - The error that occurred during logout
     */
    onError?: (error: Error) => void;
  };

/**
 * LogoutButton component that handles user sign-out functionality.
 *
 * This component provides a button that logs out the current user and optionally
 * redirects them to a specified page. It shows loading state during the logout process.
 *
 * @component
 * @example
 * Basic usage:
 * ```tsx
 * <LogoutButton />
 * ```
 *
 * @example
 * With custom redirect:
 * ```tsx
 * <LogoutButton redirectTo="/goodbye" />
 * ```
 *
 * @example
 * With different variant and callbacks:
 * ```tsx
 * <LogoutButton
 *   variant="destructive"
 *   onSuccess={() => console.log("Logged out successfully")}
 *   onError={(err) => console.error("Logout failed:", err)}
 * >
 *   Sign Out
 * </LogoutButton>
 * ```
 *
 * @param props - Component props
 * @param props.redirectTo - URL to redirect to after logout (default: "/login")
 * @param props.onSuccess - Callback for successful logout
 * @param props.onError - Callback for logout errors
 * @param props.children - Button content (default: "Log Out")
 * @param props.variant - Button variant style (default: "outline")
 * @param props.props - Additional button props
 *
 * @returns A button component that logs out the user when clicked
 */
export function LogoutButton({
  redirectTo = "/login",
  onSuccess,
  onError,
  children = "Log Out",
  variant = "outline",
  ...props
}: LogoutButtonProps) {
  const { signOut, isLoading } = useSignOut();

  /**
   * Handles the logout action when the button is clicked.
   * Calls the signOut function with the provided redirect and callbacks.
   */
  const handleLogout = async () => {
    await signOut({
      redirectTo,
      onSuccess,
      onError,
    });
  };

  return (
    <Button
      disabled={isLoading}
      onClick={handleLogout}
      variant={variant}
      {...props}
    >
      {isLoading ? "Logging out..." : children}
    </Button>
  );
}
