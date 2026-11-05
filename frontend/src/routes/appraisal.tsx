import { createFileRoute } from "@tanstack/react-router";
import { Gem, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAppraisals, createAppraisal, deleteAppraisal, fetchCustomers, fetchLatestGoldRate } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import {
  Btn,
  Empty,
  Field,
  Panel,
  Select,
  StatCard,
  TableWrap,
  Td,
  TextInput,
  Th,
} from "@/components/ui-kit";
import { useAppData } from "@/hooks/useAppData";
import {
  formatDate,
  formatINR,
  goldValue,
  LTV,
  PURITIES,
  PURITY_FACTORS,
} from "@/lib/finance";
import {
  DEFAULT_RATE,
  nextCode,
} from "@/lib/storage";
import type { Purity } from "@/types";

export const Route = createFileRoute("/appraisal")({
  head: () => ({
    meta: [
      { title: "Gold Appraisal — Gold Loan Management System" },
      {
        name: "description",
        content:
          "Value pledged ornaments by purity (18K, 20K, 22K, 24K), weight and current gold rate to derive the eligible loan amount.",
      },
      { property: "og:title", content: "Gold Appraisal & Valuation" },
      {
        property: "og:description",
        content: "Purity-based ornament valuation with automatic gold value calculation.",
      },
    ],
  }),
  component: AppraisalPage,
});

function AppraisalPage() {
  const { ready, refresh } = useAppData();
  const { data: appraisals = [] } = useQuery({ queryKey: ["appraisals"], queryFn: fetchAppraisals, enabled: ready });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers, enabled: ready });
  const { data: latestRate } = useQuery({ queryKey: ["goldRate"], queryFn: fetchLatestGoldRate, enabled: ready });

  const rate = latestRate?.rate24k || DEFAULT_RATE.rate24k;
  const qc = useQueryClient();

  const createQ = useMutation({
    mutationFn: createAppraisal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appraisals"] }); refresh(); }
  });
  const deleteQ = useMutation({
    mutationFn: deleteAppraisal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appraisals"] }); refresh(); }
  });

  const totalWeight = useMemo(() => appraisals.reduce((sum, item) => sum + item.weightGrams, 0), [appraisals]);
  const totalValue = useMemo(() => appraisals.reduce((sum, item) => sum + item.estimatedValue, 0), [appraisals]);
  const pledgedCount = useMemo(() => appraisals.filter((item) => item.loanId).length, [appraisals]);
  const eligibleValue = useMemo(() => appraisals.reduce((sum, item) => sum + item.estimatedValue * LTV, 0), [appraisals]);

  const [customerId, setCustomerId] = useState("");
  const [ornamentName, setOrnamentName] = useState("");
  const [purity, setPurity] = useState<Purity>("22K");
  const [weight, setWeight] = useState("");
  const [goldRate, setGoldRate] = useState("");

  if (!ready) return <AppShell title="Gold Appraisal">{null}</AppShell>;

  const effectiveRate = Number(goldRate) || rate;
  const value = goldValue(Number(weight), effectiveRate, purity);
  const customerName = (id: string) => customers.find((c) => c.id === id)?.fullName ?? "—";

  function reset() {
    setCustomerId("");
    setOrnamentName("");
    setPurity("22K");
    setWeight("");
    setGoldRate("");
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      toast.error("Select a customer.");
      return;
    }
    if (Number(weight) <= 0) {
      toast.error("Enter a valid weight in grams.");
      return;
    }

    const record = {
      code: nextCode("APR", appraisals),
      customerId,
      ornamentName,
      purity,
      weightGrams: Number(weight),
      goldRate: Number(effectiveRate),
      estimatedValue: Math.round(value),
    };

    createQ.mutate(record, {
      onSuccess: () => {
        toast.success(`Appraisal saved — estimated value ${formatINR(value)}.`);
        reset();
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to save appraisal")
    });
  }

  function remove(id: string) {
    const item = appraisals.find((a) => a.id === id);
    if (item?.loanId) {
      toast.error("This item is pledged against a loan.");
      return;
    }
    deleteQ.mutate(id, {
      onSuccess: () => toast.success("Appraisal removed."),
      onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to remove appraisal")
    });
  }

  return (
    <AppShell title="Gold Appraisal" subtitle="Value pledged ornaments before sanctioning a loan">
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Appraisals" value={String(appraisals.length)} hint={`${pledgedCount} already pledged`} icon={Gem} tone="gold" />
        <StatCard label="Total Weight" value={`${totalWeight.toFixed(2)} g`} hint="Across recorded ornaments" icon={Gem} tone="primary" />
        <StatCard label="Estimated Value" value={formatINR(totalValue)} hint="Current appraisal value" icon={Gem} tone="success" />
        <StatCard label="Eligible Loan" value={formatINR(eligibleValue)} hint={`Based on ${LTV * 100}% LTV`} icon={Gem} tone="warning" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="New Appraisal" description="Value is calculated automatically">
          <form onSubmit={save} className="space-y-4">
            <Field label="Customer" required>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.fullName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ornament Name" required>
              <TextInput
                value={ornamentName}
                onChange={(e) => setOrnamentName(e.target.value)}
                placeholder="Gold Necklace"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Purity" required>
                <Select value={purity} onChange={(e) => setPurity(e.target.value as Purity)}>
                  {PURITIES.map((p) => (
                    <option key={p} value={p}>
                      {p} ({(PURITY_FACTORS[p] * 100).toFixed(2)}%)
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Weight (grams)" required>
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="24.5"
                  required
                />
              </Field>
            </div>
            <Field label="Gold Rate (₹ per gram, 24K)" hint={`Today's rate: ${formatINR(rate)}`}>
              <TextInput
                type="number"
                min="0"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                placeholder={String(rate)}
              />
            </Field>

            <div className="rounded-md border border-gold/40 bg-gold-soft p-4 text-gold-foreground">
              <p className="text-xs uppercase tracking-wide">Estimated Value</p>
              <p className="font-display text-2xl">{formatINR(value)}</p>
              <p className="mt-1 text-xs">
                {weight || 0} g × {formatINR(effectiveRate)} × {(PURITY_FACTORS[purity] * 100).toFixed(2)}% ·
                Eligible loan {formatINR(value * LTV)}
              </p>
            </div>

            <div className="flex gap-2">
              <Btn type="submit" className="flex-1">
                <Gem className="size-4" />
                Save Appraisal
              </Btn>
              <Btn type="button" variant="outline" onClick={reset}>
                Reset
              </Btn>
            </div>
          </form>
        </Panel>

        <Panel
          title="Appraisal Records"
          description={`${appraisals.length} ornaments appraised`}
          className="xl:col-span-2"
        >
          {appraisals.length === 0 ? (
            <Empty message="No appraisals recorded yet." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Customer</Th>
                  <Th>Ornament</Th>
                  <Th>Purity</Th>
                  <Th>Weight</Th>
                  <Th>Rate</Th>
                  <Th>Value</Th>
                  <Th>Pledged</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {[...appraisals].reverse().map((a) => (
                  <tr key={a.id}>
                    <Td className="font-medium">{a.code}</Td>
                    <Td>{customerName(a.customerId)}</Td>
                    <Td>{a.ornamentName}</Td>
                    <Td>{a.purity}</Td>
                    <Td>{a.weightGrams} g</Td>
                    <Td>{formatINR(a.goldRate)}</Td>
                    <Td className="font-semibold">{formatINR(a.estimatedValue)}</Td>
                    <Td className="text-muted-foreground">
                      {a.loanId ? "Yes" : formatDate(a.createdAt)}
                    </Td>
                    <Td>
                      <div className="flex justify-end">
                        <Btn
                          variant="ghost"
                          className="px-2 text-destructive hover:text-destructive"
                          onClick={() => remove(a.id)}
                        >
                          <Trash2 className="size-4" />
                        </Btn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
