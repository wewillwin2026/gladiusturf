"use client";

import * as React from "react";
import {
  Check,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import type {
  CatalogItem,
  Quote,
  QuoteLine,
  QuoteStatus,
} from "@/lib/demo-data/bright-lights";
import { SALES_TAX_RATE } from "@/lib/demo-data/bright-lights";

const STATUS_TONE: Record<QuoteStatus, { label: string; color: string; bg: string }> = {
  draft: {
    label: "Draft",
    color: "var(--bl-text-muted)",
    bg: "rgba(245,239,230,0.10)",
  },
  sent: {
    label: "Sent",
    color: "var(--bl-info)",
    bg: "rgba(124,200,232,0.16)",
  },
  accepted: {
    label: "Accepted",
    color: "var(--bl-success)",
    bg: "rgba(156,216,110,0.18)",
  },
  expired: {
    label: "Expired",
    color: "var(--bl-alert)",
    bg: "rgba(232,95,95,0.16)",
  },
};

export function QuotesClient({
  quotes,
  catalog,
}: {
  quotes: Quote[];
  catalog: CatalogItem[];
}) {
  const initialDraft = quotes.find((q) => q.status === "draft") ?? quotes[0];
  const [activeId, setActiveId] = React.useState(initialDraft.id);
  const [lineState, setLineState] = React.useState<Record<string, QuoteLine[]>>(
    () => Object.fromEntries(quotes.map((q) => [q.id, q.lines])),
  );
  const [toast, setToast] = React.useState<string | null>(null);

  const active = quotes.find((q) => q.id === activeId)!;
  const lines = lineState[activeId];

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function updateLines(updater: (prev: QuoteLine[]) => QuoteLine[]) {
    setLineState((s) => ({ ...s, [activeId]: updater(s[activeId]) }));
  }

  function addCatalogItem(item: CatalogItem) {
    updateLines((prev) => [
      ...prev,
      {
        sku: item.sku,
        qty: 1,
        unitPrice: item.unitPrice,
        description: item.name,
        unit: item.unit,
      },
    ]);
  }

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const tax = Math.round(subtotal * SALES_TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="bl-eyebrow-muted">Quotes · estimating engine</span>
          <h1
            className="bl-serif mt-1 text-[28px] leading-[1.1]"
            style={{ color: "var(--bl-text)" }}
          >
            Quote book — {quotes.length} loaded · 1 draft
          </h1>
          <p
            className="mt-1 max-w-2xl text-[13px] leading-[1.55]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            Build a quote in 2 minutes. Cast / Unique / FX catalog pre-loaded
            with your install pricing. PDF + e-signature + auto-conversion to
            job ship in the next release — for Sunday, the line items + math
            are live.
          </p>
        </div>
        <button
          type="button"
          className="bl-btn-primary self-start"
          onClick={() => flashToast("New quote builder ships next release")}
        >
          <Plus className="h-4 w-4" />
          New quote
        </button>
      </header>

      {/* Quote list */}
      <section className="bl-card overflow-hidden">
        <header
          className="grid grid-cols-[140px_1fr_120px_120px_100px_30px] items-center gap-3 px-5 py-3"
          style={{
            background: "rgba(0,0,0,0.18)",
            borderBottom: "1px solid var(--bl-border)",
          }}
        >
          <span className="bl-eyebrow-muted">Quote #</span>
          <span className="bl-eyebrow-muted">Customer</span>
          <span className="bl-eyebrow-muted">Date</span>
          <span className="bl-eyebrow-muted text-right">Total</span>
          <span className="bl-eyebrow-muted">Status</span>
          <span />
        </header>
        <ul>
          {quotes.map((q, i) => {
            const ls = lineState[q.id];
            const sub = ls.reduce((s, l) => s + l.qty * l.unitPrice, 0);
            const t = sub * (1 + SALES_TAX_RATE);
            const isActive = q.id === activeId;
            return (
              <li
                key={q.id}
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--bl-border)",
                  background: isActive ? "rgba(244,184,96,0.06)" : "transparent",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(q.id)}
                  className="grid w-full grid-cols-[140px_1fr_120px_120px_100px_30px] items-center gap-3 px-5 py-3 text-left transition-colors"
                  style={{
                    borderLeft: isActive
                      ? "2px solid var(--bl-accent)"
                      : "2px solid transparent",
                  }}
                >
                  <span
                    className="bl-mono text-[11px]"
                    style={{ color: "var(--bl-text-faint)" }}
                  >
                    {q.number}
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--bl-text)" }}
                  >
                    {q.customerName}
                    <span
                      className="ml-2 text-[11px]"
                      style={{ color: "var(--bl-text-faint)" }}
                    >
                      · {q.address.split(",")[0]}
                    </span>
                  </span>
                  <span
                    className="bl-mono text-[11px]"
                    style={{ color: "var(--bl-text-faint)" }}
                  >
                    {q.date}
                  </span>
                  <span
                    className="bl-mono text-right text-[12px]"
                    style={{ color: "var(--bl-text)" }}
                  >
                    ${t.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span>
                    <StatusPill status={q.status} />
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--bl-text-faint)" }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Builder */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <div className="bl-card overflow-hidden">
          <header
            className="flex items-center justify-between gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <div className="min-w-0">
              <span className="bl-eyebrow">{active.number}</span>
              <h2
                className="bl-serif mt-1 truncate text-[20px]"
                style={{ color: "var(--bl-text)" }}
              >
                {active.customerName}
              </h2>
              <p
                className="text-[12px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                {active.address}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusPill status={active.status} />
              <span
                className="bl-mono text-[10px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                Valid through {active.validThrough}
              </span>
            </div>
          </header>

          {/* Line items */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.18)" }}>
                  <Th>Item</Th>
                  <Th align="right">Qty</Th>
                  <Th align="right">Unit</Th>
                  <Th align="right">Total</Th>
                  <Th align="right" small />
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => {
                  const total = line.qty * line.unitPrice;
                  return (
                    <tr
                      key={`${line.sku}-${i}`}
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid var(--bl-border)",
                      }}
                    >
                      <Td>
                        <div
                          className="text-[12px]"
                          style={{ color: "var(--bl-text)" }}
                        >
                          {line.description}
                        </div>
                        <div
                          className="bl-mono mt-0.5 text-[10px]"
                          style={{ color: "var(--bl-text-faint)" }}
                        >
                          {line.sku}
                        </div>
                      </Td>
                      <Td align="right">
                        <QtyStepper
                          qty={line.qty}
                          unit={line.unit}
                          onChange={(v) =>
                            updateLines((prev) =>
                              prev.map((l, j) =>
                                j === i ? { ...l, qty: v } : l,
                              ),
                            )
                          }
                        />
                      </Td>
                      <Td align="right" mono>
                        ${line.unitPrice.toFixed(2)}
                      </Td>
                      <Td align="right" mono>
                        ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </Td>
                      <Td align="right">
                        <button
                          type="button"
                          aria-label="Remove line"
                          onClick={() =>
                            updateLines((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                          className="rounded-md p-1 transition-colors"
                          style={{ color: "var(--bl-text-faint)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--bl-alert)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--bl-text-faint)";
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add from catalog */}
          <div
            className="px-5 py-4"
            style={{ borderTop: "1px solid var(--bl-border)" }}
          >
            <span className="bl-eyebrow-muted">Add from catalog</span>
            <CatalogPicker catalog={catalog} onPick={addCatalogItem} />
          </div>

          {/* Notes */}
          {active.notes && (
            <div
              className="px-5 py-4"
              style={{ borderTop: "1px solid var(--bl-border)" }}
            >
              <span className="bl-eyebrow-muted">Internal notes</span>
              <p
                className="mt-2 text-[12px] leading-[1.55]"
                style={{ color: "var(--bl-text-muted)" }}
              >
                {active.notes}
              </p>
            </div>
          )}
        </div>

        {/* Totals + actions */}
        <aside className="flex flex-col gap-3">
          <div className="bl-card-elevated p-5">
            <span className="bl-eyebrow">Totals</span>
            <div className="mt-3 flex flex-col gap-2.5">
              <Row label="Subtotal" value={`$${subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <Row label="FL sales tax (7.5%)" value={`$${tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <div
                className="mt-1 flex items-baseline justify-between border-t pt-2.5"
                style={{ borderColor: "var(--bl-border)" }}
              >
                <span
                  className="text-[13px]"
                  style={{ color: "var(--bl-text)" }}
                >
                  Total
                </span>
                <span
                  className="bl-mono text-[24px]"
                  style={{ color: "var(--bl-accent)", fontWeight: 600 }}
                >
                  ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div
              className="mt-4 rounded-md px-3 py-2.5 text-[11px] leading-[1.5]"
              style={{
                background: "rgba(0,0,0,0.18)",
                color: "var(--bl-text-muted)",
                border: "1px solid var(--bl-border)",
              }}
            >
              Standard terms: 50% deposit on signing, 50% on completion. Cast /
              Unique brass fixtures: lifetime warranty. Workmanship: 30 days.
            </div>
          </div>

          <div className="bl-card flex flex-col gap-2 p-3">
            <button
              type="button"
              className="bl-btn-primary justify-start"
              onClick={() => flashToast("Quote sent to customer (demo)")}
            >
              <Send className="h-3.5 w-3.5" /> Send to customer
            </button>
            <button
              type="button"
              className="bl-btn-ghost justify-start"
              onClick={() => flashToast("PDF export ships next release")}
            >
              <FileText className="h-3.5 w-3.5" /> Export PDF
              <span
                className="bl-pill ml-auto"
                style={{ fontSize: 9 }}
              >
                Coming soon
              </span>
            </button>
            <button
              type="button"
              className="bl-btn-ghost justify-start"
              onClick={() => flashToast("Will auto-convert on accept")}
            >
              <Wrench className="h-3.5 w-3.5" /> Convert to job
              <span
                className="bl-pill ml-auto"
                style={{ fontSize: 9 }}
              >
                On accept
              </span>
            </button>
            <button
              type="button"
              className="bl-btn-ghost justify-start"
              onClick={() => flashToast("Email reminder cadence ships next release")}
            >
              <Mail className="h-3.5 w-3.5" /> Reminder cadence
              <span
                className="bl-pill ml-auto"
                style={{ fontSize: 9 }}
              >
                Coming soon
              </span>
            </button>
          </div>

          <div
            className="bl-card flex items-start gap-3 p-4"
            style={{
              background: "rgba(244,184,96,0.06)",
              border: "1px solid rgba(244,184,96,0.32)",
            }}
          >
            <Sparkles
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "var(--bl-accent)" }}
            />
            <div>
              <span className="bl-eyebrow">AI estimator · preview</span>
              <p
                className="mt-1.5 text-[12px] leading-[1.55]"
                style={{ color: "var(--bl-text-muted)" }}
              >
                Snap a property photo + sketch the run; AI suggests fixture mix
                + transformer size + wire footage. Drops into the quote with
                one click.
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-[11px]"
                style={{ color: "var(--bl-accent)" }}
                onClick={() => flashToast("AI estimator preview ships in Q3 2026")}
              >
                Try the preview <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </aside>
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
    </div>
  );
}

function StatusPill({ status }: { status: QuoteStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]"
      style={{
        background: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.color}55`,
        fontWeight: 600,
      }}
    >
      {status === "draft" && <Clock className="h-2.5 w-2.5" />}
      {status === "sent" && <Send className="h-2.5 w-2.5" />}
      {status === "accepted" && <Check className="h-2.5 w-2.5" />}
      {tone.label}
    </span>
  );
}

function QtyStepper({
  qty,
  unit,
  onChange,
}: {
  qty: number;
  unit: "ea" | "ft";
  onChange: (v: number) => void;
}) {
  const step = unit === "ft" ? 10 : 1;
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, qty - step))}
        aria-label="Decrease"
        className="rounded-md px-1.5 py-0.5"
        style={{
          background: "rgba(0,0,0,0.32)",
          border: "1px solid var(--bl-border)",
          color: "var(--bl-text-muted)",
          fontSize: 11,
        }}
      >
        −
      </button>
      <span
        className="bl-mono w-12 text-right text-[12px]"
        style={{ color: "var(--bl-text)" }}
      >
        {qty}
        <span
          className="ml-1 text-[9px]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          {unit}
        </span>
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + step)}
        aria-label="Increase"
        className="rounded-md px-1.5 py-0.5"
        style={{
          background: "rgba(244,184,96,0.16)",
          border: "1px solid rgba(244,184,96,0.4)",
          color: "var(--bl-accent)",
          fontSize: 11,
        }}
      >
        +
      </button>
    </div>
  );
}

function CatalogPicker({
  catalog,
  onPick,
}: {
  catalog: CatalogItem[];
  onPick: (i: CatalogItem) => void;
}) {
  const [open, setOpen] = React.useState<"fixture" | "infrastructure" | "labor" | null>(null);
  const groups: Array<{ key: "fixture" | "infrastructure" | "labor"; label: string }> = [
    { key: "fixture", label: "Fixtures" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "labor", label: "Labor / misc" },
  ];

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const active = open === g.key;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setOpen(active ? null : g.key)}
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
              + {g.label}
            </button>
          );
        })}
      </div>

      {open && (
        <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {catalog
            .filter((i) => i.category === open)
            .map((item) => (
              <li key={item.sku}>
                <button
                  type="button"
                  onClick={() => onPick(item)}
                  className="flex w-full items-start justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors"
                  style={{
                    background: "rgba(0,0,0,0.18)",
                    border: "1px solid var(--bl-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(244,184,96,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--bl-border)";
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[12px]"
                      style={{ color: "var(--bl-text)" }}
                    >
                      {item.name}
                    </div>
                    <div
                      className="mt-0.5 text-[10px] leading-[1.4]"
                      style={{ color: "var(--bl-text-faint)" }}
                    >
                      {item.description}
                    </div>
                  </div>
                  <span
                    className="bl-mono shrink-0 text-[12px]"
                    style={{ color: "var(--bl-accent)" }}
                  >
                    ${item.unitPrice.toFixed(2)}
                    <span
                      className="ml-0.5 text-[9px]"
                      style={{ color: "var(--bl-text-faint)" }}
                    >
                      /{item.unit}
                    </span>
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function Th({
  children,
  align,
  small,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  small?: boolean;
}) {
  return (
    <th
      className="bl-eyebrow-muted px-3 py-2.5"
      style={{
        textAlign: align ?? "left",
        fontSize: 10,
        width: small ? 32 : "auto",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  align,
}: {
  children: React.ReactNode;
  mono?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={mono ? "bl-mono" : ""}
      style={{
        padding: "10px 12px",
        textAlign: align ?? "left",
        color: "var(--bl-text)",
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-[12px]">
      <span style={{ color: "var(--bl-text-faint)" }}>{label}</span>
      <span className="bl-mono" style={{ color: "var(--bl-text)" }}>
        {value}
      </span>
    </div>
  );
}
