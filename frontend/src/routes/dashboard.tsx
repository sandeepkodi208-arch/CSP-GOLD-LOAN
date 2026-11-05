import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BadgeIndianRupee,
  Banknote,
  CalendarDays,
  Coins,
  IndianRupee,
  Percent,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import {
  Btn,
  Empty,
  Panel,
  StatCard,
  StatusBadge,
  TableWrap,
  Td,
  Th,
} from "@/components/ui-kit";
import { useAppData } from "@/hooks/useAppData";
import { formatDate, formatINR } from "@/lib/finance";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers, fetchLoans, fetchPayments, fetchAppraisals, fetchLatestGoldRate } from "@/lib/api";
import { DEFAULT_RATE } from "@/lib/storage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Gold Loan Management System" },
      {
        name: "description",
        content:
          "Portfolio snapshot: customers, gold loans, disbursements, collections, outstanding dues, overdue accounts and gold rate.",
      },
      { property: "og:title", content: "Gold Loan Dashboard" },
      {
        property: "og:description",
        content:
          "Track customers, active loans, EMI collections, overdue accounts and gold rates.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { ready, version } = useAppData();
  void version;

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers, enabled: ready });
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: fetchLoans, enabled: ready });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: fetchPayments, enabled: ready });
  const { data: appraisals = [] } = useQuery({ queryKey: ["appraisals"], queryFn: fetchAppraisals, enabled: ready });
  const { data: goldRate } = useQuery({ queryKey: ["goldRate"], queryFn: fetchLatestGoldRate, enabled: ready });

  const rate = goldRate || DEFAULT_RATE;

  if (!ready) {
    return <AppShell title="Dashboard">{null}</AppShell>;
  }

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */

  const today = new Date().toISOString().slice(0, 10);

  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.fullName ?? "—";

  const customerMobile = (id: string) =>
    customers.find((c) => c.id === id)?.mobile ?? "—";

  const ornament = (id: string) =>
    appraisals.find((a) => a.id === id)?.ornamentName ?? "—";

  const appraisal = (id: string) =>
    appraisals.find((a) => a.id === id);

  /* -------------------------------------------------------------------------- */
  /* Portfolio calculations                                                     */
  /* -------------------------------------------------------------------------- */

  const activeLoans = loans.filter((loan) => loan.status === "Active");
  const overdueLoans = loans.filter((loan) => loan.status === "Overdue");
  const closedLoans = loans.filter((loan) => loan.status === "Closed");

  const openLoans = loans.filter((loan) => loan.status !== "Closed");

  const totalDisbursed = loans.reduce(
    (sum, loan) => sum + loan.loanAmount,
    0,
  );

  const totalCollected = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const totalOutstanding = openLoans.reduce(
    (sum, loan) => sum + loan.outstanding,
    0,
  );

  const overdueOutstanding = overdueLoans.reduce(
    (sum, loan) => sum + loan.outstanding,
    0,
  );

  const totalInterest = loans.reduce(
    (sum, loan) => sum + loan.totalInterest,
    0,
  );

  const totalProcessingFees = loans.reduce(
    (sum, loan) => sum + loan.processingFee,
    0,
  );

  const totalPayable = loans.reduce(
    (sum, loan) => sum + loan.totalPayable,
    0,
  );

  const totalGoldValue = appraisals.reduce(
    (sum, item) => sum + item.estimatedValue,
    0,
  );

  /* -------------------------------------------------------------------------- */
  /* Customer calculations                                                      */
  /* -------------------------------------------------------------------------- */

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive",
  ).length;

  /* -------------------------------------------------------------------------- */
  /* Due calculations                                                           */
  /* -------------------------------------------------------------------------- */

  const dueToday = openLoans.filter(
    (loan) => loan.nextDueDate === today,
  );

  const upcomingDues = openLoans
    .filter((loan) => loan.nextDueDate >= today)
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));

  const dueTodayAmount = dueToday.reduce(
    (sum, loan) => sum + loan.outstanding,
    0,
  );

  /* -------------------------------------------------------------------------- */
  /* Recent records                                                             */
  /* -------------------------------------------------------------------------- */

  const recentLoans = [...loans]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 7);

  const recentPayments = [...payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  /* -------------------------------------------------------------------------- */
  /* Top outstanding loans                                                      */
  /* -------------------------------------------------------------------------- */

  const topOutstandingLoans = [...openLoans]
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 5);

  /* -------------------------------------------------------------------------- */
  /* Payment modes                                                              */
  /* -------------------------------------------------------------------------- */

  const cashCollected = payments
    .filter((payment) => payment.mode === "Cash")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const upiCollected = payments
    .filter((payment) => payment.mode === "UPI")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const bankCollected = payments
    .filter((payment) => payment.mode === "Bank Transfer")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const cardCollected = payments
    .filter((payment) => payment.mode === "Card")
    .reduce((sum, payment) => sum + payment.amount, 0);

  /* -------------------------------------------------------------------------- */
  /* Loan percentages                                                           */
  /* -------------------------------------------------------------------------- */

  const totalLoanCount = loans.length || 1;

  const activePercentage = Math.round(
    (activeLoans.length / totalLoanCount) * 100,
  );

  const overduePercentage = Math.round(
    (overdueLoans.length / totalLoanCount) * 100,
  );

  const closedPercentage = Math.round(
    (closedLoans.length / totalLoanCount) * 100,
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle="Portfolio snapshot across all branches"
    >
      {/* -------------------------------------------------------------------- */}
      {/* Quick Actions                                                        */}
      {/* -------------------------------------------------------------------- */}

      <div className="mb-5 flex flex-wrap gap-2">
        <Link to="/customers">
          <Btn>
            <Users className="mr-2 size-4" />
            Customers
          </Btn>
        </Link>

        <Link to="/appraisal">
          <Btn variant="outline">
            <Coins className="mr-2 size-4" />
            Appraisals
          </Btn>
        </Link>

        <Link to="/loans">
          <Btn variant="outline">
            <BadgeIndianRupee className="mr-2 size-4" />
            Loans
          </Btn>
        </Link>


      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Main Statistics                                                       */}
      {/* -------------------------------------------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={String(customers.length)}
          hint={`${activeCustomers} active · ${inactiveCustomers} inactive`}
          icon={Users}
        />

        <StatCard
          label="Open Loans"
          value={String(openLoans.length)}
          hint={`${activeLoans.length} active · ${overdueLoans.length} overdue`}
          icon={BadgeIndianRupee}
          tone="success"
        />

        <StatCard
          label="Total Disbursed"
          value={formatINR(totalDisbursed)}
          hint={`${loans.length} loans sanctioned`}
          icon={IndianRupee}
          tone="primary"
        />

        <StatCard
          label="24K Gold Rate"
          value={`${formatINR(rate.rate24k)}/g`}
          hint={`Updated ${formatDate(rate.updatedAt.slice(0, 10))}`}
          icon={Coins}
          tone="gold"
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Financial Statistics                                                  */}
      {/* -------------------------------------------------------------------- */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Collected"
          value={formatINR(totalCollected)}
          hint={`${payments.length} payment receipts`}
          icon={Wallet}
          tone="success"
        />

        <StatCard
          label="Outstanding"
          value={formatINR(totalOutstanding)}
          hint="Across open loans"
          icon={TrendingUp}
          tone="warning"
        />

        <StatCard
          label="Overdue Amount"
          value={formatINR(overdueOutstanding)}
          hint={`${overdueLoans.length} overdue loans`}
          icon={AlertTriangle}
          tone="warning"
        />

        <StatCard
          label="Interest Income"
          value={formatINR(totalInterest)}
          hint={`${formatINR(totalProcessingFees)} processing fees`}
          icon={Percent}
          tone="primary"
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Alerts / Due Today                                                    */}
      {/* -------------------------------------------------------------------- */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Today's Dues"
          description="Loans scheduled for payment today"
        >
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
              <CalendarDays className="size-6" />
            </div>

            <div>
              <p className="text-2xl font-bold">{dueToday.length}</p>
              <p className="text-sm text-muted-foreground">
                loans due today
              </p>
            </div>

            <div className="ml-auto text-right">
              <p className="text-sm font-semibold">
                {formatINR(dueTodayAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                outstanding
              </p>
            </div>
          </div>

          {dueToday.length > 0 && (
            <div className="mt-4 space-y-2">
              {dueToday.slice(0, 3).map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {customerName(loan.customerId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {loan.code}
                    </p>
                  </div>

                  <span className="text-sm font-semibold">
                    {formatINR(loan.outstanding)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Loan Portfolio"
          description="Current distribution of loans"
        >
          <div className="space-y-4">
            <PortfolioRow
              label="Active"
              count={activeLoans.length}
              percentage={activePercentage}
            />

            <PortfolioRow
              label="Overdue"
              count={overdueLoans.length}
              percentage={overduePercentage}
            />

            <PortfolioRow
              label="Closed"
              count={closedLoans.length}
              percentage={closedPercentage}
            />
          </div>
        </Panel>

        <Panel
          title="Gold Portfolio"
          description="Current appraisal value"
        >
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
              <Coins className="size-6" />
            </div>

            <div>
              <p className="text-2xl font-bold">
                {formatINR(totalGoldValue)}
              </p>
              <p className="text-sm text-muted-foreground">
                estimated gold value
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">
                Appraisals
              </p>
              <p className="mt-1 font-semibold">
                {appraisals.length}
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">
                Total Payable
              </p>
              <p className="mt-1 font-semibold">
                {formatINR(totalPayable)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Link to="/gold-rate">
              <Btn variant="outline" className="w-full">
                View Gold Rate
                <ArrowRight className="ml-2 size-4" />
              </Btn>
            </Link>
          </div>
        </Panel>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Recent Loans + Recent Collections                                    */}
      {/* -------------------------------------------------------------------- */}

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Panel
          title="Recent Loans"
          description="Latest sanctioned gold loans"
          className="xl:col-span-2"
          actions={
            <Link to="/loans">
              <Btn variant="outline">View all</Btn>
            </Link>
          }
        >
          {recentLoans.length === 0 ? (
            <Empty message="No loans yet." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Loan ID</Th>
                  <Th>Customer</Th>
                  <Th>Gold Item</Th>
                  <Th>Amount</Th>
                  <Th>EMI</Th>
                  <Th>Outstanding</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {recentLoans.map((loan) => (
                  <tr key={loan.id}>
                    <Td className="font-medium">{loan.code}</Td>

                    <Td>
                      <div>
                        <p className="font-medium">
                          {customerName(loan.customerId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customerMobile(loan.customerId)}
                        </p>
                      </div>
                    </Td>

                    <Td className="text-muted-foreground">
                      {ornament(loan.appraisalId)}
                    </Td>

                    <Td>{formatINR(loan.loanAmount)}</Td>

                    <Td>{formatINR(loan.emi)}</Td>

                    <Td className="font-medium">
                      {formatINR(loan.outstanding)}
                    </Td>

                    <Td>
                      <StatusBadge status={loan.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        <Panel
          title="Recent Collections"
          description="Latest EMI receipts"
        >
          {recentPayments.length === 0 ? (
            <Empty message="No payments recorded." />
          ) : (
            <ul className="space-y-3">
              {recentPayments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-start gap-3 border-b border-border pb-3 last:border-0"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-success/15 text-success">
                    <Wallet className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {customerName(payment.customerId)}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {payment.mode} · {formatDate(payment.date)}
                    </p>

                    {payment.transactionId && (
                      <p className="truncate text-xs text-muted-foreground">
                        {payment.transactionId}
                      </p>
                    )}
                  </div>

                  <span className="whitespace-nowrap text-sm font-semibold">
                    {formatINR(payment.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Outstanding + Payment Modes                                          */}
      {/* -------------------------------------------------------------------- */}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Top Outstanding Loans"
          description="Loans requiring the most attention"
          actions={
            <Link to="/loans">
              <Btn variant="outline">Manage loans</Btn>
            </Link>
          }
        >
          {topOutstandingLoans.length === 0 ? (
            <Empty message="No outstanding loans." />
          ) : (
            <div className="space-y-3">
              {topOutstandingLoans.map((loan, index) => {
                const item = appraisal(loan.appraisalId);

                return (
                  <div
                    key={loan.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {customerName(loan.customerId)}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {loan.code}
                        {item ? ` · ${item.ornamentName}` : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatINR(loan.outstanding)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Due {formatDate(loan.nextDueDate)}
                      </p>
                    </div>

                    <StatusBadge status={loan.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel
          title="Collection by Payment Mode"
          description="Total amount collected through each mode"
        >
          <div className="space-y-4">
            <PaymentModeRow
              icon={<Banknote className="size-4" />}
              label="Cash"
              amount={cashCollected}
              total={totalCollected}
            />

            <PaymentModeRow
              icon={<Wallet className="size-4" />}
              label="UPI"
              amount={upiCollected}
              total={totalCollected}
            />

            <PaymentModeRow
              icon={<IndianRupee className="size-4" />}
              label="Bank Transfer"
              amount={bankCollected}
              total={totalCollected}
            />

            <PaymentModeRow
              icon={<BadgeIndianRupee className="size-4" />}
              label="Card"
              amount={cardCollected}
              total={totalCollected}
            />
          </div>
        </Panel>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Upcoming Dues                                                        */}
      {/* -------------------------------------------------------------------- */}

      <div className="mt-6">
        <Panel
          title="Upcoming Dues"
          description="Next scheduled payments"
          actions={
            <Link to="/loans">
              <Btn variant="outline">
                View loans
                <ArrowRight className="ml-2 size-4" />
              </Btn>
            </Link>
          }
        >
          {upcomingDues.length === 0 ? (
            <Empty message="No upcoming dues." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Loan</Th>
                  <Th>Customer</Th>
                  <Th>Due Date</Th>
                  <Th>EMI</Th>
                  <Th>Outstanding</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {upcomingDues.slice(0, 8).map((loan) => (
                  <tr key={loan.id}>
                    <Td className="font-medium">{loan.code}</Td>

                    <Td>
                      {customerName(loan.customerId)}
                    </Td>

                    <Td>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        {formatDate(loan.nextDueDate)}
                      </div>
                    </Td>

                    <Td>{formatINR(loan.emi)}</Td>

                    <Td className="font-medium">
                      {formatINR(loan.outstanding)}
                    </Td>

                    <Td>
                      <StatusBadge status={loan.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Footer Summary                                                       */}
      {/* -------------------------------------------------------------------- */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryBox
          label="Total Loans"
          value={String(loans.length)}
          icon={<BadgeIndianRupee className="size-5" />}
        />

        <SummaryBox
          label="Total Gold Value"
          value={formatINR(totalGoldValue)}
          icon={<Coins className="size-5" />}
        />

        <SummaryBox
          label="Total Payable"
          value={formatINR(totalPayable)}
          icon={<IndianRupee className="size-5" />}
        />

        <SummaryBox
          label="Total Payments"
          value={String(payments.length)}
          icon={<Wallet className="size-5" />}
        />
      </div>
    </AppShell>
  );
}

/* ========================================================================== */
/* Small Dashboard Components                                                 */
/* ========================================================================== */

function PortfolioRow({
  label,
  count,
  percentage,
}: {
  label: string;
  count: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>

        <span className="text-muted-foreground">
          {count} · {percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PaymentModeRow({
  icon,
  label,
  amount,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  total: number;
}) {
  const percentage =
    total > 0 ? Math.round((amount / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-muted">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-3">
            <span className="text-sm font-medium">{label}</span>

            <span className="text-sm font-semibold">
              {formatINR(amount)}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(percentage, 100)}%`,
              }}
            />
          </div>
        </div>

        <span className="w-10 text-right text-xs text-muted-foreground">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}