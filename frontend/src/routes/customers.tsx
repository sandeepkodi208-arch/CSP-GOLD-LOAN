import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  IndianRupee,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer, fetchLoans, fetchPayments } from "@/lib/api";
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
  TextArea,
  TextInput,
  Th,
} from "@/components/ui-kit";
import { useAppData } from "@/hooks/useAppData";
import { formatDate, formatINR } from "@/lib/finance";
import {
  nextCode,
} from "@/lib/storage";
import type { Customer } from "@/types";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      {
        title: "Customers — Gold Loan Management System",
      },
      {
        name: "description",
        content:
          "Manage customers, KYC records, loans, payments and outstanding balances.",
      },
      {
        property: "og:title",
        content: "Customer Management — Gold Loan Manager",
      },
      {
        property: "og:description",
        content:
          "Maintain customer records and track loans, payments and outstanding balances.",
      },
    ],
  }),
  component: CustomersPage,
});

const emptyForm = {
  code: "",
  fullName: "",
  mobile: "",
  aadhaar: "",
  email: "",
  address: "",
  dob: "",
  occupation: "",
  status: "Active" as Customer["status"],
};

function CustomersPage() {
  const { ready, version, refresh } = useAppData();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Customer["status"]>("All");
  const [viewing, setViewing] = useState<Customer | null>(null);

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers, enabled: ready });
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: fetchLoans, enabled: ready });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: fetchPayments, enabled: ready });

  const qc = useQueryClient();

  const createQ = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); refresh(); }
  });

  const updateQ = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); refresh(); }
  });

  const deleteQ = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); refresh(); }
  });

  if (!ready) {
    return <AppShell title="Customers">{null}</AppShell>;
  }

  const nextId = editingId
    ? form.code
    : form.code || nextCode("CUST", customers);

  const activeLoanCount = (customerId: string) =>
    loans.filter(
      (loan) =>
        loan.customerId === customerId && loan.status !== "Closed",
    ).length;

  const customerLoanAmount = (customerId: string) =>
    loans
      .filter((loan) => loan.customerId === customerId)
      .reduce((sum, loan) => sum + loan.loanAmount, 0);

  const customerOutstanding = (customerId: string) =>
    loans
      .filter(
        (loan) =>
          loan.customerId === customerId && loan.status !== "Closed",
      )
      .reduce((sum, loan) => sum + loan.outstanding, 0);

  const customerPayments = (customerId: string) =>
    payments
      .filter((payment) => payment.customerId === customerId)
      .reduce((sum, payment) => sum + payment.amount, 0);

  const totalLoanAmount = loans.reduce(
    (sum, loan) => sum + loan.loanAmount,
    0,
  );

  const totalOutstanding = loans
    .filter((loan) => loan.status !== "Closed")
    .reduce((sum, loan) => sum + loan.outstanding, 0);

  const totalPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const activeCustomers = customers.filter(
    (customer) => activeLoanCount(customer.id) > 0,
  ).length;

  const overdueCustomers = new Set(
    loans.filter((loan) => loan.status === "Overdue").map((loan) => loan.customerId),
  );

  const filtered = customers.filter((customer) => {
    const q = query.trim().toLowerCase();
    const matchesStatus = statusFilter === "All" || customer.status === statusFilter;
    if (!matchesStatus) return false;
    if (!q) return true;
    return [
      customer.code,
      customer.fullName,
      customer.mobile,
      customer.email,
      customer.aadhaar,
      customer.occupation,
      customer.address,
    ].join(" ").toLowerCase().includes(q);
  });

  function set<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();

    const name = form.fullName.trim();
    const mobile = form.mobile.trim();
    const aadhaar = form.aadhaar.trim();
    const email = form.email.trim();

    if (name.length < 3) {
      toast.error("Full name must contain at least 3 characters.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }

    if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(aadhaar)) {
      toast.error("Enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      toast.error("Enter a valid email address.");
      return;
    }

    const list = customers;

    const duplicateMobile = list.some(
      (customer) =>
        customer.mobile === mobile &&
        customer.id !== editingId,
    );

    if (duplicateMobile) {
      toast.error("A customer with this mobile number already exists.");
      return;
    }

    const duplicateAadhaar = list.some(
      (customer) =>
        customer.aadhaar.replace(/\s/g, "") ===
        aadhaar.replace(/\s/g, "") &&
        customer.id !== editingId,
    );

    if (duplicateAadhaar) {
      toast.error("A customer with this Aadhaar number already exists.");
      return;
    }

    const cleanForm = {
      ...form,
      fullName: name,
      mobile,
      aadhaar,
      email,
      address: form.address.trim(),
      occupation: form.occupation.trim(),
    };

    if (editingId) {
      updateQ.mutate({ id: editingId, data: { ...cleanForm, code: form.code } }, {
        onSuccess: () => {
          toast.success(`${name} updated successfully.`);
          reset();
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to update customer")
      });
    } else {
      const record = {
        ...cleanForm,
        code: form.code || nextCode("CUST", list),
      };

      createQ.mutate(record, {
        onSuccess: () => {
          toast.success(`${record.fullName} added.`);
          reset();
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to add customer")
      });
    }
  }

  function edit(customer: Customer) {
    setEditingId(customer.id);

    setForm({
      code: customer.code,
      fullName: customer.fullName,
      mobile: customer.mobile,
      aadhaar: customer.aadhaar,
      email: customer.email,
      address: customer.address,
      dob: customer.dob,
      occupation: customer.occupation,
      status: customer.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function remove(customer: Customer) {
    const activeLoans = activeLoanCount(customer.id);

    if (activeLoans > 0) {
      toast.error(
        "Cannot delete a customer who has active loans.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete customer "${customer.fullName}" (${customer.code})?`,
    );

    if (!confirmed) return;

    deleteQ.mutate(customer.id, {
      onSuccess: () => {
        if (editingId === customer.id) {
          reset();
        }

        if (viewing?.id === customer.id) {
          setViewing(null);
        }

        toast.success("Customer deleted successfully.");
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to delete customer")
    });
  }

  return (
    <AppShell
      title="Customers"
      subtitle="Customer master, KYC records and loan tracking"
    >
      <div className="space-y-5">

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Customers
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {customers.length}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <Users className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Customers
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {activeCustomers}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <CreditCard className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Loans
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {formatINR(totalLoanAmount)}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <IndianRupee className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Outstanding
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {formatINR(totalOutstanding)}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <IndianRupee className="size-5" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customers with loans</p><p className="mt-2 text-2xl font-bold">{activeCustomers}</p><p className="mt-1 text-xs text-muted-foreground">Linked to an open loan</p></div><WalletCards className="size-5 text-primary" /></div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overdue customers</p><p className="mt-2 text-2xl font-bold">{overdueCustomers.size}</p><p className="mt-1 text-xs text-muted-foreground">Need payment follow-up</p></div><AlertTriangle className="size-5 text-destructive" /></div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total collected</p><p className="mt-2 text-xl font-bold">{formatINR(totalPayments)}</p><p className="mt-1 text-xs text-muted-foreground">All recorded payments</p></div><IndianRupee className="size-5 text-success" /></div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</p><p className="mt-2 text-sm font-semibold">Manage related records</p></div><ArrowRight className="size-5 text-muted-foreground" /></div>
            <div className="mt-3 flex flex-wrap gap-2"><Link to="/loans/new" className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">New Loan</Link><Link to="/loans" className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">View Loans</Link></div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">

          {/* CUSTOMER FORM */}
          <Panel
            title={editingId ? "Edit Customer" : "Add Customer"}
            description="Maintain customer and KYC information"
            className="xl:col-span-1"
          >
            <form
              onSubmit={save}
              className="space-y-4"
            >

              <Field label="Customer ID">
                <TextInput
                  value={nextId}
                  readOnly
                  className="bg-muted"
                />
              </Field>

              <Field label="Full Name" required>
                <TextInput
                  value={form.fullName}
                  onChange={(e) =>
                    set("fullName", e.target.value)
                  }
                  required
                  placeholder="Ramesh Iyer"
                />
              </Field>

              <Field
                label="Mobile"
                required
                hint="10-digit mobile number"
              >
                <TextInput
                  value={form.mobile}
                  onChange={(e) =>
                    set(
                      "mobile",
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    )
                  }
                  required
                  inputMode="numeric"
                  placeholder="9845012345"
                />
              </Field>

              <Field
                label="Aadhaar"
                required
                hint="12-digit Aadhaar number"
              >
                <TextInput
                  value={form.aadhaar}
                  onChange={(e) =>
                    set(
                      "aadhaar",
                      e.target.value
                        .replace(/[^\d\s]/g, "")
                        .slice(0, 14),
                    )
                  }
                  required
                  inputMode="numeric"
                  placeholder="1234 5678 9012"
                />
              </Field>

              <Field label="Email" required>
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    set("email", e.target.value)
                  }
                  required
                  placeholder="name@email.com"
                />
              </Field>

              <Field label="Address" required>
                <TextArea
                  value={form.address}
                  onChange={(e) =>
                    set("address", e.target.value)
                  }
                  required
                  placeholder="Door no, street, city"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">

                <Field
                  label="Date of Birth"
                  required
                >
                  <TextInput
                    type="date"
                    value={form.dob}
                    onChange={(e) =>
                      set("dob", e.target.value)
                    }
                    required
                  />
                </Field>

                <Field
                  label="Occupation"
                  required
                >
                  <TextInput
                    value={form.occupation}
                    onChange={(e) =>
                      set(
                        "occupation",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="Trader"
                  />
                </Field>

              </div>

              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(e) =>
                    set(
                      "status",
                      e.target.value as Customer["status"],
                    )
                  }
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </Select>
              </Field>

              <div className="flex gap-2 pt-1">

                <Btn
                  type="submit"
                  className="flex-1"
                >
                  <UserPlus className="size-4" />

                  {editingId
                    ? "Update Customer"
                    : "Save Customer"}
                </Btn>

                <Btn
                  type="button"
                  variant="outline"
                  onClick={reset}
                >
                  Reset
                </Btn>

              </div>
            </form>
          </Panel>

          {/* CUSTOMER LIST */}
          <Panel
            title="Customer List"
            description={`${filtered.length} of ${customers.length} customers`}
            className="xl:col-span-2"
            actions={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, ID, mobile..." className="pl-9" />
                </div>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | Customer["status"])} className="sm:w-32" aria-label="Filter customers by status">
                  <option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
                </Select>
              </div>
            }
          >

            {filtered.length === 0 ? (
              <Empty message="No customers match your search." />
            ) : (
              <TableWrap>

                <thead>
                  <tr>
                    <Th>Customer ID</Th>
                    <Th>Name</Th>
                    <Th>Mobile</Th>
                    <Th>Loans</Th>
                    <Th>Outstanding</Th>
                    <Th>Status</Th>
                    <Th className="text-right">
                      Actions
                    </Th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((customer) => {

                    const activeLoans =
                      activeLoanCount(customer.id);

                    const outstanding =
                      customerOutstanding(
                        customer.id,
                      );

                    return (
                      <tr key={customer.id}>

                        <Td className="font-medium">
                          {customer.code}
                        </Td>

                        <Td>
                          <div>
                            <p className="font-medium">
                              {customer.fullName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {customer.occupation}
                            </p>
                          </div>
                        </Td>

                        <Td>
                          {customer.mobile}
                        </Td>

                        <Td>
                          {activeLoans}
                        </Td>

                        <Td>
                          {formatINR(outstanding)}
                        </Td>

                        <Td>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={customer.status} />
                            {overdueCustomers.has(customer.id) && <StatusBadge status="Overdue" />}
                          </div>
                        </Td>

                        <Td>
                          <div className="flex justify-end gap-1">

                            <Btn
                              variant="ghost"
                              onClick={() =>
                                setViewing(customer)
                              }
                              className="px-2"
                              title="View customer"
                            >
                              <Search className="size-4" />
                            </Btn>

                            <Btn
                              variant="ghost"
                              onClick={() =>
                                edit(customer)
                              }
                              className="px-2"
                              title="Edit customer"
                            >
                              <Pencil className="size-4" />
                            </Btn>

                            <Btn
                              variant="ghost"
                              onClick={() =>
                                remove(customer)
                              }
                              className="px-2 text-destructive hover:text-destructive"
                              title="Delete customer"
                            >
                              <Trash2 className="size-4" />
                            </Btn>

                          </div>
                        </Td>

                      </tr>
                    );
                  })}
                </tbody>

              </TableWrap>
            )}

          </Panel>
        </div>

        {/* CUSTOMER DETAILS MODAL */}
        {viewing && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-panel">

              {/* HEADER */}
              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Customer Profile
                  </p>

                  <h2 className="mt-1 font-display text-2xl">
                    {viewing.fullName}
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    {viewing.code} · Joined{" "}
                    {formatDate(viewing.createdAt)}
                  </p>
                </div>

                <Btn
                  variant="ghost"
                  className="px-2"
                  onClick={() =>
                    setViewing(null)
                  }
                >
                  <X className="size-4" />
                </Btn>

              </div>

              {/* PERSONAL DETAILS */}
              <div className="mt-5">

                <h3 className="mb-3 text-sm font-semibold">
                  Personal & KYC Details
                </h3>

                <dl className="grid gap-4 sm:grid-cols-2">

                  {[
                    ["Mobile", viewing.mobile],
                    ["Email", viewing.email],
                    ["Aadhaar", viewing.aadhaar],
                    [
                      "Date of Birth",
                      formatDate(viewing.dob),
                    ],
                    [
                      "Occupation",
                      viewing.occupation,
                    ],
                    ["Status", viewing.status],
                    ["Address", viewing.address],
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        {key}
                      </dt>

                      <dd className="mt-1 text-sm">
                        {value}
                      </dd>
                    </div>
                  ))}

                </dl>
              </div>

              {/* FINANCIAL SUMMARY */}
              <div className="mt-6">

                <h3 className="mb-3 text-sm font-semibold">
                  Financial Summary
                </h3>

                <div className="grid gap-3 sm:grid-cols-3">

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">
                      Active Loans
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                      {activeLoanCount(viewing.id)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">
                      Total Loan Amount
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {formatINR(
                        customerLoanAmount(
                          viewing.id,
                        ),
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">
                      Payments Made
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {formatINR(
                        customerPayments(
                          viewing.id,
                        ),
                      )}
                    </p>
                  </div>

                </div>

                <div className="mt-3 rounded-lg border border-border bg-muted p-4">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="text-sm font-medium">
                        Outstanding Balance
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Amount remaining on active loans
                      </p>
                    </div>

                    <p className="text-xl font-bold">
                      {formatINR(
                        customerOutstanding(
                          viewing.id,
                        ),
                      )}
                    </p>

                  </div>

                </div>
              </div>

              {/* LOAN DETAILS */}
              <div className="mt-6">

                <h3 className="mb-3 text-sm font-semibold">
                  Loan Details
                </h3>

                {loans.filter(
                  (loan) =>
                    loan.customerId ===
                    viewing.id,
                ).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                    No loans found for this customer.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">

                    <table className="w-full text-sm">

                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">
                            Loan
                          </th>

                          <th className="px-3 py-2 text-left font-medium">
                            Amount
                          </th>

                          <th className="px-3 py-2 text-left font-medium">
                            Outstanding
                          </th>

                          <th className="px-3 py-2 text-left font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {loans
                          .filter(
                            (loan) =>
                              loan.customerId ===
                              viewing.id,
                          )
                          .map((loan) => (
                            <tr
                              key={loan.id}
                              className="border-b border-border last:border-0"
                            >

                              <td className="px-3 py-3 font-medium">
                                {loan.code}
                              </td>

                              <td className="px-3 py-3">
                                {formatINR(
                                  loan.loanAmount,
                                )}
                              </td>

                              <td className="px-3 py-3">
                                {formatINR(
                                  loan.outstanding,
                                )}
                              </td>

                              <td className="px-3 py-3">
                                <StatusBadge
                                  status={loan.status}
                                />
                              </td>

                            </tr>
                          ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

              {/* FOOTER */}
              <div className="mt-6 flex justify-end">

                <Btn
                  variant="outline"
                  onClick={() =>
                    setViewing(null)
                  }
                >
                  Close
                </Btn>

              </div>

            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}