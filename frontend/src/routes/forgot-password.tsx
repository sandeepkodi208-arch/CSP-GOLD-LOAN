import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Gem,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Btn, Field, TextInput } from "@/components/ui-kit";
import { applyTheme } from "@/components/AppShell";
import { getSettings, setSettings } from "@/lib/storage";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [account, setAccount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    applyTheme(getSettings().theme);
  }, []);

  function verifyAccount(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const value = account.trim().toLowerCase();

    if (!value) {
      setError("Please enter your username or email address.");
      return;
    }

    const settings = getSettings();

    const savedUsername = (settings.username || "").trim().toLowerCase();
    const savedEmail = (settings.email || "").trim().toLowerCase();

    if (value !== savedUsername && value !== savedEmail) {
      setError("No administrator account was found with those details.");
      return;
    }

    setStep(2);
  }

  function resetPassword(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const settings = getSettings();

    setSettings({
      ...settings,
      password: newPassword,
    });

    setSuccess("Password reset successfully! Redirecting to login...");

    setTimeout(() => {
      navigate({ to: "/login" });
    }, 1500);
  }

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  return (
    <div className="auth-shell grid min-h-screen lg:grid-cols-2">

      {/* Left side */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">

        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-gold text-gold-foreground">
            <Gem className="size-5" />
          </span>

          <div>
            <p className="font-display text-lg leading-tight">
              Shree Gold Finance
            </p>

            <p className="text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
              Loan Manager
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <div className="mb-5 grid size-14 place-items-center rounded-xl bg-sidebar-accent">
            <ShieldCheck className="size-7" />
          </div>

          <h2 className="font-display text-4xl leading-tight">
            Secure your administrator account.
          </h2>

          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Reset your administrator password and continue managing
            customers, appraisals, loans, EMI payments and reports.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          Branch console · Data stored locally on this device
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center bg-background p-6">

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-6 lg:hidden">
            <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
              <Gem className="size-5" />
            </span>
          </div>

          {/* Back to login */}
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Login
          </Link>

          {/* Step 1 */}
          {step === 1 && (
            <form
              onSubmit={verifyAccount}
              className="space-y-5"
            >
              <div>
                <h1 className="font-display text-3xl">
                  Forgot Password?
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your username or email address to continue.
                </p>
              </div>

              <Field
                label="Username or Email"
                required
              >
                <div className="relative">

                  {account.includes("@") ? (
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  ) : (
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  )}

                  <TextInput
                    value={account}
                    onChange={(e) => {
                      setAccount(e.target.value);
                      setError("");
                    }}
                    className="pl-9"
                    placeholder="Enter username or email"
                    autoComplete="username"
                    required
                  />
                </div>
              </Field>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Btn
                type="submit"
                className="w-full"
              >
                Continue
              </Btn>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form
              onSubmit={resetPassword}
              className="space-y-5"
            >
              <div>
                <div className="mb-4 grid size-12 place-items-center rounded-full bg-success/10 text-success">
                  <Check className="size-6" />
                </div>

                <h1 className="font-display text-3xl">
                  Reset Password
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new password for your administrator account.
                </p>
              </div>

              {/* New password */}
              <Field
                label="New Password"
                required
              >
                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <TextInput
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    className="pl-9 pr-10"
                    placeholder="Create a new password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>

              {/* Confirm password */}
              <Field
                label="Confirm New Password"
                required
              >
                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <TextInput
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className="pl-9 pr-10"
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>

              {/* Password rules */}
              <div className="rounded-md border bg-muted/30 p-3 text-xs">
                <p className="mb-2 font-medium">
                  Password must contain:
                </p>

                <div className="space-y-1">

                  <PasswordRule
                    valid={newPassword.length >= 8}
                    text="At least 8 characters"
                  />

                  <PasswordRule
                    valid={/[A-Z]/.test(newPassword)}
                    text="One uppercase letter"
                  />

                  <PasswordRule
                    valid={/[a-z]/.test(newPassword)}
                    text="One lowercase letter"
                  />

                  <PasswordRule
                    valid={/[0-9]/.test(newPassword)}
                    text="One number"
                  />
                </div>
              </div>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p
                  className={`text-xs font-medium ${
                    passwordsMatch
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {passwordsMatch
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </p>
              )}

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
                  {success}
                </p>
              )}

              <Btn
                type="submit"
                className="w-full"
              >
                Reset Password
              </Btn>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                ← Use a different account
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        valid
          ? "text-success"
          : "text-muted-foreground"
      }`}
    >
      {valid ? (
        <Check className="size-3.5" />
      ) : (
        <span className="size-3.5 rounded-full border" />
      )}

      <span>{text}</span>
    </div>
  );
}