# Authentication Hooks Documentation

This directory contains comprehensive authentication hooks built on top of Better Auth with OTP verification support.

## Available Hooks

### 1. `useTwoFactor` - Two-Factor Authentication Management

Manage two-factor authentication (2FA) using TOTP (Time-based One-Time Password) with authenticator apps like Google Authenticator, Authy, or 1Password.

#### Usage - Enable 2FA

```typescript
import { useTwoFactor } from "@/hooks/auth/use-two-factor";

function TwoFactorSetup() {
  const {
    enableTwoFactor,
    isEnabling,
    enableError,
    verifyTwoFactor,
    isVerifying,
    verifySuccess,
  } = useTwoFactor();

  const [totpURI, setTotpURI] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable = async () => {
    const result = await enableTwoFactor("userPassword123");
    if (result) {
      setTotpURI(result.totpURI || "");
      setBackupCodes(result.backupCodes || []);
    }
  };

  const handleVerify = async (code: string) => {
    await verifyTwoFactor({ code });
    if (verifySuccess) {
      // 2FA is now active
      router.push("/dashboard");
    }
  };

  return (
    <div>
      {!totpURI ? (
        <button onClick={handleEnable} disabled={isEnabling}>
          Enable 2FA
        </button>
      ) : (
        <div>
          {/* Display QR code using totpURI */}
          <QRCode value={totpURI} />

          {/* Show backup codes */}
          <div>
            <h3>Backup Codes</h3>
            <p>Save these codes in a safe place:</p>
            {backupCodes.map((code) => (
              <p key={code}>{code}</p>
            ))}
          </div>

          {/* Verify with authenticator app code */}
          <input
            type="text"
            placeholder="Enter 6-digit code"
            onChange={(e) => handleVerify(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
```

#### Usage - Disable 2FA

```typescript
import { useTwoFactor } from "@/hooks/auth/use-two-factor";

function TwoFactorSettings() {
  const { disableTwoFactor, isDisabling, disableSuccess, disableError } = useTwoFactor();

  const handleDisable = async () => {
    await disableTwoFactor("userPassword123");
    if (disableSuccess) {
      // 2FA has been disabled
    }
  };

  return (
    <div>
      {disableError && <p className="error">{disableError}</p>}
      {disableSuccess && <p className="success">2FA disabled successfully</p>}
      <button onClick={handleDisable} disabled={isDisabling}>
        {isDisabling ? "Disabling..." : "Disable 2FA"}
      </button>
    </div>
  );
}
```

#### API

- `enableTwoFactor(password)` - Generate TOTP URI and backup codes
  - `password` (string, required) - User's current password for verification
  - Returns: `{ totpURI?: string, backupCodes?: string[] } | null`

- `verifyTwoFactor(data)` - Verify and activate 2FA
  - `data.code` (string, required) - 6-digit code from authenticator app

- `disableTwoFactor(password)` - Disable 2FA for the user
  - `password` (string, required) - User's current password for verification

- `isEnabling` (boolean) - Loading state for enable operation
- `enableError` (string | null) - Error message for enable operation
- `isVerifying` (boolean) - Loading state for verify operation
- `verifyError` (string | null) - Error message for verify operation
- `verifySuccess` (boolean) - Success state for verify operation
- `isDisabling` (boolean) - Loading state for disable operation
- `disableError` (string | null) - Error message for disable operation
- `disableSuccess` (boolean) - Success state for disable operation

---

### 2. `useSession` - Session Management

Manage user sessions including viewing current session, listing all active sessions, and revoking sessions. Provides real-time session information including creation time, expiration time, IP address, and user agent.

#### Usage - View Current Session

```typescript
import { useSession } from "@/hooks/auth/use-session";

function SessionInfo() {
  const { session, isLoading, error } = useSession();

  if (isLoading) return <p>Loading session...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {session?.user && (
        <div>
          <h3>Current Session</h3>
          <p>User: {session.user.email}</p>
          <p>Name: {session.user.name}</p>
          <p>Session ID: {session.session?.id}</p>
          <p>Created: {session.session?.createdAt.toLocaleString()}</p>
          <p>Expires: {session.session?.expiresAt.toLocaleString()}</p>
          <p>IP Address: {session.session?.ipAddress}</p>
          <p>User Agent: {session.session?.userAgent}</p>
        </div>
      )}
    </div>
  );
}
```

#### Usage - List All Sessions

```typescript
import { useSession } from "@/hooks/auth/use-session";
import { useState, useEffect } from "react";

function ActiveSessions() {
  const { listSessions, isListingSessions, listError } = useSession();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const loadSessions = async () => {
      const data = await listSessions();
      setSessions(data);
    };
    loadSessions();
  }, []);

  return (
    <div>
      <h3>Active Sessions</h3>
      {isListingSessions && <p>Loading sessions...</p>}
      {listError && <p className="error">{listError}</p>}

      {sessions.map((session) => (
        <div key={session.id}>
          <p>Device: {session.userAgent}</p>
          <p>IP: {session.ipAddress}</p>
          <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
          <p>Expires: {new Date(session.expiresAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Usage - Revoke Sessions

```typescript
import { useSession } from "@/hooks/auth/use-session";

function SessionManager() {
  const {
    listSessions,
    revokeSession,
    revokeOtherSessions,
    isRevokingSession,
    isRevokingOtherSessions,
    revokeError,
  } = useSession();

  const [sessions, setSessions] = useState([]);

  const handleRevokeSession = async (token: string) => {
    await revokeSession(token);
    // Refresh the list
    const updatedSessions = await listSessions();
    setSessions(updatedSessions);
  };

  const handleRevokeAllOthers = async () => {
    await revokeOtherSessions();
    // Refresh the list
    const updatedSessions = await listSessions();
    setSessions(updatedSessions);
  };

  return (
    <div>
      {revokeError && <p className="error">{revokeError}</p>}

      <button
        onClick={handleRevokeAllOthers}
        disabled={isRevokingOtherSessions}
      >
        Sign out all other devices
      </button>

      {sessions.map((session) => (
        <div key={session.id}>
          <p>{session.userAgent}</p>
          <button
            onClick={() => handleRevokeSession(session.token)}
            disabled={isRevokingSession}
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### API

- `session` (SessionInfo | null) - Current session information
  - `session.user` - User details (id, email, name, image, emailVerified, timestamps)
  - `session.session` - Session details (id, userId, token, createdAt, updatedAt, expiresAt, ipAddress, userAgent)

- `refreshSession()` - Refresh the current session data
  - Returns: `Promise<void>`

- `listSessions()` - Get all active sessions for the current user
  - Returns: `Promise<SessionData[]>`

- `revokeSession(sessionToken)` - Revoke a specific session
  - `sessionToken` (string, required) - The token of the session to revoke
  - Returns: `Promise<void>`

- `revokeOtherSessions()` - Revoke all sessions except the current one
  - Returns: `Promise<void>`

- `isLoading` (boolean) - Initial loading state
- `error` (string | null) - Session fetch error
- `isRefreshing` (boolean) - Loading state for refresh operation
- `isListingSessions` (boolean) - Loading state for list operation
- `isRevokingSession` (boolean) - Loading state for revoke operation
- `isRevokingOtherSessions` (boolean) - Loading state for revoke others operation
- `listError` (string | null) - Error message for list operation
- `revokeError` (string | null) - Error message for revoke operations

---

### 3. `useRegister` - User Registration with Email/Password or OAuth

Handle user registration with email/password and optional OTP verification flow, or OAuth providers (GitHub, Google, Discord, Microsoft).

#### Usage - Email/Password Registration

```typescript
import { useRegister } from "@/hooks/use-register";

function RegisterForm() {
  const { register, sendVerificationOTP, isLoading, error, success } = useRegister();

  const handleRegister = async () => {
    // Register the user
    await register({
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePassword123",
      image: "https://example.com/avatar.jpg", // Optional
    });

    // After registration, send OTP for email verification
    if (success) {
      await sendVerificationOTP("john@example.com");
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Registration successful!</p>}
      <button onClick={handleRegister} disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}
```

#### Usage - OAuth Registration

```typescript
import { useRegister } from "@/hooks/use-register";

function RegisterForm() {
  const { registerWithOAuth, isLoading, error } = useRegister();

  const handleGitHubRegister = async () => {
    await registerWithOAuth("github", {
      callbackURL: "/dashboard",
      errorCallbackURL: "/register?error=oauth"
    });
  };

  const handleGoogleRegister = async () => {
    await registerWithOAuth("google", {
      callbackURL: "/dashboard"
    });
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <button onClick={handleGitHubRegister} disabled={isLoading}>
        Register with GitHub
      </button>
      <button onClick={handleGoogleRegister} disabled={isLoading}>
        Register with Google
      </button>
    </div>
  );
}
```

#### API

- `register(data)` - Register a new user with email/password
  - `data.name` (string, required) - User's full name
  - `data.email` (string, required) - User's email address
  - `data.password` (string, required) - User's password (min 8 chars)
  - `data.image` (string, optional) - Profile image URL

- `registerWithOAuth(provider, options)` - Register/Sign in with OAuth provider
  - `provider` ("github" | "google" | "discord" | "microsoft", required) - OAuth provider
  - `options.callbackURL` (string, optional) - Redirect URL after success (default: "/")
  - `options.errorCallbackURL` (string, optional) - Redirect URL on error (default: "/register")

- `sendVerificationOTP(email)` - Send OTP for email verification
  - `email` (string, required) - Email to send OTP to

- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message
- `success` (boolean) - Success state

---

### 4. `useLogin` - Email/Password Login

Handle user login with email and password authentication.

#### Usage

```typescript
import { useLogin } from "@/hooks/use-login";

function LoginForm() {
  const { login, isLoading, error, success } = useLogin();

  const handleLogin = async () => {
    await login({
      email: "john@example.com",
      password: "SecurePassword123",
      rememberMe: true,
      callbackURL: "/dashboard",
    });
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Login successful!</p>}
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
}
```

#### API

- `login(data)` - Sign in with email and password
  - `data.email` (string, required) - User's email
  - `data.password` (string, required) - User's password
  - `data.rememberMe` (boolean, optional) - Keep session active (default: true)
  - `data.callbackURL` (string, optional) - Redirect URL after login

- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message
- `success` (boolean) - Success state

---

### 5. `useOTPVerification` - OTP Verification Management

Universal OTP verification hook for all OTP types (sign-in, email-verification, forget-password).

#### Usage

```typescript
import { useOTPVerification } from "@/hooks/use-otp-verification";

function OTPVerificationForm() {
  const { sendOTP, checkOTP, verifyEmail, isLoading, error, success, isValid } = useOTPVerification();

  const handleSendOTP = async () => {
    await sendOTP("john@example.com", "email-verification");
  };

  const handleCheckOTP = async () => {
    const valid = await checkOTP({
      email: "john@example.com",
      otp: "123456",
      type: "email-verification",
    });

    if (valid) {
      console.log("OTP is valid!");
    }
  };

  const handleVerifyEmail = async () => {
    await verifyEmail({
      email: "john@example.com",
      otp: "123456",
    });
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {isValid !== null && (
        <p>{isValid ? "OTP is valid!" : "Invalid OTP"}</p>
      )}
      <button onClick={handleSendOTP} disabled={isLoading}>
        Send OTP
      </button>
      <button onClick={handleCheckOTP} disabled={isLoading}>
        Check OTP
      </button>
      <button onClick={handleVerifyEmail} disabled={isLoading}>
        Verify Email
      </button>
    </div>
  );
}
```

#### API

- `sendOTP(email, type)` - Send OTP to email
  - `email` (string, required) - Email to send OTP to
  - `type` ("sign-in" | "email-verification" | "forget-password", required) - OTP type

- `checkOTP(data)` - Verify if OTP is valid (optional check)
  - `data.email` (string, required) - User's email
  - `data.otp` (string, required) - OTP code
  - `data.type` (OTPType, required) - OTP type
  - Returns: `Promise<boolean>` - Whether OTP is valid

- `verifyEmail(data)` - Complete email verification
  - `data.email` (string, required) - User's email
  - `data.otp` (string, required) - OTP code

- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message
- `success` (boolean) - Success state
- `isValid` (boolean | null) - OTP validation result

---

### 6. `useForgotPassword` - Password Reset with OTP

Handle password reset flow using OTP verification.

#### Usage

```typescript
import { useSignOut } from "@/hooks/use-sign-out";
import { useRouter } from "next/navigation";

function SignOutButton() {
  const { signOut, isLoading, error } = useSignOut();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      onSuccess: () => {
        console.log("Successfully signed out");
      },
      onError: (error) => {
        console.error("Sign out failed:", error);
      },
      redirectTo: "/login",
    });
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <button onClick={handleSignOut} disabled={isLoading}>
        {isLoading ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  );
}
```

#### API

- `signOut(options)` - Sign out the current user
  - `options.onSuccess` (function, optional) - Callback on successful sign out
  - `options.onError` (function, optional) - Callback on error
  - `options.redirectTo` (string, optional) - URL to redirect after sign out

- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message

---

### 7. `useSignOut` - User Sign Out

Handle user sign out with optional redirect.

#### Usage

```typescript
import { useForgotPassword } from "@/hooks/use-forgot-password";

function ForgotPasswordForm() {
  const { sendResetOTP, checkResetOTP, resetPassword, isLoading, error, success, isOTPValid } = useForgotPassword();
  const [step, setStep] = useState(1);

  const handleSendOTP = async () => {
    await sendResetOTP("john@example.com");
    if (success) setStep(2);
  };

  const handleCheckOTP = async () => {
    const valid = await checkResetOTP("john@example.com", "123456");
    if (valid) setStep(3);
  };

  const handleResetPassword = async () => {
    await resetPassword({
      email: "john@example.com",
      otp: "123456",
      password: "NewSecurePassword123",
    });
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Success!</p>}

      {step === 1 && (
        <button onClick={handleSendOTP} disabled={isLoading}>
          Send Reset OTP
        </button>
      )}

      {step === 2 && (
        <button onClick={handleCheckOTP} disabled={isLoading}>
          Verify OTP
        </button>
      )}

      {step === 3 && (
        <button onClick={handleResetPassword} disabled={isLoading}>
          Reset Password
        </button>
      )}
    </div>
  );
}
```

#### API

- `sendResetOTP(email)` - Send password reset OTP
  - `email` (string, required) - Email to send reset OTP to

- `checkResetOTP(email, otp)` - Check if reset OTP is valid
  - `email` (string, required) - User's email
  - `otp` (string, required) - OTP code
  - Returns: `Promise<boolean>` - Whether OTP is valid

- `resetPassword(data)` - Reset password with OTP
  - `data.email` (string, required) - User's email
  - `data.otp` (string, required) - OTP code
  - `data.password` (string, required) - New password

- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message
- `success` (boolean) - Success state
- `isOTPValid` (boolean | null) - OTP validation result

---

## Complete Authentication Flow Example

### Registration → Email Verification → Login

```typescript
"use client";

import { useState } from "react";
import { useRegister } from "@/hooks/use-register";
import { useOTPVerification } from "@/hooks/use-otp-verification";
import { useLogin } from "@/hooks/use-login";

export function CompleteAuthFlow() {
  const [step, setStep] = useState<"register" | "verify" | "login">("register");
  const [email, setEmail] = useState("");

  const register = useRegister();
  const verify = useOTPVerification();
  const login = useLogin();

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    await register.register(data);
    if (register.success) {
      setEmail(data.email);
      await register.sendVerificationOTP(data.email);
      setStep("verify");
    }
  };

  const handleVerifyEmail = async (otp: string) => {
    await verify.verifyEmail({ email, otp });
    if (verify.success) {
      setStep("login");
    }
  };

  const handleLogin = async (password: string) => {
    await login.login({ email, password });
    if (login.success) {
      // Redirect to dashboard
      window.location.href = "/dashboard";
    }
  };

  return (
    <div>
      {step === "register" && (
        <div>
          <h2>Register</h2>
          {/* Registration form */}
        </div>
      )}

      {step === "verify" && (
        <div>
          <h2>Verify Email</h2>
          {/* OTP input */}
        </div>
      )}

      {step === "login" && (
        <div>
          <h2>Login</h2>
          {/* Login form */}
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling

All hooks provide consistent error handling:

```typescript
const { error } = useRegister();

if (error) {
  // Handle specific errors
  if (error.includes("already exists")) {
    // User already registered
  } else if (error.includes("Invalid OTP")) {
    // OTP is incorrect
  } else if (error.includes("TOO_MANY_ATTEMPTS")) {
    // User exceeded max OTP attempts
  }
}
```

---

## Best Practices

1. **Always check success state** before proceeding to next step
2. **Clear error messages** before new operations
3. **Use loading states** to disable UI during operations
4. **Validate inputs** before calling hook methods
5. **Handle edge cases** like expired OTPs (5 minutes default)
6. **Implement rate limiting** on the UI to prevent spam
7. **Provide clear feedback** to users about each step

---

## OTP Configuration

The OTP plugin is configured in `src/lib/auth.ts`:

- **OTP Length**: 6 digits (configurable)
- **Expiry Time**: 300 seconds (5 minutes)
- **Max Attempts**: 3 (configurable)
- **Storage**: Plain text in database (can be encrypted/hashed)

---

## Security Notes

- OTPs are single-use and expire after 5 minutes
- Maximum 3 verification attempts per OTP
- Passwords are hashed using scrypt algorithm
- Sessions can be configured with rememberMe option
- Email verification can be made mandatory via config

---

## TypeScript Support

All hooks are fully typed with TypeScript for better developer experience and type safety.
