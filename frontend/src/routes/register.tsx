import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Eye,
  EyeOff,
  Gem,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Btn, Field, TextInput } from "@/components/ui-kit";
import { applyTheme } from "@/components/AppShell";
import { getSettings, setSettings } from "@/lib/storage";
import { registerUser } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    applyTheme(getSettings().theme);
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = adminName.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanMobile = mobile.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (cleanName.length < 3) {
      setError("Full name must contain at least 3 characters.");
      return;
    }

    if (!cleanUsername) {
      setError("Please enter a username.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{4,20}$/.test(cleanUsername)) {
      setError(
        "Username must be 4–20 characters and contain only letters, numbers or underscore.",
      );
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(cleanMobile)) {
      setError("Mobile number must contain exactly 10 digits.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const currentSettings = getSettings();

    const updatedSettings = {
      ...currentSettings,
      adminName: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      mobile: cleanMobile,
      password,
    };

    registerUser({
      first_name: cleanName.split(' ')[0],
      last_name: cleanName.split(' ').slice(1).join(' ') || '.',
      email: cleanUsername, // Store username as email so they can log in via username!
      password: password,
      phone: cleanMobile
    }).then(() => {
      setSettings(updatedSettings);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 1200);
    }).catch((err) => {
      setError(err.response?.data?.message || "Failed to register user to database.");
    });
  }

  const passwordLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const passwordStrong =
    passwordLength && hasUppercase && hasLowercase && hasNumber;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

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
          <h2 className="font-display text-4xl leading-tight">
            Create your administrator account.
          </h2>

          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Set up your administrator profile to manage customers,
            gold appraisals, loans, EMI payments and reports.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          Branch console · Data stored locally on this device
        </p>
      </div>

      {/* Registration form */}
      <div className="flex items-center justify-center bg-background p-6">

        <form
          className="auth-form w-full max-w-md space-y-4"
          onSubmit={submit}
        >

          <div className="lg:hidden">
            <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
              <Gem className="size-5" />
            </span>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-3xl">
              Create Account
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Register your administrator account.
            </p>
          </div>

          {/* Full Name */}
          <Field label="Full Name" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                value={adminName}
                onChange={(e) => {
                  setAdminName(e.target.value);
                  clearMessages();
                }}
                className="pl-9"
                placeholder="Enter your name"
                required
              />
            </div>
          </Field>

          {/* Username */}
          <Field label="Username" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearMessages();
                }}
                className="pl-9"
                placeholder="Choose a username"
                required
              />
            </div>
          </Field>

          {/* Email */}
          <Field label="Email Address" required>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearMessages();
                }}
                className="pl-9"
                placeholder="admin@example.com"
                required
              />
            </div>
          </Field>

          {/* Mobile */}
          <Field label="Mobile Number" required>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobile(value);
                  clearMessages();
                }}
                className="pl-9"
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>
          </Field>

          {/* Password */}
          <Field label="Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                className="pl-9 pr-10"
                placeholder="Create a strong password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </Field>

          {/* Password requirements */}
          {password.length > 0 && (
            <div className="rounded-md border bg-muted/30 p-3 text-xs">
              <p className="mb-2 font-medium">
                Password requirements
              </p>

              <div className="grid grid-cols-2 gap-2">
                <PasswordRule
                  valid={passwordLength}
                  text="8+ characters"
                />

                <PasswordRule
                  valid={hasUppercase}
                  text="Uppercase letter"
                />

                <PasswordRule
                  valid={hasLowercase}
                  text="Lowercase letter"
                />

                <PasswordRule
                  valid={hasNumber}
                  text="Number"
                />
              </div>

              {passwordStrong && (
                <p className="mt-2 font-medium text-success">
                  Strong password ✓
                </p>
              )}
            </div>
          )}

          {/* Confirm Password */}
          <Field label="Confirm Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearMessages();
                }}
                className="pl-9 pr-10"
                placeholder="Enter password again"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
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

          {/* Password match */}
          {confirmPassword.length > 0 && (
            <div
              className={`flex items-center gap-2 text-xs ${passwordsMatch
                ? "text-success"
                : "text-destructive"
                }`}
            >
              {passwordsMatch ? (
                <Check className="size-4" />
              ) : (
                <X className="size-4" />
              )}

              {passwordsMatch
                ? "Passwords match"
                : "Passwords do not match"}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              {success}
            </p>
          )}

          <Btn
            type="submit"
            className="w-full"
          >
            Create Account
          </Btn>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>

        </form>
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
      className={`flex items-center gap-1.5 ${valid ? "text-success" : "text-muted-foreground"
        }`}
    >
      {valid ? (
        <Check className="size-3.5" />
      ) : (
        <X className="size-3.5" />
      )}

      <span>{text}</span>
    </div>
  );
}