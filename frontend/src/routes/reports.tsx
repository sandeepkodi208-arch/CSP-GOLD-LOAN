import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  IndianRupee,
  Landmark,
  Printer,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import {
  Btn,
  Empty,
  Panel,
  Select,
  StatCard,
  StatusBadge,
  TableWrap,
  Td,
  TextInput,
  Th,
} from "@/components/ui-kit";

import { useAppData } from "@/hooks/useAppData";

import {
  formatDate,
  formatINR,
} from "@/lib/finance";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomers, fetchLoans, fetchPayments, fetchAppraisals } from "@/lib/api";

import type {
  Appraisal,
  Customer,
  Loan,
  Payment,
} from "@/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      {
        title: "Reports — Shree Gold Finance",
      },
      {
        name: "description",
        content:
          "View gold loan portfolio, collections, outstanding balances and customer reports.",
      },
      {
        property: "og:title",
        content: "Reports — Shree Gold Finance",
      },
      {
        property: "og:description",
        content:
          "Business reports and financial summaries for gold loan management.",
      },
    ],
  }),
  component: ReportsPage,
});

type QuickFilter =
  | "All Time"
  | "Today"
  | "This Month"
  | "Last 30 Days";

const PAYMENT_MODES = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
] as const;

function ReportsPage() {
  const { ready, version } = useAppData();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [quickFilter, setQuickFilter] =
    useState<QuickFilter>("All Time");

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers, enabled: ready });
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: fetchLoans, enabled: ready });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: fetchPayments, enabled: ready });
  const { data: appraisals = [] } = useQuery({ queryKey: ["appraisals"], queryFn: fetchAppraisals, enabled: ready });

  if (!ready) {
    return <AppShell title="Reports">{null}</AppShell>;
  }

  function toISODate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  function applyQuickFilter(filter: QuickFilter) {
    const today = new Date();
    const todayISO = toISODate(today);

    setQuickFilter(filter);

    if (filter === "All Time") {
      setFromDate("");
      setToDate("");
      return;
    }

    if (filter === "Today") {
      setFromDate(todayISO);
      setToDate(todayISO);
      return;
    }

    if (filter === "This Month") {
      const firstDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );

      setFromDate(toISODate(firstDay));
      setToDate(todayISO);
      return;
    }

    if (filter === "Last 30 Days") {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);

      setFromDate(toISODate(start));
      setToDate(todayISO);
    }
  }

  function handleFromDateChange(value: string) {
    setQuickFilter("All Time");
    setFromDate(value);
  }

  function handleToDateChange(value: string) {
    setQuickFilter("All Time");
    setToDate(value);
  }

  function isWithinDateRange(date: string) {
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  }

  const filteredLoans = loans.filter((loan) => {
    const matchesDate = isWithinDateRange(loan.startDate);

    const matchesStatus =
      statusFilter === "All" ||
      loan.status === statusFilter;

    return matchesDate && matchesStatus;
  });

  const filteredPayments = payments.filter((payment) =>
    isWithinDateRange(payment.date),
  );

  const filteredAppraisals = appraisals.filter((appraisal) =>
    isWithinDateRange(appraisal.createdAt),
  );

  const totalLoanAmount = filteredLoans.reduce(
    (sum, loan) => sum + loan.loanAmount,
    0,
  );

  const totalPayable = filteredLoans.reduce(
    (sum, loan) => sum + loan.totalPayable,
    0,
  );

  const totalOutstanding = filteredLoans.reduce(
    (sum, loan) => sum + loan.outstanding,
    0,
  );

  const totalCollected = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const totalInterest = filteredLoans.reduce(
    (sum, loan) => sum + loan.totalInterest,
    0,
  );

  const totalProcessingFees = filteredLoans.reduce(
    (sum, loan) => sum + loan.processingFee,
    0,
  );

  const activeLoans = filteredLoans.filter(
    (loan) => loan.status === "Active",
  );

  const overdueLoans = filteredLoans.filter(
    (loan) => loan.status === "Overdue",
  );

  const closedLoans = filteredLoans.filter(
    (loan) => loan.status === "Closed",
  );

  const averageLoanAmount =
    filteredLoans.length > 0
      ? totalLoanAmount / filteredLoans.length
      : 0;

  const averagePayment =
    filteredPayments.length > 0
      ? totalCollected / filteredPayments.length
      : 0;

  const goldValue = filteredAppraisals.reduce(
    (sum, appraisal) => sum + appraisal.estimatedValue,
    0,
  );

  const customerMap = new Map<string, Customer>(
    customers.map((customer) => [customer.id, customer]),
  );

  const appraisalMap = new Map<string, Appraisal>(
    appraisals.map((appraisal) => [appraisal.id, appraisal]),
  );

  const loanMap = new Map<string, Loan>(
    loans.map((loan) => [loan.id, loan]),
  );

  const getCustomerName = (id: string) =>
    customerMap.get(id)?.fullName ?? "Unknown Customer";

  const getCustomerCode = (id: string) =>
    customerMap.get(id)?.code ?? "—";

  const getCustomerMobile = (id: string) =>
    customerMap.get(id)?.mobile ?? "—";

  const getAppraisal = (id: string) =>
    appraisalMap.get(id);

  const getLoan = (id: string) =>
    loanMap.get(id);

  const recentPayments = [...filteredPayments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const portfolioLoans = [...filteredLoans]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 10);

  const topOutstandingLoans = [...filteredLoans]
    .filter((loan) => loan.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 5);

  const overdueReport = [...overdueLoans]
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 10);

  const paymentModeSummary = PAYMENT_MODES.map((mode) => {
    const modePayments = filteredPayments.filter(
      (payment) => payment.mode === mode,
    );

    const amount = modePayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    const percentage =
      totalCollected > 0
        ? Math.round((amount / totalCollected) * 100)
        : 0;

    return {
      mode,
      count: modePayments.length,
      amount,
      percentage,
    };
  });

  const statusSummary = [
    {
      label: "Active",
      count: activeLoans.length,
      percentage:
        filteredLoans.length > 0
          ? Math.round(
            (activeLoans.length / filteredLoans.length) * 100,
          )
          : 0,
    },
    {
      label: "Overdue",
      count: overdueLoans.length,
      percentage:
        filteredLoans.length > 0
          ? Math.round(
            (overdueLoans.length / filteredLoans.length) * 100,
          )
          : 0,
    },
    {
      label: "Closed",
      count: closedLoans.length,
      percentage:
        filteredLoans.length > 0
          ? Math.round(
            (closedLoans.length / filteredLoans.length) * 100,
          )
          : 0,
    },
  ];

  const customerSummary = customers
    .map((customer) => {
      const customerLoans = filteredLoans.filter(
        (loan) => loan.customerId === customer.id,
      );

      const customerPayments = filteredPayments.filter(
        (payment) => payment.customerId === customer.id,
      );

      const disbursed = customerLoans.reduce(
        (sum, loan) => sum + loan.loanAmount,
        0,
      );

      const outstanding = customerLoans.reduce(
        (sum, loan) => sum + loan.outstanding,
        0,
      );

      const collected = customerPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

      return {
        customer,
        loans: customerLoans.length,
        disbursed,
        collected,
        outstanding,
      };
    })
    .filter(
      (item) =>
        item.loans > 0 ||
        item.collected > 0,
    )
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 10);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive",
  ).length;

  const customersWithLoans = new Set(
    loans.map((loan) => loan.customerId),
  ).size;

  const collectionCoverage =
    totalPayable > 0
      ? Math.min(
        100,
        Math.round(
          (totalCollected / totalPayable) * 100,
        ),
      )
      : 0;

  const outstandingRatio =
    totalPayable > 0
      ? Math.round(
        (totalOutstanding / totalPayable) * 100,
      )
      : 0;

  function resetFilters() {
    setFromDate("");
    setToDate("");
    setStatusFilter("All");
    setQuickFilter("All Time");

    toast.success("Report filters reset.");
  }

  function printReport() {
    window.print();
  }

  function downloadReport() {
    const report = {
      generatedAt: new Date().toISOString(),

      filters: {
        quickFilter,
        fromDate: fromDate || "All",
        toDate: toDate || "All",
        status: statusFilter,
      },

      summary: {
        customers: customers.length,
        loans: filteredLoans.length,
        totalLoanAmount,
        totalPayable,
        totalCollected,
        totalOutstanding,
        totalInterest,
        totalProcessingFees,
        averageLoanAmount,
        averagePayment,
        goldValue,
      },

      paymentModeSummary,

      loanStatusSummary: statusSummary,

      customerSummary: customerSummary.map((item) => ({
        customerId: item.customer.id,
        customerCode: item.customer.code,
        customerName: item.customer.fullName,
        mobile: item.customer.mobile,
        loans: item.loans,
        disbursed: item.disbursed,
        collected: item.collected,
        outstanding: item.outstanding,
      })),

      loans: filteredLoans,
      payments: filteredPayments,
      appraisals: filteredAppraisals,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      {
        type: "application/json",
      },
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shree-gold-finance-report-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    toast.success("JSON report downloaded successfully.");
  }

  function csvEscape(value: unknown) {
    const text = String(value ?? "");

    if (
      text.includes(",") ||
      text.includes('"') ||
      text.includes("\n")
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  }

  function downloadCSV() {
    const rows: string[][] = [];

    rows.push([
      "Loan ID",
      "Customer",
      "Customer Code",
      "Mobile",
      "Gold Item",
      "Purity",
      "Weight (g)",
      "Loan Amount",
      "EMI",
      "Interest Rate",
      "Total Interest",
      "Total Payable",
      "Outstanding",
      "Processing Fee",
      "Start Date",
      "Next Due Date",
      "Status",
    ]);

    filteredLoans.forEach((loan) => {
      const customer = customerMap.get(
        loan.customerId,
      );

      const appraisal = appraisalMap.get(
        loan.appraisalId,
      );

      rows.push([
        loan.code,
        customer?.fullName ?? "Unknown Customer",
        customer?.code ?? "",
        customer?.mobile ?? "",
        appraisal?.ornamentName ?? "",
        appraisal?.purity ?? "",
        String(appraisal?.weightGrams ?? ""),
        String(loan.loanAmount),
        String(loan.emi),
        String(loan.interestRate),
        String(loan.totalInterest),
        String(loan.totalPayable),
        String(loan.outstanding),
        String(loan.processingFee),
        loan.startDate,
        loan.nextDueDate,
        loan.status,
      ]);
    });

    if (filteredLoans.length === 0) {
      rows.push([
        "",
        "No loans found for selected filters.",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
    }

    const csv = rows
      .map((row) =>
        row.map(csvEscape).join(","),
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shree-gold-finance-loans-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    toast.success("CSV report downloaded successfully.");
  }

  return (
    <AppShell
      title="Reports"
      subtitle="Financial overview, loan portfolio and collection reports"
      actions={
        <div className="flex flex-wrap gap-2">
          <Btn
            variant="outline"
            onClick={resetFilters}
          >
            <RefreshCw className="size-4" />
            Reset
          </Btn>

          <Btn
            variant="outline"
            onClick={downloadCSV}
          >
            <FileSpreadsheet className="size-4" />
            CSV
          </Btn>

          <Btn
            variant="outline"
            onClick={downloadReport}
          >
            <Download className="size-4" />
            JSON
          </Btn>

          <Btn onClick={printReport}>
            <Printer className="size-4" />
            Print
          </Btn>
        </div>
      }
    >
      <div className="space-y-5 print:space-y-3">

        {/* FILTERS */}
        <Panel
          title="Report Filters"
          description="Choose a date range, quick period and loan status."
        >
          <div className="space-y-4">

            <div>
              <p className="mb-2 text-sm font-medium">
                Quick Period
              </p>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "All Time",
                    "Today",
                    "This Month",
                    "Last 30 Days",
                  ] as QuickFilter[]
                ).map((filter) => (
                  <Btn
                    key={filter}
                    variant={
                      quickFilter === filter
                        ? "primary"
                        : "outline"
                    }
                    onClick={() =>
                      applyQuickFilter(filter)
                    }
                  >
                    {filter}
                  </Btn>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  From Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <TextInput
                    type="date"
                    value={fromDate}
                    onChange={(event) =>
                      handleFromDateChange(
                        event.target.value,
                      )
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  To Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <TextInput
                    type="date"
                    value={toDate}
                    onChange={(event) =>
                      handleToDateChange(
                        event.target.value,
                      )
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Loan Status
                </label>

                <Select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                >
                  <option value="All">
                    All Statuses
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Overdue">
                    Overdue
                  </option>

                  <option value="Closed">
                    Closed
                  </option>
                </Select>
              </div>
            </div>

            {(fromDate ||
              toDate ||
              statusFilter !== "All") && (
                <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Showing report data
                  {fromDate
                    ? ` from ${formatDate(fromDate)}`
                    : ""}
                  {toDate
                    ? ` to ${formatDate(toDate)}`
                    : ""}
                  {statusFilter !== "All"
                    ? ` • ${statusFilter} loans`
                    : ""}
                </div>
              )}
          </div>
        </Panel>

        {/* MAIN SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Disbursed"
            value={formatINR(totalLoanAmount)}
            hint={`${filteredLoans.length} loans`}
            icon={IndianRupee}
            tone="primary"
          />

          <StatCard
            label="Total Collected"
            value={formatINR(totalCollected)}
            hint={`${filteredPayments.length} payments`}
            icon={TrendingUp}
            tone="success"
          />

          <StatCard
            label="Outstanding"
            value={formatINR(totalOutstanding)}
            hint="Amount remaining"
            icon={TrendingDown}
            tone="warning"
          />

          <StatCard
            label="Customers"
            value={String(customers.length)}
            hint={`${customersWithLoans} with loans`}
            icon={Users}
            tone="primary"
          />
        </div>

        {/* FINANCIAL SUMMARY */}
        <Panel
          title="Financial Summary"
          description="Detailed financial figures for the selected report period."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryBox
              label="Total Payable"
              value={formatINR(totalPayable)}
              icon={
                <Wallet className="size-5" />
              }
            />

            <SummaryBox
              label="Total Interest"
              value={formatINR(totalInterest)}
              icon={
                <TrendingUp className="size-5" />
              }
            />

            <SummaryBox
              label="Processing Fees"
              value={formatINR(totalProcessingFees)}
              icon={
                <Landmark className="size-5" />
              }
            />

            <SummaryBox
              label="Gold Value"
              value={formatINR(goldValue)}
              icon={
                <Landmark className="size-5" />
              }
            />
          </div>
        </Panel>

        {/* LOAN STATUS */}
        <Panel
          title="Loan Status Overview"
          description="Current distribution of loans by status."
        >
          <div className="grid gap-4 md:grid-cols-3">

            {statusSummary.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>

                  <span className="text-sm font-semibold">
                    {item.percentage}%
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold">
                  {item.count}
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {item.count === 1
                    ? "1 loan"
                    : `${item.count} loans`}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* QUICK STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MiniReportCard
            label="Active Loans"
            value={activeLoans.length}
            description="Currently running"
          />

          <MiniReportCard
            label="Overdue Loans"
            value={overdueLoans.length}
            description="Require attention"
          />

          <MiniReportCard
            label="Closed Loans"
            value={closedLoans.length}
            description="Successfully completed"
          />

          <MiniReportCard
            label="Average Loan"
            value={formatINR(averageLoanAmount)}
            description="Average sanctioned amount"
          />
        </div>

        {/* PAYMENT MODE */}
        <Panel
          title="Collection by Payment Mode"
          description="Breakdown of collections by payment method."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {paymentModeSummary.map((item) => (
              <div
                key={item.mode}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {item.mode}
                  </span>

                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                    {item.percentage}%
                  </span>
                </div>

                <p className="mt-3 text-xl font-bold">
                  {formatINR(item.amount)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {item.count}{" "}
                  {item.count === 1
                    ? "transaction"
                    : "transactions"}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* LOAN PORTFOLIO */}
        <Panel
          title="Loan Portfolio"
          description={`${portfolioLoans.length} latest loans in the selected report`}
        >
          {portfolioLoans.length === 0 ? (
            <Empty message="No loans found for the selected filters." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Loan ID</Th>
                  <Th>Customer</Th>
                  <Th>Gold Item</Th>
                  <Th>Loan Amount</Th>
                  <Th>EMI</Th>
                  <Th>Outstanding</Th>
                  <Th>Start Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {portfolioLoans.map((loan) => {
                  const appraisal = getAppraisal(
                    loan.appraisalId,
                  );

                  return (
                    <tr key={loan.id}>
                      <Td className="font-medium">
                        {loan.code}
                      </Td>

                      <Td>
                        <div>
                          <div className="font-medium">
                            {getCustomerName(
                              loan.customerId,
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {getCustomerCode(
                              loan.customerId,
                            )}
                          </div>
                        </div>
                      </Td>

                      <Td>
                        {appraisal?.ornamentName ?? "—"}
                      </Td>

                      <Td>
                        {formatINR(loan.loanAmount)}
                      </Td>

                      <Td>
                        {formatINR(loan.emi)}
                      </Td>

                      <Td className="font-medium">
                        {formatINR(loan.outstanding)}
                      </Td>

                      <Td>
                        {formatDate(loan.startDate)}
                      </Td>

                      <Td>
                        <StatusBadge
                          status={loan.status}
                        />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        {/* TOP OUTSTANDING */}
        <Panel
          title="Top Outstanding Loans"
          description="Loans with the highest remaining balances."
        >
          {topOutstandingLoans.length === 0 ? (
            <Empty message="No outstanding loans found." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Loan ID</Th>
                  <Th>Customer</Th>
                  <Th>Loan Amount</Th>
                  <Th>Total Payable</Th>
                  <Th>Outstanding</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {topOutstandingLoans.map((loan) => (
                  <tr key={loan.id}>
                    <Td className="font-medium">
                      {loan.code}
                    </Td>

                    <Td>
                      {getCustomerName(
                        loan.customerId,
                      )}
                    </Td>

                    <Td>
                      {formatINR(loan.loanAmount)}
                    </Td>

                    <Td>
                      {formatINR(loan.totalPayable)}
                    </Td>

                    <Td className="font-semibold">
                      {formatINR(loan.outstanding)}
                    </Td>

                    <Td>
                      {formatDate(loan.nextDueDate)}
                    </Td>

                    <Td>
                      <StatusBadge
                        status={loan.status}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        {/* OVERDUE */}
        <Panel
          title="Overdue Loan Report"
          description="Loans that require immediate attention."
        >
          {overdueReport.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/20 p-6 text-center">
              <p className="font-medium">
                No overdue loans 🎉
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                There are no overdue loans in the selected report period.
              </p>
            </div>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Loan ID</Th>
                  <Th>Customer</Th>
                  <Th>Mobile</Th>
                  <Th>Outstanding</Th>
                  <Th>Due Date</Th>
                  <Th>Loan Status</Th>
                </tr>
              </thead>

              <tbody>
                {overdueReport.map((loan) => (
                  <tr key={loan.id}>
                    <Td className="font-medium">
                      {loan.code}
                    </Td>

                    <Td>
                      {getCustomerName(
                        loan.customerId,
                      )}
                    </Td>

                    <Td>
                      {getCustomerMobile(
                        loan.customerId,
                      )}
                    </Td>

                    <Td className="font-semibold">
                      {formatINR(loan.outstanding)}
                    </Td>

                    <Td>
                      {formatDate(loan.nextDueDate)}
                    </Td>

                    <Td>
                      <StatusBadge
                        status={loan.status}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        {/* COLLECTION REPORT */}
        <Panel
          title="Recent Collections"
          description="Latest payment transactions for the selected period"
        >
          {recentPayments.length === 0 ? (
            <Empty message="No payment transactions found." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Payment ID</Th>
                  <Th>Date</Th>
                  <Th>Customer</Th>
                  <Th>Loan ID</Th>
                  <Th>Amount</Th>
                  <Th>Mode</Th>
                  <Th>Transaction ID</Th>
                </tr>
              </thead>

              <tbody>
                {recentPayments.map((payment) => {
                  const loan = getLoan(
                    payment.loanId,
                  );

                  return (
                    <tr key={payment.id}>
                      <Td className="font-medium">
                        {payment.code}
                      </Td>

                      <Td>
                        {formatDate(payment.date)}
                      </Td>

                      <Td>
                        {getCustomerName(
                          payment.customerId,
                        )}
                      </Td>

                      <Td>
                        {loan?.code ?? "—"}
                      </Td>

                      <Td className="font-semibold">
                        {formatINR(payment.amount)}
                      </Td>

                      <Td>
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {payment.mode}
                        </span>
                      </Td>

                      <Td className="text-muted-foreground">
                        {payment.transactionId || "—"}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        {/* CUSTOMER + GOLD */}
        <div className="grid gap-4 lg:grid-cols-2">

          <Panel
            title="Customer Overview"
            description="Customer statistics"
          >
            <div className="grid gap-3 sm:grid-cols-2">

              <SummaryLine
                label="Total Customers"
                value={String(customers.length)}
              />

              <SummaryLine
                label="Active Customers"
                value={String(activeCustomers)}
              />

              <SummaryLine
                label="Inactive Customers"
                value={String(inactiveCustomers)}
              />

              <SummaryLine
                label="Customers With Loans"
                value={String(customersWithLoans)}
              />
            </div>
          </Panel>

          <Panel
            title="Gold Appraisal Overview"
            description="Gold pledged and appraised during the selected period"
          >
            <div className="grid gap-3 sm:grid-cols-2">

              <SummaryLine
                label="Total Appraisals"
                value={String(
                  filteredAppraisals.length,
                )}
              />

              <SummaryLine
                label="Estimated Gold Value"
                value={formatINR(goldValue)}
              />

              <SummaryLine
                label="Loan-Linked Appraisals"
                value={String(
                  filteredAppraisals.filter(
                    (appraisal) =>
                      Boolean(appraisal.loanId),
                  ).length,
                )}
              />

              <SummaryLine
                label="Available Appraisals"
                value={String(
                  filteredAppraisals.filter(
                    (appraisal) =>
                      !appraisal.loanId,
                  ).length,
                )}
              />
            </div>
          </Panel>
        </div>

        {/* CUSTOMER-WISE REPORT */}
        <Panel
          title="Customer-wise Loan Summary"
          description="Top customers by outstanding loan balance."
        >
          {customerSummary.length === 0 ? (
            <Empty message="No customer loan data found." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Mobile</Th>
                  <Th>Loans</Th>
                  <Th>Disbursed</Th>
                  <Th>Collected</Th>
                  <Th>Outstanding</Th>
                </tr>
              </thead>

              <tbody>
                {customerSummary.map((item) => (
                  <tr key={item.customer.id}>
                    <Td>
                      <div>
                        <div className="font-medium">
                          {item.customer.fullName}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {item.customer.code}
                        </div>
                      </div>
                    </Td>

                    <Td>
                      {item.customer.mobile}
                    </Td>

                    <Td>
                      {item.loans}
                    </Td>

                    <Td>
                      {formatINR(item.disbursed)}
                    </Td>

                    <Td>
                      {formatINR(item.collected)}
                    </Td>

                    <Td className="font-semibold">
                      {formatINR(item.outstanding)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        {/* PERFORMANCE */}
        <Panel
          title="Collection Performance"
          description="Key collection indicators"
        >
          <div className="grid gap-4 md:grid-cols-3">

            <PerformanceBox
              label="Average Payment"
              value={formatINR(averagePayment)}
              description="Average amount per transaction"
            />

            <PerformanceBox
              label="Collection Coverage"
              value={`${collectionCoverage}%`}
              description="Collected against total payable"
            />

            <PerformanceBox
              label="Outstanding Ratio"
              value={`${outstandingRatio}%`}
              description="Remaining payable amount"
            />
          </div>
        </Panel>

        {/* REPORT TOTALS */}
        <Panel
          title="Report Totals"
          description="Overall figures based on the current filters."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryLine
              label="Loans in Report"
              value={String(filteredLoans.length)}
            />

            <SummaryLine
              label="Payments in Report"
              value={String(filteredPayments.length)}
            />

            <SummaryLine
              label="Appraisals in Report"
              value={String(
                filteredAppraisals.length,
              )}
            />

            <SummaryLine
              label="Total Collections"
              value={formatINR(totalCollected)}
            />
          </div>
        </Panel>

        {/* FOOTER */}
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Report generated on{" "}
              <strong className="text-foreground">
                {formatDate(
                  new Date()
                    .toISOString()
                    .slice(0, 10),
                )}
              </strong>
            </span>

            <span>
              Shree Gold Finance • Gold Loan Management
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function MiniReportCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

function PerformanceBox({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}