import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Eye,
  FilePlus2,
  IndianRupee,
  Search,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  Btn,
  Empty,
  Panel,
  Select,
  StatusBadge,
  TableWrap,
  Td,
  TextInput,
  Th,
} from "@/components/ui-kit";
import { useAppData } from "@/hooks/useAppData";
import { formatDate, formatINR } from "@/lib/finance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, fetchAppraisals, fetchLoans, fetchPayments, updateLoan } from "@/lib/api";
import type { Loan } from "@/types";

export const Route = createFileRoute("/loans/")({
  head: () => ({
    meta: [
      {
        title: "Loan Management — Shree Gold Finance",
      },
      {
        name: "description",
        content:
          "Manage gold loans, EMI, outstanding balances, payments and loan closure.",
      },
      {
        property: "og:title",
        content: "Loan Management — Shree Gold Finance",
      },
    ],
  }),
  component: LoansPage,
});

function LoansPage() {
  const { ready, version, refresh } = useAppData();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [viewing, setViewing] = useState<Loan | null>(null);

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers, enabled: ready });
  const { data: appraisals = [] } = useQuery({ queryKey: ["appraisals"], queryFn: fetchAppraisals, enabled: ready });
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: fetchLoans, enabled: ready });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: fetchPayments, enabled: ready });

  const qc = useQueryClient();
  const updateLoanQ = useMutation({
    mutationFn: ({ id, data }: any) => updateLoan(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); refresh(); }
  });

  if (!ready) {
    return <AppShell title="Loan Management">{null}</AppShell>;
  }

  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.fullName ?? "Unknown Customer";

  const customerCode = (id: string) =>
    customers.find((c) => c.id === id)?.code ?? "—";

  const ornament = (id: string) =>
    appraisals.find((a) => a.id === id)?.ornamentName ?? "—";

  const selectedAppraisal = (id: string) =>
    appraisals.find((a) => a.id === id);

  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);

  const totalOutstanding = loans
    .filter((loan) => loan.status !== "Closed")
    .reduce((sum, loan) => sum + loan.outstanding, 0);

  const activeLoans = loans.filter((loan) => loan.status === "Active").length;

  const overdueLoans = loans.filter(
    (loan) => loan.status === "Overdue",
  ).length;

  const dueSoonLoans = loans.filter((loan) => {
    if (loan.status === "Closed") return false;
    const due = new Date(`${loan.nextDueDate}T00:00:00`);
    const now = new Date();
    const limit = new Date(now);
    limit.setDate(limit.getDate() + 7);
    return due >= new Date(now.toDateString()) && due <= limit;
  }).length;

  const filtered = loans.filter((loan) => {
    if (status !== "All" && loan.status !== status) {
      return false;
    }

    const q = query.trim().toLowerCase();

    if (!q) {
      return true;
    }

    return `${loan.code} ${customerName(loan.customerId)} ${customerCode(
      loan.customerId,
    )} ${ornament(loan.appraisalId)} ${loan.status}`
      .toLowerCase()
      .includes(q);
  });

  function closeLoan(loan: Loan) {
    if (loan.status === "Closed") {
      toast.error("Loan is already closed.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to close ${loan.code}?\n\nOutstanding amount: ${formatINR(
        loan.outstanding,
      )}\n\nThis will mark the loan as fully settled.`,
    );

    if (!confirmed) {
      return;
    }

    updateLoanQ.mutate({ id: loan.id, data: { status: "Closed", outstanding: 0 } }, {
      onSuccess: () => {
        toast.success(`${loan.code} has been closed successfully.`);
        setViewing(null);
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to close loan")
    });
  }

  return (
    <AppShell
      title="Loan Management"
      subtitle="Manage sanctioned gold loans and repayment status"
      actions={
        <Link to="/loans/new">
          <Btn>
            <FilePlus2 className="size-4" />
            New Loan
          </Btn>
        </Link>
      }
    >
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Loans</p>
            <WalletCards className="size-5 text-primary" />
          </div>
          <p className="mt-2 font-display text-2xl">{loans.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeLoans} active loans
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Disbursed</p>
            <IndianRupee className="size-5 text-primary" />
          </div>
          <p className="mt-2 font-display text-2xl">
            {formatINR(totalLoanAmount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across all sanctioned loans
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <WalletCards className="size-5 text-primary" />
          </div>
          <p className="mt-2 font-display text-2xl">
            {formatINR(totalOutstanding)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Amount yet to be collected
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Overdue Loans</p>
            <AlertCircle className="size-5 text-destructive" />
          </div>
          <p className="mt-2 font-display text-2xl">{overdueLoans}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Require collection follow-up
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Due in 7 Days</p>
            <CalendarClock className="size-5 text-primary" />
          </div>
          <p className="mt-2 font-display text-2xl">{dueSoonLoans}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Plan upcoming collections
          </p>
        </div>
      </div>

      {/* Loan Table */}
      <Panel
        title="Loan Book"
        description={`${filtered.length} of ${loans.length} loans`}
        actions={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search loan, customer, item..."
                className="pl-9 sm:w-72"
              />
            </div>

            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="sm:w-40"
            >
              {["All", "Active", "Overdue", "Closed"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <Empty message="No loans match the current filters." />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Loan ID</Th>
                <Th>Customer</Th>
                <Th>Gold Item</Th>
                <Th>Loan Amount</Th>
                <Th>Rate</Th>
                <Th>EMI</Th>
                <Th>Due Date</Th>
                <Th>Outstanding</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((loan) => (
                <tr key={loan.id}>
                  <Td className="font-medium">{loan.code}</Td>

                  <Td>
                    <div>
                      <p className="font-medium">
                        {customerName(loan.customerId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customerCode(loan.customerId)}
                      </p>
                    </div>
                  </Td>

                  <Td className="text-muted-foreground">
                    {ornament(loan.appraisalId)}
                  </Td>

                  <Td>{formatINR(loan.loanAmount)}</Td>

                  <Td>{loan.interestRate}%</Td>

                  <Td>{formatINR(loan.emi)}</Td>

                  <Td>{formatDate(loan.nextDueDate)}</Td>

                  <Td className="font-medium">
                    {formatINR(loan.outstanding)}
                  </Td>

                  <Td>
                    <StatusBadge status={loan.status} />
                  </Td>

                  <Td>
                    <div className="flex justify-end gap-1">
                      <Btn
                        variant="ghost"
                        className="px-2"
                        onClick={() => setViewing(loan)}
                        title="View loan"
                      >
                        <Eye className="size-4" />
                      </Btn>

                      <Btn
                        variant="outline"
                        className="px-2 text-xs"
                        onClick={() => closeLoan(loan)}
                        disabled={loan.status === "Closed"}
                      >
                        Close
                      </Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>

      {/* Loan Details Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl">
                    {viewing.code}
                  </h2>

                  <StatusBadge status={viewing.status} />
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {customerName(viewing.customerId)} ·{" "}
                  {customerCode(viewing.customerId)}
                </p>
              </div>

              <Btn
                variant="ghost"
                className="px-2"
                onClick={() => setViewing(null)}
              >
                <X className="size-4" />
              </Btn>
            </div>

            {/* Loan Information */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold">
                Loan Information
              </h3>

              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  ["Loan Amount", formatINR(viewing.loanAmount)],
                  ["Eligible Amount", formatINR(viewing.eligibleAmount)],
                  ["Interest Rate", `${viewing.interestRate}% p.a.`],
                  ["Tenure", `${viewing.tenureMonths} months`],
                  ["Monthly EMI", formatINR(viewing.emi)],
                  ["Processing Fee", formatINR(viewing.processingFee)],
                  ["Total Interest", formatINR(viewing.totalInterest)],
                  ["Total Payable", formatINR(viewing.totalPayable)],
                  ["Outstanding", formatINR(viewing.outstanding)],
                  ["Start Date", formatDate(viewing.startDate)],
                  ["Next Due", formatDate(viewing.nextDueDate)],
                  ["Status", viewing.status],
                ].map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg bg-muted px-3 py-3"
                  >
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      {key}
                    </dt>

                    <dd className="mt-1 text-sm font-medium">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Gold Information */}
            {selectedAppraisal(viewing.appraisalId) && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold">
                  Pledged Gold Details
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  {[
                    [
                      "Item",
                      selectedAppraisal(viewing.appraisalId)?.ornamentName ?? "—",
                    ],
                    [
                      "Purity",
                      selectedAppraisal(viewing.appraisalId)?.purity ?? "—",
                    ],
                    [
                      "Weight",
                      `${selectedAppraisal(viewing.appraisalId)?.weightGrams ?? 0} g`,
                    ],
                    [
                      "Appraised Value",
                      formatINR(
                        selectedAppraisal(viewing.appraisalId)
                          ?.estimatedValue ?? 0,
                      ),
                    ],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border px-3 py-3"
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {key}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Payment History
                </h3>

                <span className="text-xs text-muted-foreground">
                  {payments.filter((p) => p.loanId === viewing.id).length}{" "}
                  payments
                </span>
              </div>

              {payments.filter((p) => p.loanId === viewing.id).length ===
                0 ? (
                <Empty message="No payments recorded for this loan." />
              ) : (
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <TableWrap>
                    <thead>
                      <tr>
                        <Th>Date</Th>
                        <Th>Mode</Th>
                        <Th>Transaction</Th>
                        <Th className="text-right">Amount</Th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments
                        .filter((p) => p.loanId === viewing.id)
                        .map((payment) => (
                          <tr key={payment.id}>
                            <Td>{formatDate(payment.date)}</Td>
                            <Td>{payment.mode}</Td>
                            <Td className="text-muted-foreground">
                              {payment.transactionId || "—"}
                            </Td>
                            <Td className="text-right font-medium">
                              {formatINR(payment.amount)}
                            </Td>
                          </tr>
                        ))}
                    </tbody>
                  </TableWrap>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Btn
                variant="outline"
                onClick={() => setViewing(null)}
              >
                Close Window
              </Btn>

              {viewing.status !== "Closed" && (
                <Btn
                  variant="danger"
                  onClick={() => closeLoan(viewing)}
                >
                  <CheckCircle2 className="size-4" />
                  Close Loan
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}