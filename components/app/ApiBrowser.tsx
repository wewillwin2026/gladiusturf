"use client";

import * as React from "react";
import {
  Activity,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  RefreshCw,
  Webhook,
  Zap,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Button } from "./ui/Button";
import { Sparkline } from "./ui/Sparkline";
import { type ProductKind } from "./engines";

type Key = {
  id: string;
  prefix: string;
  label: string;
  scope: "read" | "read+write";
  env: "Production" | "Test";
  created: string;
  lastUsed: string;
};

type Hook = {
  id: string;
  event: string;
  url: string;
  status: "Success" | "Failing";
  lastFire: string;
};

const KEYS: Key[] = [
  {
    id: "key_live_a92",
    prefix: "key_live_*****a92",
    label: "Production · Cypress Lawn",
    scope: "read+write",
    env: "Production",
    created: "2026-01-12",
    lastUsed: "3m ago",
  },
  {
    id: "key_live_1bc",
    prefix: "key_live_*****1bc",
    label: "QuickBooks Sync",
    scope: "read+write",
    env: "Production",
    created: "2025-09-30",
    lastUsed: "12m ago",
  },
  {
    id: "key_live_d44",
    prefix: "key_live_*****d44",
    label: "Mapbox Tile Cache",
    scope: "read",
    env: "Production",
    created: "2025-08-04",
    lastUsed: "2hr ago",
  },
  {
    id: "key_test_eef",
    prefix: "key_test_*****eef",
    label: "Test · Joshua's machine",
    scope: "read",
    env: "Test",
    created: "2026-04-22",
    lastUsed: "1d ago",
  },
];

const HOOKS: Hook[] = [
  {
    id: "wh_evt_invoice_paid",
    event: "invoice.paid",
    url: "POST → /hooks/qb",
    status: "Success",
    lastFire: "8m ago",
  },
  {
    id: "wh_evt_quote_signed",
    event: "quote.signed",
    url: "POST → /hooks/qb",
    status: "Success",
    lastFire: "1hr ago",
  },
  {
    id: "wh_evt_job_done",
    event: "job.completed",
    url: "POST → /hooks/portal",
    status: "Success",
    lastFire: "12m ago",
  },
  {
    id: "wh_evt_review_received",
    event: "review.received",
    url: "POST → /hooks/slack",
    status: "Success",
    lastFire: "2hr ago",
  },
  {
    id: "wh_evt_save_play",
    event: "save_play.triggered",
    url: "POST → /hooks/founder-alert",
    status: "Success",
    lastFire: "4hr ago",
  },
  {
    id: "wh_evt_route_optimized",
    event: "route.optimized",
    url: "POST → /hooks/dispatch",
    status: "Success",
    lastFire: "29m ago",
  },
];

const REQUEST_VOLUME = [
  220, 240, 260, 290, 312, 340, 380, 412, 460, 510, 540, 580, 620, 644,
];

export function ApiBrowser({ product }: { product: ProductKind }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="API"
        subtitle="Keys + webhooks. Read-only in demo."
        actions={
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" /> New API key
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active keys" value={String(KEYS.length)} />
        <KPICard label="Webhooks" value={String(HOOKS.length)} delta="0 failing" trend="flat" />
        <KPICard
          label="Requests · 24h"
          value="12,842"
          delta="+8.4%"
          trend="up"
          spark={REQUEST_VOLUME}
        />
        <KPICard label="Errors · 24h" value="0" delta="100% success" trend="flat" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Keys panel */}
        <section className="g-card overflow-hidden">
          <header className="px-5 py-3 border-b border-g-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-g-text-faint" />
              <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
                API keys
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              {KEYS.length} active
            </span>
          </header>
          <div className="px-2">
            {KEYS.map((k) => (
              <KeyRow key={k.id} k={k} />
            ))}
          </div>
        </section>

        {/* Webhooks panel */}
        <section className="g-card overflow-hidden">
          <header className="px-5 py-3 border-b border-g-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-g-text-faint" />
              <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
                Webhooks
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              {HOOKS.length} active
            </span>
          </header>
          <div className="px-2">
            {HOOKS.map((h) => (
              <HookRow key={h.id} h={h} />
            ))}
          </div>
        </section>
      </div>

      <section className="g-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint inline-flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Request volume · 14 days
          </h3>
          <span className="font-mono text-[12px] text-g-accent">+184% MoM</span>
        </div>
        <div className="mt-3 text-g-accent">
          <Sparkline data={REQUEST_VOLUME} width={1200} height={64} className="w-full" />
        </div>
      </section>
    </div>
  );
}

function KeyRow({ k }: { k: Key }) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <div className="flex items-center gap-3 px-3 py-3 border-b border-g-border-subtle/60 last:border-b-0">
      <div className="h-8 w-8 rounded-md bg-g-surface-2 border border-g-border-subtle flex items-center justify-center text-g-text-faint shrink-0">
        <KeyRound className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-g-text truncate">{k.label}</span>
          <StatusPill tone={k.env === "Production" ? "success" : "warning"}>
            {k.env}
          </StatusPill>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-g-text-faint">
          {revealed ? "key_live_4f9d2c…" + k.id.slice(-3) : k.prefix}
          <button
            onClick={() => setRevealed((v) => !v)}
            className="text-g-text-faint hover:text-g-text"
            aria-label={revealed ? "Hide key" : "Reveal key"}
          >
            {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
          <button
            className="text-g-text-faint hover:text-g-text"
            aria-label="Copy key"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-[11px] text-g-text-muted">{k.lastUsed}</div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
          {k.scope}
        </div>
      </div>
    </div>
  );
}

function HookRow({ h }: { h: Hook }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 border-b border-g-border-subtle/60 last:border-b-0">
      <div className="h-8 w-8 rounded-md bg-g-accent-faint border border-g-accent/40 flex items-center justify-center text-g-accent shrink-0">
        <Zap className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[12px] text-g-text truncate">{h.event}</div>
        <div className="mt-0.5 font-mono text-[11px] text-g-text-faint truncate">
          {h.url}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusPill tone={h.status === "Success" ? "success" : "danger"}>
          {h.status}
        </StatusPill>
        <button
          className="text-g-text-faint hover:text-g-text"
          aria-label="Replay last event"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
