"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Mail, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { Button } from "./ui/Button";
import { StatusPill } from "./ui/StatusPill";
import type { Customer, Invoice, InvoiceStatus } from "@/lib/shared/types";
import { money, relTime, shortDate } from "@/lib/shared/format";
import { cn } from "@/lib/cn";

const TAB_KEYS = ["all", "Draft", "Sent", "Paid", "Overdue"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TONE: Record<InvoiceStatus, "neutral" | "info" | "accent" | "warning" | "danger"> = {
  Draft: "neutral",
  Sent: "info",
  Paid: "accent",
  Overdue: "danger",
  Void: "neutral",
};

export function InvoicesBrowser({
  invoices,
  customers,
}: {
  invoices: Invoice[];
  customers: Customer[];
}) {
  const customerById = React.useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c.name] as const)),
    [customers],
  );

  function filtered(tab: TabKey) {
    if (tab === "all") return invoices;
    return invoices.filter((i) => i.status === tab);
  }

  function counts(): Record<TabKey, number> {
    const out: Record<TabKey, number> = {
      all: invoices.length,
      Draft: 0,
      Sent: 0,
      Paid: 0,
      Overdue: 0,
    };
    for (const i of invoices) {
      if (i.status === "Draft") out.Draft++;
      else if (i.status === "Sent") out.Sent++;
      else if (i.status === "Paid") out.Paid++;
      else if (i.status === "Overdue") out.Overdue++;
    }
    return out;
  }
  const c = counts();

  function sendReminder(inv: Invoice) {
    const name = customerById[inv.customerId] ?? "customer";
    toast.success(`Reminder sent to ${name}`, {
      description: `Invoice ${inv.id} · ${money(inv.amountCents)} · SMS + email.`,
    });
  }

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">
          All <span className="ml-1.5 font-geist-mono text-[10px] text-g-text-faint">{c.all}</span>
        </TabsTrigger>
        <TabsTrigger value="Draft">
          Draft <span className="ml-1.5 font-geist-mono text-[10px] text-g-text-faint">{c.Draft}</span>
        </TabsTrigger>
        <TabsTrigger value="Sent">
          Sent <span className="ml-1.5 font-geist-mono text-[10px] text-g-text-faint">{c.Sent}</span>
        </TabsTrigger>
        <TabsTrigger value="Paid">
          Paid <span className="ml-1.5 font-geist-mono text-[10px] text-g-text-faint">{c.Paid}</span>
        </TabsTrigger>
        <TabsTrigger value="Overdue">
          Overdue <span className="ml-1.5 font-geist-mono text-[10px] text-g-text-faint">{c.Overdue}</span>
        </TabsTrigger>
      </TabsList>

      {TAB_KEYS.map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-4">
          <InvoiceTable
            rows={filtered(tab)}
            customerById={customerById}
            onReminder={sendReminder}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function InvoiceTable({
  rows,
  customerById,
  onReminder,
}: {
  rows: Invoice[];
  customerById: Record<string, string>;
  onReminder: (i: Invoice) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="g-card p-12 flex items-center justify-center text-g-text-muted text-[13px]">
        No invoices in this view.
      </div>
    );
  }
  return (
    <div className="g-card overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-g-border-subtle">
            <Th>Invoice</Th>
            <Th>Customer</Th>
            <Th align="center">Status</Th>
            <Th align="right">Amount</Th>
            <Th align="right">Issued</Th>
            <Th align="right">Due</Th>
            <Th align="center">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 60).map((i) => {
            const overdue = i.status === "Overdue";
            return (
              <tr
                key={i.id}
                className={cn(
                  "border-b border-g-border-subtle last:border-b-0 hover:bg-g-surface-2 transition-colors",
                  overdue && "bg-g-danger/[0.03]",
                )}
              >
                <td className="px-4 py-2.5 font-geist-mono text-g-text">
                  <Link
                    href={`/app/invoices/${i.id}`}
                    prefetch
                    className="hover:text-g-accent"
                  >
                    {i.id}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-g-text-muted">
                  {customerById[i.customerId] ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <StatusPill tone={TONE[i.status]}>{i.status}</StatusPill>
                </td>
                <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums text-g-text">
                  {money(i.amountCents)}
                </td>
                <td className="px-4 py-2.5 text-right font-geist-mono text-g-text-faint">
                  {shortDate(i.issuedAt)}
                </td>
                <td className="px-4 py-2.5 text-right font-geist-mono">
                  <span className={overdue ? "text-g-danger" : "text-g-text-muted"}>
                    {overdue ? relTime(i.dueAt) : shortDate(i.dueAt)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  {(i.status === "Sent" || i.status === "Overdue") && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onReminder(i);
                      }}
                      className="inline-flex items-center gap-1 text-[12px] text-g-text-muted hover:text-g-text"
                    >
                      <Mail className="h-3 w-3" />
                      Remind
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > 60 && (
        <div className="px-4 py-2 border-t border-g-border-subtle text-[11px] text-g-text-faint flex items-center justify-between">
          <span className="font-geist-mono">Showing 1–60 of {rows.length}</span>
          <Link
            href="/app/quotes/new"
            prefetch
            className="text-g-accent hover:underline inline-flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            New invoice <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 font-medium text-g-text-faint text-[10px] uppercase tracking-[0.14em]",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
      )}
    >
      {children}
    </th>
  );
}
