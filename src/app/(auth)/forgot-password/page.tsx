"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { OtpForm } from "@/components/auth/otp-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { useForgotPassword } from "@/hooks/auth/use-forgot-password";

type ForgotPasswordStep = "request" | "verify" | "reset";

const OTP_LENGTH = 6;

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const { sendResetOTP, isLoading, error } = useForgotPassword();

  const [step, setStep] = useState<ForgotPasswordStep>(
    emailParam ? "verify" : "request"
  );
  const [email, setEmail] = useState(emailParam || "");
  const [otpValue, setOtpValue] = useState("");

  const handleOTPSent = (sentEmail: string) => {
    setEmail(sentEmail);
    setStep("verify");
  };

  const handleOTPVerified = (otp: string) => {
    setOtpValue(otp);
    setStep("reset");
  };

  const handlePasswordReset = () => {
    // Redirect to login page after successful password reset
    router.push("/login?reset=success");
  };

  const handleResendOTP = async () => {
    if (email) {
      await sendResetOTP(email);
    }
  };

  const handleOTPSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpValue.length === OTP_LENGTH) {
      handleOTPVerified(otpValue);
    }
  };

  return (
    <AuthLayout>
      {step === "request" && <ForgotPasswordForm onOTPSent={handleOTPSent} />}
      {step === "verify" && (
        <OtpForm
          email={email}
          error={error}
          isLoading={isLoading}
          onChange={setOtpValue}
          onResend={handleResendOTP}
          onSubmit={handleOTPSubmit}
          value={otpValue}
        />
      )}
      {step === "reset" && (
        <ResetPasswordForm
          email={email}
          onPasswordReset={handlePasswordReset}
          otp={otpValue}
        />
      )}
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
