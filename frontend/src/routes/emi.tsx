import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CalendarClock,
  CreditCard,
  DollarSign,
  Eye,
  ReceiptText,
  Search,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import {
  Btn,
  Empty,
  Field,
  Panel,
  Select,
  StatusBadge,
  TableWrap,
  Td,
  TextInput,
  Th,
} from "@/components/ui-kit";

import { useAppData } from "@/hooks/useAppData";

import {
  addMonths,
  formatDate,
  formatINR,
  todayISO,
} from "@/lib/finance";

import {
  nextCode,
} from "@/lib/storage";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, fetchLoans, fetchPayments, createPayment, updateLoan } from "@/lib/api";

import type {
  Loan,
  Payment,
  PaymentMode,
} from "@/types";

export const Route = createFileRoute("/emi")({
  head: () => ({
    meta: [
      {
        title: "EMI Collections — Shree Gold Finance",
      },
      {
        name: "description",
        content:
          "Record EMI payments, track outstanding balances and manage gold loan collections.",
      },
      {
        property: "og:title",
        content: "EMI Collections — Shree Gold Finance",
      },
      {
        property: "og:description",
        content:
          "Manage EMI collections and payment history for gold loans.",
      },
    ],
  }),
  component: EMIPage,
});

const paymentModes: PaymentMode[] = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
];

function EMIPage() {
  const { ready, version, refresh } = useAppData();

  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] =
    useState<PaymentMode>("Cash");
  const [transactionId, setTransactionId] =
    useState("");

  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [showPaymentForm, setShowPaymentForm] =
    useState(true);

  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: fetchLoans, enabled: ready });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers, enabled: ready });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: fetchPayments, enabled: ready });

  const qc = useQueryClient();
  const createPaymentQ = useMutation({ mutationFn: createPayment });
  const updateLoanQ = useMutation({ mutationFn: ({ id, data }: any) => updateLoan(id, data) });

  const activeLoans = useMemo(
    () =>
      loans.filter(
        (loan) => loan.status !== "Closed",
      ),
    [loans],
  );

  const selectedLoan = useMemo(
    () =>
      loans.find(
        (loan) => loan.id === loanId,
      ),
    [loans, loanId],
  );

  const customerMap = useMemo(
    () =>
      new Map(
        customers.map((customer) => [
          customer.id,
          customer,
        ]),
      ),
    [customers],
  );

  const loanMap = useMemo(
    () =>
      new Map(
        loans.map((loan) => [
          loan.id,
          loan,
        ]),
      ),
    [loans],
  );

  const totalCollected = useMemo(
    () =>
      payments.reduce(
        (sum, payment) =>
          sum + payment.amount,
        0,
      ),
    [payments],
  );

  const totalOutstanding = useMemo(
    () =>
      loans
        .filter(
          (loan) => loan.status !== "Closed",
        )
        .reduce(
          (sum, loan) =>
            sum + loan.outstanding,
          0,
        ),
    [loans],
  );

  const averagePayment =
    payments.length > 0
      ? Math.round(
        totalCollected /
        payments.length,
      )
      : 0;

  const overdueLoans = useMemo(
    () => loans.filter((loan) => loan.status === "Overdue"),
    [loans],
  );

  const dueThisWeek = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    const startISO = todayISO();
    const endISO = end.toISOString().slice(0, 10);
    return loans.filter(
      (loan) =>
        loan.status !== "Closed" &&
        loan.nextDueDate >= startISO &&
        loan.nextDueDate <= endISO,
    );
  }, [loans]);

  const filteredPayments = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return [...payments].sort(
        (a, b) =>
          b.date.localeCompare(a.date),
      );
    }

    return [...payments]
      .filter((payment) => {
        const loan =
          loanMap.get(payment.loanId);

        const customer =
          customerMap.get(
            payment.customerId,
          );

        return [
          payment.code,
          payment.mode,
          payment.transactionId,
          loan?.code,
          customer?.fullName,
          customer?.mobile,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query),
          );
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date),
      );
  }, [
    payments,
    search,
    loanMap,
    customerMap,
  ]);

  function resetForm() {
    setLoanId("");
    setAmount("");
    setDate(todayISO());
    setMode("Cash");
    setTransactionId("");
  }

  /**
   * Calculates the next scheduled due date.
   *
   * The important part is that the calculation starts
   * from the existing nextDueDate instead of the payment date.
   *
   * Example:
   * Current due date = 10-Aug
   * Payment made = 20-Aug
   * Next due date = 10-Sep
   *
   * If the customer pays very late, we keep moving the
   * schedule forward until the next due date is in the future.
   */
  function calculateNextDueDate(
    loan: Loan,
    paymentDate: string,
  ) {
    let nextDue = loan.nextDueDate;

    let safetyCounter = 0;

    while (
      nextDue <= paymentDate &&
      safetyCounter < 120
    ) {
      nextDue = addMonths(
        nextDue,
        1,
      );

      safetyCounter += 1;
    }

    return nextDue;
  }

  function submitPayment() {
    if (!loanId) {
      toast.error(
        "Please select a loan.",
      );
      return;
    }

    if (!selectedLoan) {
      toast.error(
        "Selected loan was not found.",
      );
      return;
    }

    const paymentAmount =
      Number(amount) || 0;

    if (paymentAmount <= 0) {
      toast.error(
        "Enter a valid payment amount.",
      );
      return;
    }

    if (paymentAmount >
      selectedLoan.outstanding) {
      toast.error(
        `Payment cannot exceed the outstanding amount ${formatINR(
          selectedLoan.outstanding,
        )}.`,
      );
      return;
    }

    if (!date) {
      toast.error(
        "Please select a payment date.",
      );
      return;
    }

    if (
      (mode === "UPI" ||
        mode === "Bank Transfer" ||
        mode === "Card") &&
      !transactionId.trim()
    ) {
      toast.error(
        "Please enter the transaction ID.",
      );
      return;
    }

    const paymentList = payments;

    const paymentPayload = {
      code: nextCode("PMT", paymentList),
      loanId: selectedLoan.id,
      customerId: selectedLoan.customerId,
      date,
      amount: paymentAmount,
      mode,
      transactionId: transactionId.trim(),
    };

    const nextOutstanding = Math.max(0, selectedLoan.outstanding - paymentAmount);
    const isClosed = nextOutstanding === 0;
    const nextStatus = isClosed ? "Closed" : selectedLoan.status;
    const nextDueDate = isClosed ? selectedLoan.nextDueDate : calculateNextDueDate(selectedLoan, date);

    createPaymentQ.mutate(paymentPayload, {
      onSuccess: () => {
        updateLoanQ.mutate(
          { id: selectedLoan.id, data: { outstanding: nextOutstanding, status: nextStatus, nextDueDate } },
          {
            onSuccess: () => {
              qc.invalidateQueries();
              toast.success(isClosed ? `${selectedLoan.code} closed successfully.` : `Payment of ${formatINR(paymentAmount)} recorded successfully.`);
              resetForm();
              refresh();
            },
            onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Payment recorded, but failed to update loan")
          }
        );
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to record payment.")
    });
  }

  function getCustomerName(
    customerId: string,
  ) {
    return (
      customerMap.get(customerId)
        ?.fullName ??
      "Unknown Customer"
    );
  }

  function getLoanCode(
    loanId: string,
  ) {
    return (
      loanMap.get(loanId)?.code ??
      "Unknown Loan"
    );
  }

  if (!ready) {
    return (
      <AppShell title="EMI Collections">
        {null}
      </AppShell>
    );
  }

  return (
    <AppShell
      title="EMI Collections"
      subtitle="Record customer payments and track outstanding loan balances"
      actions={
        <Btn
          onClick={() =>
            setShowPaymentForm(
              (value) => !value,
            )
          }
        >
          <CreditCard className="size-4" />
          {showPaymentForm
            ? "Hide Payment Form"
            : "Record Payment"}
        </Btn>
      }
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            <Wallet className="size-5" />
          }
          title="Total Collected"
          value={formatINR(
            totalCollected,
          )}
          description={`${payments.length} payment${payments.length === 1
            ? ""
            : "s"
            } recorded`}
        />

        <SummaryCard
          icon={
            <TrendingDown className="size-5" />
          }
          title="Outstanding"
          value={formatINR(
            totalOutstanding,
          )}
          description="Across active loans"
        />

        <SummaryCard
          icon={
            <DollarSign className="size-5" />
          }
          title="Average Payment"
          value={formatINR(
            averagePayment,
          )}
          description="Average collection"
        />

        <SummaryCard
          icon={
            <ReceiptText className="size-5" />
          }
          title="Active Loans"
          value={String(
            activeLoans.length,
          )}
          description="Loans accepting payments"
        />

        <SummaryCard
          icon={<CalendarClock className="size-5" />}
          title="Due This Week"
          value={String(dueThisWeek.length)}
          description={`${overdueLoans.length} overdue loan${overdueLoans.length === 1 ? "" : "s"} need attention`}
        />
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <Panel
          title="Record EMI Payment"
          description="Select a loan and enter the payment details."
          className="mt-4"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field
              label="Loan"
              required
            >
              <Select
                value={loanId}
                onChange={(e) =>
                  setLoanId(
                    e.target.value,
                  )
                }
                required
              >
                <option value="">
                  Select loan
                </option>

                {activeLoans.map(
                  (loan) => {
                    const customer =
                      customerMap.get(
                        loan.customerId,
                      );

                    return (
                      <option
                        key={loan.id}
                        value={loan.id}
                      >
                        {loan.code} —{" "}
                        {customer
                          ?.fullName ??
                          "Customer"}{" "}
                        —{" "}
                        {formatINR(
                          loan.outstanding,
                        )}
                      </option>
                    );
                  },
                )}
              </Select>
            </Field>

            <Field
              label="Payment Amount"
              required
            >
              <TextInput
                type="number"
                min="1"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value,
                  )
                }
                placeholder="5000"
                required
              />
            </Field>

            <Field
              label="Payment Date"
              required
            >
              <TextInput
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value,
                  )
                }
                required
              />
            </Field>

            <Field
              label="Payment Mode"
              required
            >
              <Select
                value={mode}
                onChange={(e) =>
                  setMode(
                    e.target
                      .value as PaymentMode,
                  )
                }
                required
              >
                {paymentModes.map(
                  (paymentMode) => (
                    <option
                      key={
                        paymentMode
                      }
                      value={
                        paymentMode
                      }
                    >
                      {paymentMode}
                    </option>
                  ),
                )}
              </Select>
            </Field>

            <Field
              label="Transaction ID"
              hint={
                mode === "Cash"
                  ? "Optional for cash"
                  : "Required for digital payments"
              }
            >
              <TextInput
                value={
                  transactionId
                }
                onChange={(e) =>
                  setTransactionId(
                    e.target.value,
                  )
                }
                placeholder={
                  mode === "Cash"
                    ? "Optional"
                    : "Enter transaction ID"
                }
                required={
                  mode !== "Cash"
                }
              />
            </Field>
          </div>

          {/* Selected Loan Details */}
          {selectedLoan && (
            <div className="mt-5 rounded-xl border border-gold/30 bg-gold-soft p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <InfoItem
                  label="Loan"
                  value={
                    selectedLoan.code
                  }
                />

                <InfoItem
                  label="Customer"
                  value={getCustomerName(
                    selectedLoan.customerId,
                  )}
                />

                <InfoItem
                  label="EMI"
                  value={formatINR(
                    selectedLoan.emi,
                  )}
                />

                <InfoItem
                  label="Outstanding"
                  value={formatINR(
                    selectedLoan.outstanding,
                  )}
                />

                <InfoItem
                  label="Next Due Date"
                  value={formatDate(
                    selectedLoan.nextDueDate,
                  )}
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Btn
              onClick={submitPayment}
              disabled={
                !loanId ||
                !amount ||
                Number(amount) <= 0
              }
            >
              <CreditCard className="size-4" />
              Record Payment
            </Btn>

            <Btn
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Reset
            </Btn>
          </div>
        </Panel>
      )}

      {/* Payment History */}
      <Panel
        title="Payment History"
        description="View all EMI and loan payments recorded in the system."
        className="mt-4"
        actions={
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <TextInput
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Search payment, loan or customer..."
                className="pl-9"
              />
            </div>
          </div>
        }
      >
        {filteredPayments.length ===
          0 ? (
          <Empty
            message="No payments found"
          />
        ) : (
          <TableWrap>
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Payment</Th>
                  <Th>Loan</Th>
                  <Th>Customer</Th>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Mode</Th>
                  <Th>Transaction ID</Th>
                  <Th className="text-right">
                    Action
                  </Th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map(
                  (payment) => (
                    <tr
                      key={
                        payment.id
                      }
                      className="border-b border-border last:border-0"
                    >
                      <Td>
                        <div className="font-medium">
                          {
                            payment.code
                          }
                        </div>
                      </Td>

                      <Td>
                        <span className="font-medium">
                          {getLoanCode(
                            payment.loanId,
                          )}
                        </span>
                      </Td>

                      <Td>
                        {getCustomerName(
                          payment.customerId,
                        )}
                      </Td>

                      <Td>
                        {formatDate(
                          payment.date,
                        )}
                      </Td>

                      <Td>
                        <span className="font-semibold">
                          {formatINR(
                            payment.amount,
                          )}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-sm font-medium">
                          {payment.mode}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-sm text-muted-foreground">
                          {payment.transactionId ||
                            "—"}
                        </span>
                      </Td>

                      <Td className="text-right">
                        <Btn
                          variant="ghost"
                          onClick={() =>
                            setSelectedPayment(payment)
                          }
                        >
                          <Eye className="size-4" />
                          View
                        </Btn>
                      </Td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          loan={loanMap.get(selectedPayment.loanId)}
          customer={customerMap.get(selectedPayment.customerId)}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </AppShell>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-1 font-display text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function PaymentDetailsModal({
  payment,
  loan,
  customer,
  onClose,
}: {
  payment: Payment;
  loan: Loan | undefined;
  customer: {
    fullName: string;
    mobile: string;
  } | undefined;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Payment Details
            </h2>

            <p className="text-sm text-muted-foreground">
              {payment.code}
            </p>
          </div>

          <Btn
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-5" />
          </Btn>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-gold/30 bg-gold-soft p-4">
            <p className="text-xs uppercase tracking-wide text-gold-foreground">
              Amount Collected
            </p>

            <p className="mt-1 font-display text-3xl font-semibold text-gold-foreground">
              {formatINR(
                payment.amount,
              )}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              label="Payment Code"
              value={
                payment.code
              }
            />

            <InfoItem
              label="Payment Date"
              value={formatDate(
                payment.date,
              )}
            />

            <InfoItem
              label="Loan"
              value={
                loan?.code ??
                "Unknown"
              }
            />

            <InfoItem
              label="Customer"
              value={
                customer?.fullName ??
                "Unknown"
              }
            />

            <InfoItem
              label="Mobile"
              value={
                customer?.mobile ??
                "—"
              }
            />

            <InfoItem
              label="Payment Mode"
              value={payment.mode}
            />

            <InfoItem
              label="Transaction ID"
              value={
                payment.transactionId ||
                "—"
              }
            />

            <InfoItem
              label="Remaining Outstanding"
              value={
                loan
                  ? formatINR(
                    loan.outstanding,
                  )
                  : "—"
              }
            />
          </div>

          {loan && (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />

                <p className="text-sm font-medium">
                  Next Due Date
                </p>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {loan.status ===
                  "Closed"
                  ? "Loan fully paid and closed."
                  : formatDate(
                    loan.nextDueDate,
                  )}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border p-5">
          <Btn
            variant="outline"
            onClick={onClose}
          >
            Close
          </Btn>
        </div>
      </div>
    </div>
  );
}