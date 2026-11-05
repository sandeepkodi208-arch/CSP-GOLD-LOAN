import type {
  Appraisal,
  Customer,
  GoldRate,
  Loan,
  Payment,
  Settings,
} from "@/types";
import { addMonths, goldValue, loanMath, LTV } from "./finance";

const PREFIX = "glms:";
export const KEYS = {
  auth: `${PREFIX}auth`,
  customers: `${PREFIX}customers`,
  appraisals: `${PREFIX}appraisals`,
  loans: `${PREFIX}loans`,
  payments: `${PREFIX}payments`,
  goldRate: `${PREFIX}goldRate`,
  goldRateHistory: `${PREFIX}goldRateHistory`,
  settings: `${PREFIX}settings`,
  seeded: `${PREFIX}seeded:v1`,
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

export function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

export const DEFAULT_SETTINGS: Settings = {
  adminName: "Admin User",
  username: "admin",
  email: "admin@shreegold.in",
  mobile: "9876543210",
  companyName: "Shree Gold Finance",
  currency: "₹",
  password: "admin123",
  theme: "light",
  defaultLTV: 75,
  defaultTenureMonths: 12,
  defaultInterestRate: 12,
  defaultProcessingFee: 500,
  autoBackup: true,
};

export const DEFAULT_RATE: GoldRate = { rate24k: 7420, updatedAt: new Date().toISOString() };

/* ---------- collections ---------- */

export const getCustomers = () => read<Customer[]>(KEYS.customers, []);
export const setCustomers = (v: Customer[]) => write(KEYS.customers, v);
export const getAppraisals = () => read<Appraisal[]>(KEYS.appraisals, []);
export const setAppraisals = (v: Appraisal[]) => write(KEYS.appraisals, v);
export const getLoans = () => read<Loan[]>(KEYS.loans, []);
export const setLoans = (v: Loan[]) => write(KEYS.loans, v);
export const getPayments = () => read<Payment[]>(KEYS.payments, []);
export const setPayments = (v: Payment[]) => write(KEYS.payments, v);
export const getGoldRate = () => read<GoldRate>(KEYS.goldRate, DEFAULT_RATE);
export const setGoldRate = (v: GoldRate) => write(KEYS.goldRate, v);
export const getRateHistory = () => read<GoldRate[]>(KEYS.goldRateHistory, []);
export const setRateHistory = (v: GoldRate[]) => write(KEYS.goldRateHistory, v);
export const getSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) });
export const setSettings = (v: Settings) => write(KEYS.settings, v);

export function nextCode(prefix: string, existing: { code: string }[]): string {
  const nums = existing
    .map((e) => Number(e.code.replace(/\D/g, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/* ---------- auth ---------- */

export function isLoggedIn(): boolean {
  return read<boolean>(KEYS.auth, false) === true;
}

export function login(username: string, password: string): boolean {
  const settings = getSettings();

  const enteredUsername = username.trim().toLowerCase();
  const savedUsername = settings.username.trim().toLowerCase();

  if (
    enteredUsername === savedUsername &&
    password === settings.password
  ) {
    write(KEYS.auth, true);
    return true;
  }

  return false;
}

export function logout(): void {
  write(KEYS.auth, false);
}

/* ---------- demo data ---------- */

const DEMO_CUSTOMERS: Omit<Customer, "id" | "createdAt">[] = [
  {
    code: "CUST0001",
    fullName: "Ramesh Iyer",
    mobile: "9845012345",
    aadhaar: "4521 8899 1023",
    email: "ramesh.iyer@gmail.com",
    address: "12, Gandhi Street, T Nagar, Chennai",
    dob: "1979-04-12",
    occupation: "Textile Trader",
    status: "Active",
  },
  {
    code: "CUST0002",
    fullName: "Lakshmi Narayanan",
    mobile: "9900123456",
    aadhaar: "7788 4512 9087",
    email: "lakshmi.n@yahoo.in",
    address: "45/2, Bazaar Road, Madurai",
    dob: "1985-11-03",
    occupation: "School Teacher",
    status: "Active",
  },
  {
    code: "CUST0003",
    fullName: "Suresh Kumar",
    mobile: "9812345670",
    aadhaar: "1290 5566 3344",
    email: "suresh.kumar@outlook.com",
    address: "8, Anna Nagar West, Coimbatore",
    dob: "1972-01-25",
    occupation: "Farmer",
    status: "Active",
  },
  {
    code: "CUST0004",
    fullName: "Anita Deshmukh",
    mobile: "9765432109",
    aadhaar: "3344 7788 1122",
    email: "anita.d@gmail.com",
    address: "301, Shivaji Colony, Pune",
    dob: "1990-07-19",
    occupation: "Boutique Owner",
    status: "Active",
  },
  {
    code: "CUST0005",
    fullName: "Mohammed Farhan",
    mobile: "9701122334",
    aadhaar: "9911 2233 4455",
    email: "farhan.m@gmail.com",
    address: "22, Charminar Road, Hyderabad",
    dob: "1988-09-05",
    occupation: "Auto Dealer",
    status: "Inactive",
  },
  {
    code: "CUST0006",
    fullName: "Priya Venkatesh",
    mobile: "9600088776",
    aadhaar: "5566 1122 8899",
    email: "priya.v@gmail.com",
    address: "7, Lake View Street, Bengaluru",
    dob: "1993-02-27",
    occupation: "Software Engineer",
    status: "Active",
  },
];

interface DemoLoan {
  customerIdx: number;
  ornament: string;
  purity: Appraisal["purity"];
  weight: number;
  amount: number;
  rate: number;
  tenure: number;
  monthsAgo: number;
  paidEmis: number;
  status: Loan["status"];
}

const DEMO_LOANS: DemoLoan[] = [
  { customerIdx: 0, ornament: "Gold Necklace", purity: "22K", weight: 42, amount: 200000, rate: 12, tenure: 12, monthsAgo: 4, paidEmis: 4, status: "Active" },
  { customerIdx: 1, ornament: "Bangles (4 pcs)", purity: "22K", weight: 28, amount: 140000, rate: 11.5, tenure: 18, monthsAgo: 6, paidEmis: 6, status: "Active" },
  { customerIdx: 2, ornament: "Gold Chain", purity: "24K", weight: 18, amount: 95000, rate: 13, tenure: 12, monthsAgo: 5, paidEmis: 2, status: "Overdue" },
  { customerIdx: 3, ornament: "Ear Studs & Ring", purity: "18K", weight: 15, amount: 55000, rate: 12.5, tenure: 9, monthsAgo: 9, paidEmis: 9, status: "Closed" },
  { customerIdx: 5, ornament: "Temple Jewellery Set", purity: "22K", weight: 65, amount: 320000, rate: 11, tenure: 24, monthsAgo: 2, paidEmis: 2, status: "Active" },
  { customerIdx: 4, ornament: "Gold Coins (5)", purity: "24K", weight: 50, amount: 260000, rate: 12, tenure: 12, monthsAgo: 7, paidEmis: 3, status: "Overdue" },
];

const MODES: Payment["mode"][] = ["Cash", "UPI", "Bank Transfer", "Card"];

export function seedIfEmpty(): void {
  if (!isBrowser()) return;
  if (read<boolean>(KEYS.seeded, false)) return;

  const rate = getGoldRate();
  const now = new Date();

  const customers: Customer[] = DEMO_CUSTOMERS.map((c, i) => ({
    ...c,
    id: `cust-${i + 1}`,
    createdAt: new Date(now.getFullYear(), now.getMonth() - (10 - i), 5).toISOString().slice(0, 10),
  }));

  const appraisals: Appraisal[] = [];
  const loans: Loan[] = [];
  const payments: Payment[] = [];

  DEMO_LOANS.forEach((d, i) => {
    const customer = customers[d.customerIdx]!;
    const value = Math.round(goldValue(d.weight, rate.rate24k, d.purity));
    const start = new Date(now.getFullYear(), now.getMonth() - d.monthsAgo, 10)
      .toISOString()
      .slice(0, 10);
    const math = loanMath(d.amount, d.rate, d.tenure);
    const loanId = `loan-${i + 1}`;
    const appraisalId = `appr-${i + 1}`;

    appraisals.push({
      id: appraisalId,
      code: `APR${String(i + 1).padStart(4, "0")}`,
      customerId: customer.id,
      ornamentName: d.ornament,
      purity: d.purity,
      weightGrams: d.weight,
      goldRate: rate.rate24k,
      estimatedValue: value,
      createdAt: start,
      loanId,
    });

    let outstanding = math.totalPayable;
    for (let p = 0; p < d.paidEmis; p++) {
      outstanding = Math.max(0, outstanding - math.emi);
      payments.push({
        id: `pay-${i + 1}-${p + 1}`,
        code: `PMT${String(payments.length + 1).padStart(4, "0")}`,
        loanId,
        customerId: customer.id,
        date: addMonths(start, p + 1),
        amount: math.emi,
        mode: MODES[(i + p) % MODES.length]!,
        transactionId: `TXN${100000 + i * 17 + p}`,
      });
    }
    if (d.status === "Closed") outstanding = 0;

    loans.push({
      id: loanId,
      code: `LN${String(i + 1).padStart(4, "0")}`,
      customerId: customer.id,
      appraisalId,
      eligibleAmount: Math.round(value * LTV),
      loanAmount: d.amount,
      interestRate: d.rate,
      tenureMonths: d.tenure,
      processingFee: Math.round(d.amount * 0.01),
      emi: math.emi,
      totalInterest: math.totalInterest,
      totalPayable: math.totalPayable,
      outstanding,
      status: d.status,
      startDate: start,
      nextDueDate: addMonths(start, d.paidEmis + 1),
    });
  });

  setCustomers(customers);
  setAppraisals(appraisals);
  setLoans(loans);
  setPayments(payments);
  setGoldRate(rate);
  setRateHistory([
    { rate24k: rate.rate24k, updatedAt: new Date().toISOString() },
    { rate24k: rate.rate24k - 55, updatedAt: new Date(Date.now() - 864e5).toISOString() },
    { rate24k: rate.rate24k - 120, updatedAt: new Date(Date.now() - 2 * 864e5).toISOString() },
  ]);
  if (!read(KEYS.settings, null)) setSettings(DEFAULT_SETTINGS);
  write(KEYS.seeded, true);
}

/* ---------- backup & export ---------- */

export function exportAllData(): string {
  return JSON.stringify(
    {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      data: {
        customers: getCustomers(),
        appraisals: getAppraisals(),
        loans: getLoans(),
        payments: getPayments(),
        goldRate: getGoldRate(),
        rateHistory: getRateHistory(),
        settings: getSettings(),
      },
    },
    null,
    2,
  );
}

export function importAllData(jsonString: string): boolean {
  try {
    const backup = JSON.parse(jsonString);
    if (!backup.data) throw new Error("Invalid backup format");

    setCustomers(backup.data.customers || []);
    setAppraisals(backup.data.appraisals || []);
    setLoans(backup.data.loans || []);
    setPayments(backup.data.payments || []);
    if (backup.data.goldRate) setGoldRate(backup.data.goldRate);
    if (backup.data.rateHistory) setRateHistory(backup.data.rateHistory);
    if (backup.data.settings) setSettings(backup.data.settings);

    return true;
  } catch {
    return false;
  }
}

export function downloadBackup(): void {
  const data = exportAllData();
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(data));
  element.setAttribute("download", `glms-backup-${new Date().toISOString().slice(0, 10)}.json`);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
