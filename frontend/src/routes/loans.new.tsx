import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calculator,
  FileCheck2,
  Gem,
  IndianRupee,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  Btn,
  Field,
  Panel,
  Select,
  TextInput,
} from "@/components/ui-kit";
import { useAppData } from "@/hooks/useAppData";
import {
  addMonths,
  formatINR,
  loanMath,
  LTV,
  todayISO,
} from "@/lib/finance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, fetchAppraisals, fetchLoans, createLoan, updateAppraisal } from "@/lib/api";
import {
  nextCode,
} from "@/lib/storage";
import type { Loan } from "@/types";

export const Route = createFileRoute("/loans/new")({
  head: () => ({
    meta: [
      {
        title: "New Gold Loan — Shree Gold Finance",
      },
      {
        name: "description",
        content:
          "Create and sanction a new gold loan with automatic EMI and repayment calculations.",
      },
      {
        property: "og:title",
        content: "New Gold Loan Application",
      },
    ],
  }),
  component: LoanApplicationPage,
});

function LoanApplicationPage() {
  const { ready, version, refresh } = useAppData();
  const navigate = useNavigate();

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers, enabled: ready });
  const { data: appraisals = [] } = useQuery({ queryKey: ["appraisals"], queryFn: fetchAppraisals, enabled: ready });
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: fetchLoans, enabled: ready });

  const qc = useQueryClient();
  const createLoanQ = useMutation({ mutationFn: createLoan });
  const updateAppraisalQ = useMutation({ mutationFn: ({ id, data }: any) => updateAppraisal(id, data) });

  const [customerId, setCustomerId] = useState("");
  const [appraisalId, setAppraisalId] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("12");
  const [tenure, setTenure] = useState("12");
  const [feePercent, setFeePercent] = useState("1");

  if (!ready) {
    return <AppShell title="Loan Application">{null}</AppShell>;
  }

  const options = customerId
    ? appraisals.filter(
      (appraisal) =>
        !appraisal.loanId && appraisal.customerId === customerId,
    )
    : [];

  const selected = appraisals.find(
    (appraisal) => appraisal.id === appraisalId,
  );

  const eligible = selected
    ? Math.round(selected.estimatedValue * LTV)
    : 0;

  const principal = Number(amount) || 0;
  const interestRate = Number(rate) || 0;
  const tenureMonths = Number(tenure) || 0;
  const processingPercent = Number(feePercent) || 0;

  const math = loanMath(
    principal,
    interestRate,
    tenureMonths,
  );

  const fee = Math.round(
    (principal * processingPercent) / 100,
  );

  const netDisbursal = Math.max(
    0,
    principal - fee,
  );

  const exceeds =
    principal > eligible && eligible > 0;

  const invalidRate =
    interestRate < 0 || interestRate > 100;

  const invalidFee =
    processingPercent < 0 || processingPercent > 20;

  const invalidTenure =
    tenureMonths <= 0 || tenureMonths > 120;

  function reset() {
    setCustomerId("");
    setAppraisalId("");
    setAmount("");
    setRate("12");
    setTenure("12");
    setFeePercent("1");
  }

  function submit(e: FormEvent) {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer.");
      return;
    }

    if (!selected) {
      toast.error("Please select an appraised gold item.");
      return;
    }

    if (principal <= 0) {
      toast.error("Enter a valid loan amount.");
      return;
    }

    if (exceeds) {
      toast.error(
        `Loan amount cannot exceed the eligible amount ${formatINR(
          eligible,
        )}.`,
      );
      return;
    }

    if (invalidRate) {
      toast.error(
        "Interest rate must be between 0% and 100%.",
      );
      return;
    }

    if (invalidTenure) {
      toast.error(
        "Loan tenure must be between 1 and 120 months.",
      );
      return;
    }

    if (invalidFee) {
      toast.error(
        "Processing fee must be between 0% and 20%.",
      );
      return;
    }

    const list = loans;
    const start = todayISO();

    const loanPayload = {
      code: nextCode("LN", list),
      customerId,
      appraisalId: selected.id,
      eligibleAmount: eligible,
      loanAmount: principal,
      interestRate,
      tenureMonths,
      processingFee: fee,
      emi: math.emi,
      totalInterest: math.totalInterest,
      totalPayable: math.totalPayable,
      outstanding: math.totalPayable,
      status: "Active" as const,
      startDate: todayISO(),
      nextDueDate: addMonths(todayISO(), 1),
    };

    createLoanQ.mutate(loanPayload, {
      onSuccess: (newLoan) => {
        updateAppraisalQ.mutate(
          { id: selected.id, data: { loanId: newLoan.id } },
          {
            onSuccess: () => {
              qc.invalidateQueries();
              toast.success(`${newLoan.code} sanctioned successfully. EMI ${formatINR(newLoan.emi)}.`);
              reset();
              refresh();
              navigate({ to: "/loans" });
            },
            onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Loan sanctioned, but failed to update appraisal")
          }
        );
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to sanction loan")
    });
  }

  return (
    <AppShell
      title="New Loan Application"
      subtitle="Sanction a gold loan against an appraised ornament"
      actions={
        <Btn
          variant="outline"
          onClick={() =>
            navigate({
              to: "/loans",
            })
          }
        >
          <ArrowLeft className="size-4" />
          Back to Loans
        </Btn>
      }
    >
      <form
        onSubmit={submit}
        className="grid gap-4 xl:grid-cols-3"
      >
        {/* Application Details */}
        <Panel
          title="Application Details"
          description="Enter customer, pledged gold and loan terms."
          className="xl:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer */}
            <Field label="Customer" required>
              <Select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setAppraisalId("");
                }}
                required
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.code} — {customer.fullName}
                  </option>
                ))}
              </Select>
            </Field>

            {/* Gold Item */}
            <Field
              label="Pledged Gold Item"
              required
              hint={
                !customerId
                  ? "Select a customer to view their appraisals"
                  : options.length === 0
                    ? "No available appraisal for this customer"
                    : `${options.length} available appraisal${options.length > 1 ? "s" : ""
                    }`
              }
            >
              <Select
                value={appraisalId}
                onChange={(e) =>
                  setAppraisalId(e.target.value)
                }
                required
                disabled={!customerId || options.length === 0}
              >
                <option value="">
                  {customerId && options.length === 0
                    ? "No appraisals available"
                    : "Select appraised item"}
                </option>

                {options.map((appraisal) => (
                  <option
                    key={appraisal.id}
                    value={appraisal.id}
                  >
                    {appraisal.code} —{" "}
                    {appraisal.ornamentName} (
                    {appraisal.purity},{" "}
                    {appraisal.weightGrams} g)
                  </option>
                ))}
              </Select>
            </Field>

            {/* Eligible Amount */}
            <Field
              label="Eligible Loan Amount"
              hint={`${Math.round(LTV * 100)}% of appraised gold value`}
            >
              <TextInput
                value={
                  eligible
                    ? formatINR(eligible)
                    : "—"
                }
                readOnly
                className="bg-muted"
              />
            </Field>

            {/* Loan Amount */}
            <Field
              label="Loan Amount"
              required
              {...(exceeds
                ? {
                  error: `Cannot exceed ${formatINR(
                    eligible,
                  )}`,
                }
                : {})}
            >
              <TextInput
                type="number"
                min="1"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="150000"
                required
              />
            </Field>

            {/* Interest Rate */}
            <Field
              label="Interest Rate (%)"
              required
              hint="Annual interest rate"
              {...(invalidRate
                ? {
                  error:
                    "Rate must be between 0% and 100%",
                }
                : {})}
            >
              <TextInput
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rate}
                onChange={(e) =>
                  setRate(e.target.value)
                }
                placeholder="12"
                required
              />
            </Field>

            {/* Loan Period */}
            <Field
              label="Loan Period"
              required
              {...(invalidTenure
                ? {
                  error:
                    "Tenure must be between 1 and 120 months",
                }
                : {})}
            >
              <Select
                value={tenure}
                onChange={(e) =>
                  setTenure(e.target.value)
                }
                required
              >
                {[3, 6, 9, 12, 18, 24, 36, 48, 60].map(
                  (months) => (
                    <option
                      key={months}
                      value={months}
                    >
                      {months} months
                    </option>
                  ),
                )}
              </Select>
            </Field>

            {/* Processing Fee */}
            <Field
              label="Processing Fee (%)"
              hint={`Fee: ${formatINR(fee)}`}
              {...(invalidFee
                ? {
                  error:
                    "Fee must be between 0% and 20%",
                }
                : {})}
            >
              <TextInput
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={feePercent}
                onChange={(e) =>
                  setFeePercent(e.target.value)
                }
              />
            </Field>
          </div>

          {/* Selected Gold */}
          {selected && (
            <div className="mt-5 rounded-xl border border-gold/30 bg-gold-soft p-4">
              <div className="flex items-center gap-2">
                <Gem className="size-5 text-gold-foreground" />

                <h3 className="font-semibold">
                  Pledged Gold
                </h3>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Ornament
                  </p>
                  <p className="text-sm font-medium">
                    {selected.ornamentName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Purity
                  </p>
                  <p className="text-sm font-medium">
                    {selected.purity}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Weight
                  </p>
                  <p className="text-sm font-medium">
                    {selected.weightGrams} g
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Gold Value
                  </p>
                  <p className="text-sm font-medium">
                    {formatINR(
                      selected.estimatedValue,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Btn
              type="submit"
              disabled={
                !appraisalId ||
                exceeds ||
                invalidRate ||
                invalidFee ||
                invalidTenure
              }
            >
              <FileCheck2 className="size-4" />
              Sanction Loan
            </Btn>

            <Btn
              type="button"
              variant="outline"
              onClick={reset}
            >
              Reset
            </Btn>
          </div>
        </Panel>

        {/* Repayment Summary */}
        <Panel
          title="Repayment Summary"
          description="Calculated automatically from the loan terms."
        >
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted p-3">
            <Calculator className="size-5 text-primary" />

            <div>
              <p className="text-sm font-medium">
                EMI Calculation
              </p>

              <p className="text-xs text-muted-foreground">
                Based on principal, interest and tenure
              </p>
            </div>
          </div>

          <dl className="space-y-3">
            {/* EMI */}
            <div className="rounded-lg border border-gold/40 bg-gold-soft px-4 py-4">
              <dt className="text-xs uppercase tracking-wide text-gold-foreground">
                Monthly EMI
              </dt>

              <dd className="mt-1 font-display text-3xl text-gold-foreground">
                {formatINR(math.emi)}
              </dd>
            </div>

            {[
              [
                "Loan Amount",
                formatINR(principal),
              ],
              [
                "Interest Rate",
                `${interestRate}% p.a.`,
              ],
              [
                "Tenure",
                `${tenureMonths} months`,
              ],
              [
                "Total Interest",
                formatINR(math.totalInterest),
              ],
              [
                "Total Payable",
                formatINR(math.totalPayable),
              ],
              [
                "Processing Fee",
                formatINR(fee),
              ],
              [
                "Net Disbursal",
                formatINR(netDisbursal),
              ],
            ].map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between border-b border-border pb-2 last:border-0"
              >
                <dt className="text-sm text-muted-foreground">
                  {key}
                </dt>

                <dd className="text-sm font-medium">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Status Info */}
          <div className="mt-5 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="size-4 text-primary" />

              <p className="text-sm font-medium">
                Loan Status
              </p>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              After sanction, the loan will be marked as
              Active and the first due date will be one
              month from the sanction date.
            </p>
          </div>
        </Panel>
      </form>
    </AppShell>
  );
}