import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  History,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  Btn,
  Empty,
  Field,
  Panel,
  TableWrap,
  Td,
  TextInput,
  Th,
} from "@/components/ui-kit";
import { useAppData } from "@/hooks/useAppData";
import { formatDate, formatINR } from "@/lib/finance";
import {
  DEFAULT_RATE,
  getGoldRate,
  getRateHistory,
  setGoldRate,
  setRateHistory,
} from "@/lib/storage";

export const Route = createFileRoute("/gold-rate")({
  head: () => ({
    meta: [
      {
        title: "Gold Rate — Gold Loan Management System",
      },
      {
        name: "description",
        content:
          "Track the current gold rate and review recent pricing history for accurate appraisals and loan approvals.",
      },
      {
        property: "og:title",
        content: "Gold Rate Management",
      },
      {
        property: "og:description",
        content:
          "Maintain the latest gold benchmark for appraisal accuracy and loan eligibility.",
      },
    ],
  }),
  component: GoldRatePage,
});

function GoldRatePage() {
  const { ready, version, refresh } = useAppData();

  const rate = useMemo(
    () => (ready ? getGoldRate() : DEFAULT_RATE),
    [ready, version],
  );

  const history = useMemo(
    () => (ready ? getRateHistory() : []),
    [ready, version],
  );

  const [value, setValue] = useState(String(rate.rate24k));

  const previousRate = history[1]?.rate24k ?? rate.rate24k;

  const rateChange = rate.rate24k - previousRate;

  const averageRate = useMemo(() => {
    if (history.length === 0) return rate.rate24k;

    const total = history.reduce((sum, item) => sum + item.rate24k, 0);

    return total / history.length;
  }, [history, rate.rate24k]);

  const highestRate = useMemo(() => {
    if (history.length === 0) return rate.rate24k;

    return Math.max(...history.map((item) => item.rate24k));
  }, [history, rate.rate24k]);

  const lowestRate = useMemo(() => {
    if (history.length === 0) return rate.rate24k;

    return Math.min(...history.map((item) => item.rate24k));
  }, [history, rate.rate24k]);

  if (!ready) {
    return <AppShell title="Gold Rate">{null}</AppShell>;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const nextRate = Number(value);

    if (!Number.isFinite(nextRate) || nextRate <= 0) {
      toast.error("Enter a valid gold rate.");
      return;
    }

    if (nextRate > 1000000) {
      toast.error("Please enter a realistic gold rate.");
      return;
    }

    const record = {
      rate24k: nextRate,
      updatedAt: new Date().toISOString(),
    };

    const previous = getRateHistory();

    setGoldRate(record);
    setRateHistory([record, ...previous].slice(0, 10));
    setValue(String(nextRate));

    toast.success(
      `Gold rate updated to ${formatINR(nextRate)} per gram.`,
    );

    refresh();
  }

  return (
    <AppShell
      title="Gold Rate"
      subtitle="Manage benchmark gold pricing used across appraisals and loans"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RateSummary
          label="Current Rate"
          value={formatINR(rate.rate24k)}
          icon={<Coins className="size-5" />}
          description="24K gold per gram"
        />

        <RateSummary
          label="Average Rate"
          value={formatINR(averageRate)}
          icon={<IndianRupee className="size-5" />}
          description={`${history.length} recorded rate${history.length === 1 ? "" : "s"}`}
        />

        <RateSummary
          label="Highest Rate"
          value={formatINR(highestRate)}
          icon={<ArrowUpRight className="size-5" />}
          description="Highest recorded"
        />

        <RateSummary
          label="Lowest Rate"
          value={formatINR(lowestRate)}
          icon={<ArrowDownRight className="size-5" />}
          description="Lowest recorded"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* Update Rate */}
        <Panel
          title="Update Gold Rate"
          description="Set the latest 24K gold benchmark"
        >
          <div className="rounded-2xl border border-gold/40 bg-gold-soft p-6 text-gold-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Current 24K Rate
                </p>

                <p className="mt-2 font-display text-4xl font-semibold">
                  {formatINR(rate.rate24k)}
                </p>

                <p className="mt-2 text-xs">
                  Updated {formatDate(rate.updatedAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/50 p-3">
                <Coins className="size-8" />
              </div>
            </div>

            <div className="mt-5 border-t border-gold/20 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Change from previous</span>

                <span
                  className={
                    rateChange > 0
                      ? "font-semibold text-success"
                      : rateChange < 0
                        ? "font-semibold text-destructive"
                        : "font-semibold"
                  }
                >
                  {rateChange > 0
                    ? `+${formatINR(rateChange)}`
                    : rateChange < 0
                      ? formatINR(rateChange)
                      : "Stable"}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="24K Gold Rate (₹/gram)" required>
              <TextInput
                type="number"
                min="1"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={String(rate.rate24k)}
                required
              />
            </Field>

            <Btn type="submit" className="w-full">
              <Coins className="size-4" />
              Update Rate
            </Btn>
          </form>

          <div className="mt-4 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
            Updating the rate will create a new entry in the rate history.
            Existing loans and appraisals are not automatically recalculated.
          </div>
        </Panel>

        {/* Rate History */}
        <Panel
          title="Rate History"
          description="Recent gold benchmark changes"
          className="xl:col-span-2"
        >
          {history.length === 0 ? (
            <Empty message="No rate history available yet." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Date</Th>
                  <Th>24K Rate</Th>
                  <Th>Change</Th>
                  <Th>Trend</Th>
                </tr>
              </thead>

              <tbody>
                {history.slice(0, 10).map((item, index) => {
                  const previous = history[index + 1];

                  const change = previous
                    ? item.rate24k - previous.rate24k
                    : 0;

                  const isUp = change > 0;
                  const isDown = change < 0;

                  return (
                    <tr key={`${item.updatedAt}-${index}`}>
                      <Td>
                        <span className="font-medium">{index + 1}</span>
                      </Td>

                      <Td>
                        <div>
                          <p className="font-medium">
                            {formatDate(item.updatedAt)}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {new Date(item.updatedAt).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </Td>

                      <Td className="font-semibold">
                        {formatINR(item.rate24k)}
                      </Td>

                      <Td>
                        {previous ? (
                          <span
                            className={
                              isUp
                                ? "font-medium text-success"
                                : isDown
                                  ? "font-medium text-destructive"
                                  : "text-muted-foreground"
                            }
                          >
                            {change > 0
                              ? `+${formatINR(change)}`
                              : change < 0
                                ? formatINR(change)
                                : "₹0"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            —
                          </span>
                        )}
                      </Td>

                      <Td>
                        <span
                          className={
                            isUp
                              ? "inline-flex items-center gap-1 text-success"
                              : isDown
                                ? "inline-flex items-center gap-1 text-destructive"
                                : "inline-flex items-center gap-1 text-muted-foreground"
                          }
                        >
                          {isUp ? (
                            <ArrowUpRight className="size-4" />
                          ) : isDown ? (
                            <ArrowDownRight className="size-4" />
                          ) : (
                            <TrendingUp className="size-4" />
                          )}

                          {isUp
                            ? "Increased"
                            : isDown
                              ? "Decreased"
                              : "Stable"}
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>

      {/* Information Panel */}
      <div className="mt-5">
        <Panel
          title="Rate Management"
          description="How the gold benchmark is used in the system"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<Coins className="size-5" />}
              title="Gold Appraisal"
              description="The current gold rate can be used to estimate the market value of pledged gold."
            />

            <InfoCard
              icon={<TrendingUp className="size-5" />}
              title="Loan Eligibility"
              description="Gold value is used as a basis for calculating the eligible loan amount according to your LTV settings."
            />

            <InfoCard
              icon={<History className="size-5" />}
              title="Rate History"
              description="Every update is stored so you can review previous benchmark rates."
            />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function RateSummary({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 font-display text-2xl font-semibold">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
        {icon}
      </div>

      <h3 className="font-semibold">{title}</h3>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}