import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Download,
  Lock,
  Moon,
  RotateCcw,
  Save,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell, applyTheme } from "@/components/AppShell";
import { Btn, Field, Panel, TextInput } from "@/components/ui-kit";
import { useAppData } from "@/hooks/useAppData";
import {
  DEFAULT_SETTINGS,
  getSettings,
  setSettings,
} from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { refresh } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setLocalSettings] = useState(getSettings());

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  function updateField<K extends keyof typeof settings>(
    field: K,
    value: (typeof settings)[K],
  ) {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function saveSettings() {
  setMessage("");

  if (settings.adminName.trim().length < 3) {
    setMessage("Admin name must be at least 3 characters.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    setMessage("Please enter a valid email address.");
    return;
  }

  if (!/^\d{10}$/.test(settings.mobile)) {
    setMessage("Mobile number must contain exactly 10 digits.");
    return;
  }

  if (!/^[a-zA-Z0-9_]{4,20}$/.test(settings.username)) {
    setMessage(
      "Username must be 4–20 characters and contain only letters, numbers or underscore.",
    );
    return;
  }

  if (!settings.companyName.trim()) {
    setMessage("Company name is required.");
    return;
  }

  if (settings.defaultLTV <= 0 || settings.defaultLTV > 100) {
    setMessage("LTV must be between 1% and 100%.");
    return;
  }

  if (
    settings.defaultTenureMonths <= 0 ||
    settings.defaultTenureMonths > 120
  ) {
    setMessage("Tenure must be between 1 and 120 months.");
    return;
  }

  if (settings.defaultInterestRate < 0) {
    setMessage("Interest rate cannot be negative.");
    return;
  }

  if (settings.defaultProcessingFee < 0) {
    setMessage("Processing fee cannot be negative.");
    return;
  }

  setSettings(settings);
  applyTheme(settings.theme);
  refresh();

  setMessage("Settings saved successfully.");

  setTimeout(() => setMessage(""), 3000);
}

  function changePassword() {
    setPasswordMessage("");

    if (currentPassword !== settings.password) {
      setPasswordMessage("Current password is incorrect.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordMessage(
        "New password must contain at least one uppercase letter.",
      );
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordMessage(
        "New password must contain at least one lowercase letter.",
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordMessage(
        "New password must contain at least one number.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    const updated = {
      ...settings,
      password: newPassword,
    };

    setLocalSettings(updated);
    setSettings(updated);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordMessage("Password changed successfully.");
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Reset all settings to default values?",
    );

    if (!confirmed) return;

    setLocalSettings({ ...DEFAULT_SETTINGS });
    setSettings({ ...DEFAULT_SETTINGS });
    applyTheme(DEFAULT_SETTINGS.theme);
    refresh();

    setMessage("Settings restored to default.");
  }

  // ---------------------------------------------------------
  // BACKUP
  // ---------------------------------------------------------

  function createBackup() {
    try {
      const backupData: Record<string, unknown> = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith("glms:")) {
          const value = localStorage.getItem(key);

          if (value !== null) {
            try {
              backupData[key] = JSON.parse(value);
            } catch {
              backupData[key] = value;
            }
          }
        }
      }

      const backup = {
        appName: "Shree Gold Finance Loan Manager",
        backupVersion: 1,
        createdAt: new Date().toISOString(),
        data: backupData,
      };

      const json = JSON.stringify(backup, null, 2);

      const blob = new Blob([json], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `shree-gold-finance-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setBackupMessage("Backup downloaded successfully.");
      setTimeout(() => setBackupMessage(""), 4000);
    } catch {
      setBackupMessage("Unable to create backup.");
    }
  }

  // ---------------------------------------------------------
  // RESTORE
  // ---------------------------------------------------------

  function restoreBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const confirmed = window.confirm(
      "Restoring a backup will replace the current application data. Continue?",
    );

    if (!confirmed) {
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const result = JSON.parse(String(reader.result));

        if (!result || typeof result !== "object") {
          throw new Error("Invalid backup");
        }

        if (!result.data || typeof result.data !== "object") {
          throw new Error("Invalid backup");
        }

        const backupData = result.data as Record<string, unknown>;

        // Remove existing GLMS data
        const existingKeys: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);

          if (key && key.startsWith("glms:")) {
            existingKeys.push(key);
          }
        }

        existingKeys.forEach((key) => {
          localStorage.removeItem(key);
        });

        // Restore backup data
        Object.entries(backupData).forEach(([key, value]) => {
          if (!key.startsWith("glms:")) return;

          if (typeof value === "string") {
            localStorage.setItem(key, value);
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });

        const restoredSettings = getSettings();

        setLocalSettings(restoredSettings);
        applyTheme(restoredSettings.theme);
        refresh();

        setBackupMessage(
          "Backup restored successfully. Please refresh the page.",
        );

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch {
        setBackupMessage(
          "Invalid backup file. Please select a valid Shree Gold Finance backup.",
        );
      }
    };

    reader.onerror = () => {
      setBackupMessage("Unable to read the backup file.");
    };

    reader.readAsText(file);

    event.target.value = "";
  }

  return (
    <AppShell
      title="Settings"
      subtitle="Manage your profile, business preferences and security"
    >
      <div className="space-y-6">

        {/* Success Message */}
        {message && (
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
            {message}
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* PROFILE */}
        {/* ------------------------------------------------ */}

        <Panel
          title="Admin Profile"
          description="Update the administrator information shown in the dashboard."
        >
          <div className="grid gap-5 md:grid-cols-2">

            <Field label="Admin Name" required>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <TextInput
                  value={settings.adminName}
                  onChange={(e) =>
                    updateField("adminName", e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Email Address" required>
              <TextInput
                type="email"
                value={settings.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
              />
            </Field>

            <Field label="Mobile Number" required>
              <TextInput
                value={settings.mobile}
                onChange={(e) =>
                  updateField("mobile", e.target.value)
                }
              />
            </Field>

            <Field label="Username" required>
              <TextInput
                value={settings.username}
                onChange={(e) =>
                  updateField("username", e.target.value)
                }
              />
            </Field>

          </div>
        </Panel>

        {/* ------------------------------------------------ */}
        {/* BUSINESS */}
        {/* ------------------------------------------------ */}

        <Panel
          title="Business Profile"
          description="Configure the company information used throughout the application."
        >
          <div className="grid gap-5 md:grid-cols-2">

            <Field label="Company Name" required>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <TextInput
                  value={settings.companyName}
                  onChange={(e) =>
                    updateField("companyName", e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Currency">
              <TextInput
                value={settings.currency}
                onChange={(e) =>
                  updateField("currency", e.target.value)
                }
              />
            </Field>

          </div>
        </Panel>

        {/* ------------------------------------------------ */}
        {/* LOAN SETTINGS */}
        {/* ------------------------------------------------ */}

        <Panel
          title="Loan Settings"
          description="Default values used when creating new gold loans."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <Field label="Default LTV (%)">
              <TextInput
                type="number"
                min="1"
                max="100"
                value={settings.defaultLTV}
                onChange={(e) =>
                  updateField(
                    "defaultLTV",
                    Number(e.target.value),
                  )
                }
              />
            </Field>

            <Field label="Tenure (Months)">
              <TextInput
                type="number"
                min="1"
                value={settings.defaultTenureMonths}
                onChange={(e) =>
                  updateField(
                    "defaultTenureMonths",
                    Number(e.target.value),
                  )
                }
              />
            </Field>

            <Field label="Interest Rate (%)">
              <TextInput
                type="number"
                min="0"
                step="0.1"
                value={settings.defaultInterestRate}
                onChange={(e) =>
                  updateField(
                    "defaultInterestRate",
                    Number(e.target.value),
                  )
                }
              />
            </Field>

            <Field label="Processing Fee">
              <TextInput
                type="number"
                min="0"
                value={settings.defaultProcessingFee}
                onChange={(e) =>
                  updateField(
                    "defaultProcessingFee",
                    Number(e.target.value),
                  )
                }
              />
            </Field>

          </div>
        </Panel>

        {/* ------------------------------------------------ */}
        {/* APPEARANCE */}
        {/* ------------------------------------------------ */}

        <Panel
          title="Appearance"
          description="Choose how the application looks."
        >
          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => updateField("theme", "light")}
              className={`flex items-center gap-3 rounded-lg border px-5 py-3 text-sm font-semibold transition ${
                settings.theme === "light"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              <Sun className="size-5" />
              Light Mode
            </button>

            <button
              type="button"
              onClick={() => updateField("theme", "dark")}
              className={`flex items-center gap-3 rounded-lg border px-5 py-3 text-sm font-semibold transition ${
                settings.theme === "dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              <Moon className="size-5" />
              Dark Mode
            </button>

          </div>
        </Panel>

        {/* ------------------------------------------------ */}
        {/* PASSWORD */}
        {/* ------------------------------------------------ */}

        <Panel
          title="Change Password"
          description="Update the administrator login password."
        >
          <div className="grid gap-5 md:grid-cols-3">

            <Field label="Current Password">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <TextInput
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="New Password">
              <TextInput
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
              />
            </Field>

            <Field label="Confirm Password">
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </Field>

          </div>

          {passwordMessage && (
            <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm">
              {passwordMessage}
            </p>
          )}

          <div className="mt-5">
            <Btn
              type="button"
              onClick={changePassword}
              className="gap-2"
            >
              <Lock className="size-4" />
              Change Password
            </Btn>
          </div>
        </Panel>

        {/* ------------------------------------------------ */}
        {/* BACKUP & RESTORE */}
        {/* ------------------------------------------------ */}

        <Panel
          title="Backup & Restore"
          description="Download your application data or restore it from a previous backup."
        >
          <div className="grid gap-5 md:grid-cols-2">

            {/* Backup */}
            <div className="rounded-xl border border-border bg-muted/30 p-5">

              <div className="mb-4 flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Download className="size-5" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Create Backup
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Download all Shree Gold Finance data as a
                    secure JSON backup file.
                  </p>
                </div>
              </div>

              <Btn
                type="button"
                onClick={createBackup}
                className="w-full gap-2"
              >
                <Download className="size-4" />
                Download Backup
              </Btn>

            </div>

            {/* Restore */}
            <div className="rounded-xl border border-border bg-muted/30 p-5">

              <div className="mb-4 flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Upload className="size-5" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Restore Backup
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Restore your customers, loans, payments,
                    settings and other saved data.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={restoreBackup}
                className="hidden"
              />

              <Btn
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2"
              >
                <Upload className="size-4" />
                Select Backup File
              </Btn>

            </div>

          </div>

          {backupMessage && (
            <div className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
              {backupMessage}
            </div>
          )}

          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium">
              💡 Backup Tip
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Keep a backup file in a safe location regularly.
              A backup contains the data stored in this browser.
            </p>
          </div>
        </Panel>

        {/* ------------------------------------------------ */}
        {/* SAVE / RESET */}
        {/* ------------------------------------------------ */}

        <div className="flex flex-wrap gap-3">

          <Btn
            type="button"
            onClick={saveSettings}
            className="gap-2"
          >
            <Save className="size-4" />
            Save Settings
          </Btn>

          <Btn
            type="button"
            variant="outline"
            onClick={resetSettings}
            className="gap-2"
          >
            <RotateCcw className="size-4" />
            Reset Defaults
          </Btn>

        </div>

      </div>
    </AppShell>
  );
}