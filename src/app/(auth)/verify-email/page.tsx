"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OtpForm } from "@/components/auth/otp-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { useOTPVerification } from "@/hooks/auth/use-otp-verification";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otpValue, setOtpValue] = useState("");

  const { verifyEmail, sendOTP, isLoading, error, success } =
    useOTPVerification();

  useEffect(() => {
    if (success) {
      router.push("/");
    }
  }, [success, router]);

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verifyEmail({
      email,
      otp: otpValue,
    });
  };

  const handleResendOTP = async () => {
    await sendOTP(email, "email-verification");
  };

  return (
    <AuthLayout>
      <OtpForm
        email={email}
        error={error}
        isLoading={isLoading}
        onChange={setOtpValue}
        onResend={handleResendOTP}
        onSubmit={handleOTPSubmit}
        value={otpValue}
      />
    </AuthLayout>
  );
}
