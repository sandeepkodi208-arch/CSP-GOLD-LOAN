import type { Purity } from "@/types";

export const PURITY_FACTORS: Record<Purity, number> = {
  "18K": 0.75,
  "20K": 0.8333,
  "22K": 0.9167,
  "24K": 1,
};

export const PURITIES: Purity[] = ["18K", "20K", "22K", "24K"];

/** Loan-to-value used to derive the eligible loan amount from gold value. */
export const LTV = 0.75;

export function formatINR(value: number, currency = "₹"): string {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));
  return `${rounded < 0 ? "-" : ""}${currency}${formatted}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function goldValue(weightGrams: number, goldRate: number, purity: Purity): number {
  return (weightGrams || 0) * (goldRate || 0) * PURITY_FACTORS[purity];
}

export function ratesByPurity(rate24k: number): Record<Purity, number> {
  return {
    "24K": Math.round(rate24k),
    "22K": Math.round(rate24k * PURITY_FACTORS["22K"]),
    "20K": Math.round(rate24k * PURITY_FACTORS["20K"]),
    "18K": Math.round(rate24k * PURITY_FACTORS["18K"]),
  };
}

/** Standard EMI formula: P*r*(1+r)^n / ((1+r)^n - 1) */
export function calcEmi(principal: number, annualRate: number, months: number): number {
  if (!principal || !months) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export interface LoanMath {
  emi: number;
  totalPayable: number;
  totalInterest: number;
}

export function loanMath(principal: number, annualRate: number, months: number): LoanMath {
  const emi = calcEmi(principal, annualRate, months);
  const totalPayable = emi * months;
  return {
    emi: Math.round(emi),
    totalPayable: Math.round(totalPayable),
    totalInterest: Math.round(totalPayable - principal),
  };
}

export function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
