import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { Spinner } from "../ui/spinner";

const OTP_LENGTH = 6;

type OtpFormProps = {
  /** The email address where the OTP was sent */
  email?: string;
  /** The current OTP value entered by the user */
  value?: string;
  /** Callback fired when the OTP value changes */
  onChange?: (value: string) => void;
  /** Callback fired when the form is submitted */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Callback fired when the resend button is clicked */
  onResend?: () => void;
  /** Whether the form is in a loading state (e.g., verifying OTP) */
  isLoading?: boolean;
  /** Error message to display if verification fails */
  error?: string | null;
};

/**
 * A form component for OTP (One-Time Password) verification.
 * Displays a 6-digit OTP input field with verification and resend functionality.
 *
 * @param {OtpFormProps} props - The component props
 * @returns {JSX.Element} The OTP form component
 *
 * @example
 * ```tsx
 * const [otpValue, setOtpValue] = useState("");
 *
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   await verifyOTP(otpValue);
 * };
 *
 * const handleResend = async () => {
 *   await sendNewOTP();
 * };
 *
 * <OtpForm
 *   email="user@example.com"
 *   value={otpValue}
 *   onChange={setOtpValue}
 *   onSubmit={handleSubmit}
 *   onResend={handleResend}
 *   isLoading={isVerifying}
 *   error={errorMessage}
 * />
 * ```
 */
export function OtpForm({
  email,
  value = "",
  onChange,
  onSubmit,
  onResend,
  isLoading = false,
  error,
}: OtpFormProps) {
  return (
    <form
      className="flex flex-col items-center justify-center p-6 md:p-8"
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <Field className="items-center text-center">
          <h1 className="font-bold text-2xl">Enter verification code</h1>
          <p className="text-balance text-muted-foreground text-sm">
            We sent a 6-digit code to {email || "your email"}
          </p>
        </Field>
        <Field>
          <FieldLabel className="sr-only" htmlFor="otp">
            Verification code
          </FieldLabel>
          <div className="flex justify-center">
            <InputOTP
              containerClassName="gap-4"
              id="otp"
              maxLength={OTP_LENGTH}
              onChange={onChange}
              required
              value={value}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <FieldDescription className="text-center">
            Enter the 6-digit code sent to your email.
          </FieldDescription>
        </Field>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        <Field>
          <Button
            disabled={isLoading || value.length !== OTP_LENGTH}
            type="submit"
          >
            {isLoading ? (
              <>
                <Spinner />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
          <FieldDescription className="text-center">
            Didn&apos;t receive the code?{" "}
            {onResend ? (
              <button
                className="text-primary hover:underline"
                disabled={isLoading}
                onClick={onResend}
                type="button"
              >
                Resend
              </button>
            ) : (
              <a href="#resend">Resend</a>
            )}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
