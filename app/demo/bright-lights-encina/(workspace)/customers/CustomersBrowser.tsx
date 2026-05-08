"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Languages, Plus, Sparkles, X } from "lucide-react";
import type { Customer } from "@/lib/demo-data/bright-lights";

type DraftCustomer = Customer & { _demo?: boolean };

const FILTER_PILLS: Array<{ key: string; label: string; match: (c: Customer) => boolean }> = [
  { key: "all", label: "All", match: () => true },
  {
    key: "expired",
    label: "Warranty expired",
    match: (c) =>
      typeof c.installYear === "number" && Date.now() - new Date(`${c.installYear}-01-01`).getTime() > 5 * 365 * 86400_000,
  },
  {
    key: "no-service",
    label: "No service yet",
    match: (c) => c.lastService === null,
  },
];

export function CustomersBrowser({
  seed,
  totalCustomers,
}: {
  seed: Customer[];
  totalCustomers: number;
}) {
  const [list, setList] = React.useState<DraftCustomer[]>(seed);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>("all");

  const filtered = list.filter(
    FILTER_PILLS.find((f) => f.key === filter)?.match ?? (() => true),
  );

  function addCustomer(c: DraftCustomer) {
    setList((prev) => [{ ...c, _demo: true }, ...prev]);
    setToast("Customer added to demo workspace");
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="bl-eyebrow-muted">Customers</span>
          <h1
            className="bl-serif mt-1 text-[28px] leading-[1.1]"
            style={{ color: "var(--bl-text)" }}
          >
            Customer book — {list.length} loaded · {totalCustomers} on file
          </h1>
          <p
            className="mt-1 text-[13px]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            Pre-loaded from your public reviews. The full {totalCustomers}-name
            list imports on Monday from QuickBooks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bl-btn-primary self-start"
        >
          <Plus className="h-4 w-4" />
          Add customer
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_PILLS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="rounded-full px-3 py-1.5 text-[11px] transition-colors"
              style={{
                background: active
                  ? "rgba(244,184,96,0.16)"
                  : "rgba(0,0,0,0.18)",
                color: active ? "var(--bl-accent)" : "var(--bl-text-muted)",
                border: `1px solid ${active ? "rgba(244,184,96,0.5)" : "var(--bl-border)"}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <section className="bl-card overflow-hidden">
        <header
          className="grid grid-cols-[1fr_120px_120px_120px_60px] items-center gap-3 px-5 py-3"
          style={{
            background: "rgba(0,0,0,0.18)",
            borderBottom: "1px solid var(--bl-border)",
          }}
        >
          <span className="bl-eyebrow-muted">Name</span>
          <span className="bl-eyebrow-muted">Cluster</span>
          <span className="bl-eyebrow-muted">Installed</span>
          <span className="bl-eyebrow-muted">Last service</span>
          <span className="bl-eyebrow-muted text-right">Fixtures</span>
        </header>
        <ul>
          {filtered.map((c, i) => (
            <li
              key={c.id + (c._demo ? "_demo" : "")}
              className="grid grid-cols-[1fr_120px_120px_120px_60px] items-center gap-3 px-5 py-3 transition-colors"
              style={{
                borderTop: i === 0 ? "none" : "1px solid var(--bl-border)",
              }}
            >
              <Link
                href={`/demo/bright-lights-encina/customers/${c.id}`}
                className="flex items-center gap-2 text-[13px] hover:underline"
                style={{ color: "var(--bl-text)" }}
              >
                {c.name}
                {c._demo && (
                  <span
                    className="bl-pill"
                    style={{
                      background: "rgba(124,200,232,0.16)",
                      color: "var(--bl-info)",
                      borderColor: "rgba(124,200,232,0.4)",
                      fontSize: 9,
                    }}
                  >
                    demo
                  </span>
                )}
              </Link>
              <span
                className="text-[12px]"
                style={{ color: "var(--bl-text-muted)" }}
              >
                {c.cluster}
              </span>
              <span
                className="bl-mono text-[11px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                {c.installYear}
              </span>
              <span
                className="bl-mono text-[11px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                {c.lastService || "—"}
              </span>
              <span
                className="bl-mono text-right text-[12px]"
                style={{ color: "var(--bl-text)" }}
              >
                {c.fixtures}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md px-4 py-3 text-[13px] shadow-2xl"
          style={{
            background: "var(--bl-success)",
            color: "#0e1628",
            fontWeight: 600,
          }}
          role="status"
        >
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AddCustomerModal
          onClose={() => setModalOpen(false)}
          onAdd={(c) => {
            addCustomer(c);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function AddCustomerModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (c: DraftCustomer) => void;
}) {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [language, setLanguage] = React.useState<"en" | "es">("en");

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = name.trim().length > 1 && address.trim().length > 1;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    const id =
      "BL-NEW-" +
      name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 4)
        .toUpperCase() +
      "-" +
      Date.now().toString(36).slice(-3).toUpperCase();
    onAdd({
      id,
      name: name.trim(),
      address: address.trim(),
      city: "Sarasota",
      zip: "34239",
      cluster: "Sarasota",
      installYear: new Date().getFullYear(),
      fixtures: 0,
      brand: "Cast LED",
      lastService: null,
      notes: "Added during workspace demo · pending real onboarding.",
      language,
      lat: 27.34 + (Math.random() - 0.5) * 0.1,
      lng: -82.55 + (Math.random() - 0.5) * 0.1,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(8,12,22,0.78)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={save}
        className="bl-card-elevated bl-fade-in flex w-full max-w-lg flex-col gap-4 p-6"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <header className="flex items-start justify-between gap-2">
          <div>
            <span className="bl-eyebrow">Add a customer</span>
            <h2
              className="bl-serif mt-1 text-[20px]"
              style={{ color: "var(--bl-text)" }}
            >
              We&rsquo;ll do this together Monday morning.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1"
            style={{ color: "var(--bl-text-faint)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          className="rounded-md px-4 py-3 text-[12px] leading-[1.6]"
          style={{
            background: "rgba(0,0,0,0.32)",
            color: "var(--bl-text-muted)",
          }}
        >
          Bright Lights has ~247 customers from 9 years of installs. Rather
          than entering them one by one, we&rsquo;ll import directly from your
          QuickBooks export during onboarding — usually 15 minutes for a list
          your size.
          <br />
          <br />
          In the meantime, if you want to add a single new customer manually:
        </div>

        <Field label="Name" required>
          <input
            className="bl-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah Henderson"
            autoFocus
          />
        </Field>
        <Field label="Address" required>
          <input
            className="bl-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="2840 Bayshore Rd, Sarasota, FL 34234"
          />
        </Field>
        <Field label="Phone">
          <input
            className="bl-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(941) 555-0117"
            type="tel"
          />
        </Field>
        <Field label="Language">
          <div className="flex items-center gap-2">
            {(
              [
                { id: "en" as const, label: "🇺🇸 English" },
                { id: "es" as const, label: "🇪🇸 Español" },
              ] as const
            ).map((opt) => {
              const active = language === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLanguage(opt.id)}
                  className="rounded-full px-3 py-1.5 text-[11px] transition-colors"
                  style={{
                    background: active
                      ? "rgba(244,184,96,0.16)"
                      : "rgba(0,0,0,0.18)",
                    color: active ? "var(--bl-accent)" : "var(--bl-text-muted)",
                    border: `1px solid ${active ? "rgba(244,184,96,0.5)" : "var(--bl-border)"}`,
                    fontWeight: active ? 600 : 400,
                  }}
                  aria-pressed={active}
                >
                  <Languages className="mr-1 inline h-3 w-3" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Field>

        <footer className="mt-2 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="bl-btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="bl-btn-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Save customer (demo)
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--bl-text-faint)" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--bl-accent)" }}>
            *
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

