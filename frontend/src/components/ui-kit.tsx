import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function Panel({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:border-border",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-4 md:px-5">
          <div className="min-w-0 flex-1">
            {title && <h2 className="font-semibold leading-snug">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "gold" | "success" | "warning";
}) {
  const tones = {
    primary: "bg-primary/15 text-primary ring-primary/20",
    gold: "bg-gold-soft text-gold-foreground ring-gold/20",
    success: "bg-success/15 text-success ring-success/20",
    warning: "bg-warning/20 text-warning-foreground ring-warning/20",
  } as const;

  return (
    <div className="group rounded-xl border border-border/80 bg-card p-5 shadow-lg transition-all hover:shadow-xl hover:border-border hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">{label}</p>
        </div>
        <span className={cn("grid size-10 place-items-center rounded-lg ring-4 transition-transform group-hover:scale-110", tones[tone])}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-bold leading-tight">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="flex items-center gap-1 text-xs font-medium text-destructive">
          <span className="size-1 rounded-full bg-destructive" />
          {error}
        </span>
      ) : (
        hint && <span className="block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

const controlClass =
  "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40 focus:shadow-lg hover:border-input/80 disabled:opacity-60 disabled:cursor-not-allowed";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(controlClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlClass, "min-h-20", props.className)} />;
}

export function Btn({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "gold" | "outline" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-md hover:shadow-lg",
    gold: "bg-gold text-gold-foreground hover:bg-gold/90 active:bg-gold/80 shadow-md hover:shadow-lg",
    outline: "border border-input bg-background text-foreground hover:bg-accent/50 active:bg-accent",
    ghost: "text-muted-foreground hover:bg-accent/60 hover:text-foreground active:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-md hover:shadow-lg",
  } as const;
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        className,
      )}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; indicator: string }> = {
    Active: { bg: "bg-success/15", text: "text-success", indicator: "bg-success" },
    Closed: { bg: "bg-muted/50", text: "text-muted-foreground", indicator: "bg-muted-foreground" },
    Overdue: { bg: "bg-destructive/15", text: "text-destructive", indicator: "bg-destructive" },
    Inactive: { bg: "bg-muted/50", text: "text-muted-foreground", indicator: "bg-muted-foreground" },
  };
  
  const config = map[status] ?? { bg: "bg-accent/15", text: "text-accent-foreground", indicator: "bg-accent" };
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-all",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.indicator)} />
      {status}
    </span>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto md:mx-0">
      <table className="w-full min-w-[720px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-border/60 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/80",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-border/40 px-4 py-3 align-middle", className)}>{children}</td>;
}

export function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 rounded-full bg-muted/60 p-3">
        <svg className="size-6 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
