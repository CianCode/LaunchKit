"use client";

import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Alert, AlertTitle } from "@/components/ui/alert";

function LoginContent() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  return (
    <AuthLayout>
      {resetSuccess && (
        <Alert className="mb-4">
          <CheckCircle />
          <AlertTitle>
            Password reset successfully! You can now sign in with your new
            password.
          </AlertTitle>
        </Alert>
      )}
      <LoginForm />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
