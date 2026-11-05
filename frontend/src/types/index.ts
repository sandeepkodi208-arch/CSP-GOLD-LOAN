export type Purity = "18K" | "20K" | "22K" | "24K";

export interface Customer {
  id: string;
  code: string;
  fullName: string;
  mobile: string;
  aadhaar: string;
  email: string;
  address: string;
  dob: string;
  occupation: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Appraisal {
  id: string;
  code: string;
  customerId: string;
  ornamentName: string;
  purity: Purity;
  weightGrams: number;
  goldRate: number;
  estimatedValue: number;
  createdAt: string;
  loanId?: string;
}

export type LoanStatus = "Active" | "Closed" | "Overdue";

export interface Loan {
  id: string;
  code: string;
  customerId: string;
  appraisalId: string;
  eligibleAmount: number;
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  processingFee: number;
  emi: number;
  totalInterest: number;
  totalPayable: number;
  outstanding: number;
  status: LoanStatus;
  startDate: string;
  nextDueDate: string;
}

export type PaymentMode = "Cash" | "UPI" | "Bank Transfer" | "Card";

export interface Payment {
  id: string;
  code: string;
  loanId: string;
  customerId: string;
  date: string;
  amount: number;
  mode: PaymentMode;
  transactionId: string;
}

export interface GoldRate {
  rate24k: number;
  updatedAt: string;
}

export interface Settings {
  /* Admin Profile */
  adminName: string;
  username: string;
  email: string;
  mobile: string;

  /* Company */
  companyName: string;
  currency: string;

  /* Security */
  password: string;

  /* UI Preferences */
  theme: "light" | "dark";

  /* Business Rules */
  defaultLTV: number;
  defaultTenureMonths: number;
  defaultInterestRate: number;
  defaultProcessingFee: number;

  /* System Settings */
  autoBackup: boolean;
  lastBackupDate?: string;
}
