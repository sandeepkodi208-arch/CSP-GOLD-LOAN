import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BadgeIndianRupee,
  Activity,
  ShieldCheck,
  Coins,
  FileBarChart2,
  Gem,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { formatINR } from "@/lib/finance";
import {
  getGoldRate,
  getSettings,
  getCustomers,
  getLoans,
  getPayments,
  isLoggedIn,
  logout,
  setSettings,
} from "@/lib/storage";
import { useAppData } from "@/hooks/useAppData";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/appraisal", label: "Gold Appraisal", icon: Gem },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/loans", label: "Loans", icon: BadgeIndianRupee },
      { to: "/emi", label: "EMI Payments", icon: Wallet },
      { to: "/gold-rate", label: "Gold Rate", icon: Coins },
    ],
  },
  {
    label: "Insights",
    items: [{ to: "/reports", label: "Reports", icon: FileBarChart2 }],
  },
  {
    label: "System",
    items: [{ to: "/settings", label: "Settings", icon: SettingsIcon }],
  },
] as const;

export function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const [open, setOpen] = useState(false);

  const { ready, version, refresh } = useAppData();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Protect all pages that use AppShell
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  // Load theme and settings
  useEffect(() => {
    const s = getSettings();

    setTheme(s.theme);
    applyTheme(s.theme);
  }, [version]);

  // Close mobile sidebar when changing pages
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const rate = ready ? getGoldRate().rate24k : 0;

  const settings = ready ? getSettings() : null;
  const customersCount = ready ? getCustomers().length : 0;
  const loansCount = ready ? getLoans().length : 0;
  const paymentsCount = ready ? getPayments().length : 0;

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);
    applyTheme(next);

    setSettings({
      ...getSettings(),
      theme: next,
    });

    refresh();
  }

  function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    logout();

    navigate({
      to: "/login",
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Company */}
        <div className="flex items-center gap-3 border-b border-sidebar-border/60 px-5 py-5">
          <span className="grid size-10 place-items-center rounded-lg bg-gold text-gold-foreground shadow-md">
            <Gem className="size-5" />
          </span>

          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold leading-tight">
              {settings?.companyName ?? "Gold Finance"}
            </p>

            <p className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              Loan Manager
            </p>
          </div>

          <button
            className="ml-auto text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/40">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.to ||
                    (item.to !== "/dashboard" && pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-sidebar-accent/80 font-semibold text-sidebar-primary shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
                      {item.label}
                      {active && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border/60 p-3">
          <div className="mb-3 rounded-lg bg-sidebar-accent/40 px-3 py-2.5">
            <p className="text-xs font-semibold text-sidebar-foreground">Workspace secure</p>
            <p className="mt-0.5 text-[11px] text-sidebar-foreground/50">Local business data is protected</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border/60 bg-card/95 px-4 py-4 shadow-sm backdrop-blur-sm md:px-6">
          {/* Mobile menu */}
          <button
            className="rounded-lg border border-border p-2 transition-colors hover:bg-accent lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="size-4" />
          </button>

          {/* Page title */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold md:text-xl">
              {title}
            </h1>

            {subtitle && (
              <p className="truncate text-xs text-muted-foreground/80 md:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {/* Gold rate */}
          <div className="hidden items-center gap-2.5 rounded-lg bg-gold-soft px-4 py-2 text-sm font-semibold text-gold-foreground shadow-sm sm:flex">
            <Coins className="size-4" />

            <span>{formatINR(rate)}</span>

            <span className="text-xs font-normal text-gold-foreground/70">
              / g 24K
            </span>
          </div>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>

          {/* Admin profile */}
          <div className="flex items-center gap-2.5 border-l border-border/60 pl-4">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {(settings?.adminName ?? "A")
                .slice(0, 1)
                .toUpperCase()}
            </span>

            <div className="hidden leading-tight md:block">
              <p className="text-sm font-semibold">
                {settings?.adminName ?? "Admin"}
              </p>

              <p className="text-xs text-muted-foreground/70">
                Administrator
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background/50 p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="grid size-7 place-items-center rounded-full bg-success/15 text-success"><Activity className="size-3.5" /></span>
              Workspace active
            </div>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="text-xs text-muted-foreground">{customersCount} customers</span>
            <span className="text-xs text-muted-foreground">{loansCount} loans</span>
            <span className="text-xs text-muted-foreground">{paymentsCount} payments</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-success"><ShieldCheck className="size-3.5" /> Data ready</span>
          </div>

          {actions && (
            <div className="mb-5 flex flex-wrap gap-2">
              {actions}
            </div>
          )}

          {ready ? (
            children
          ) : (
            <p className="text-sm text-muted-foreground">
              Loading…
            </p>
          )}
        </main>
      </div>
    </div>
  );
}