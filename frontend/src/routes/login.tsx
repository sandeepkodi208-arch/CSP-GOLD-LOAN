import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Gem,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Btn, Field, TextInput } from "@/components/ui-kit";
import { applyTheme } from "@/components/AppShell";
import {
  getSettings,
  isLoggedIn,
  seedIfEmpty,
} from "@/lib/storage";
import { loginUser } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Shree Gold Finance Loan Manager" },
      {
        name: "description",
        content:
          "Secure admin sign-in for the gold loan management system.",
      },
      {
        property: "og:title",
        content: "Sign In — Gold Loan Management System",
      },
      {
        property: "og:description",
        content:
          "Manage gold appraisals, loans and EMI collections from one dashboard.",
      },
    ],
  }),

  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    seedIfEmpty();

    const settings = getSettings();

    applyTheme(settings.theme);

    if (isLoggedIn()) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      const response = await loginUser({ email: cleanUsername, password });
      localStorage.setItem("glms:auth_token", response.token);
      localStorage.setItem("glms:auth", JSON.stringify(true));
      navigate({ to: "/dashboard" });
    } catch {
      setError(
        "Invalid username or password. Please check your credentials.",
      );
    }
  }

  return (
    <div className="auth-shell grid min-h-screen lg:grid-cols-2">

      {/* Left Section */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">

        {/* Logo */}
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

        {/* Description */}
        <div className="max-w-md">

          <h2 className="font-display text-4xl leading-tight">
            Gold loans, appraised and settled with precision.
          </h2>

          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Appraise ornaments by purity, sanction against live gold
            rates, collect EMIs and close loans — every record kept in
            one ledger.
          </p>

          <ul className="mt-8 space-y-3 text-sm">

            {[
              "Purity-based valuation for 18K to 24K",
              "Automatic EMI, interest and outstanding tracking",
              "Overdue alerts and CSV-ready reports",
            ].map((line) => (
              <li
                key={line}
                className="flex items-center gap-2 text-sidebar-foreground/85"
              >
                <ShieldCheck className="size-4 text-gold" />
                {line}
              </li>
            ))}

          </ul>

        </div>

        <p className="text-xs text-sidebar-foreground/50">
          Branch console · Data stored locally on this device
        </p>

      </div>

      {/* Login Section */}
      <div className="flex items-center justify-center bg-background p-6">

        <form
          className="auth-form w-full max-w-sm space-y-5"
          onSubmit={submit}
        >

          {/* Mobile Logo */}
          <div className="lg:hidden">
            <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
              <Gem className="size-5" />
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="font-display text-3xl">
              Admin Login
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage customers, loans and collections.
            </p>
          </div>

          {/* Username */}
          <Field label="Username" required>

            <div className="relative">

              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="pl-9"
                autoComplete="username"
                placeholder="Enter username"
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
                  setError("");
                }}
                className="pl-9 pr-10"
                autoComplete="current-password"
                placeholder="Enter password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Login Button */}
          <Btn
            type="submit"
            className="w-full"
          >
            Sign in
          </Btn>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create account
            </Link>

          </p>

          {/* Demo Credentials */}
          <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">

            Demo credentials — username{" "}

            <strong className="text-foreground">
              admin
            </strong>

            , password{" "}

            <strong className="text-foreground">
              admin123
            </strong>

          </p>

        </form>

      </div>

    </div>
  );
}