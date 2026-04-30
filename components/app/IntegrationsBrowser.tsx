import * as React from "react";
import {
  CheckCircle2,
  CircleSlash,
  Plug,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Button } from "./ui/Button";
import { type ProductKind } from "./engines";

type Integration = {
  name: string;
  category: string;
  status: "Connected" | "Available";
  lastSync: string;
  blurb: string;
  ringColor?: string;
};

const INTEGRATIONS: Integration[] = [
  {
    name: "QuickBooks",
    category: "Accounting",
    status: "Connected",
    lastSync: "12 min ago",
    blurb: "Two-way sync — invoices, payments, customers. Reconciles nightly.",
    ringColor: "#2CA01C",
  },
  {
    name: "Stripe",
    category: "Payments",
    status: "Connected",
    lastSync: "2 min ago",
    blurb: "ACH + card on file. Surcharge logic + dispute alerts wired in.",
    ringColor: "#635BFF",
  },
  {
    name: "Resend",
    category: "Email",
    status: "Connected",
    lastSync: "5 min ago",
    blurb: "Transactional email — quotes, receipts, founder magic links.",
    ringColor: "#FFFFFF",
  },
  {
    name: "Twilio",
    category: "SMS / Voice",
    status: "Connected",
    lastSync: "Live",
    blurb: "Inbound + outbound voice via BDC engine. SMS reminders.",
    ringColor: "#F22F46",
  },
  {
    name: "Mapbox",
    category: "Maps / Satellite",
    status: "Connected",
    lastSync: "Live",
    blurb: "Satellite tiles for AI Quote Drafter. Customer map view.",
    ringColor: "#4264FB",
  },
  {
    name: "Google Reviews",
    category: "Reviews",
    status: "Connected",
    lastSync: "1 hr ago",
    blurb: "Pulls new reviews + auto-asks promoters via the Review Engine.",
    ringColor: "#FBBC04",
  },
  {
    name: "Nextdoor",
    category: "Reviews",
    status: "Connected",
    lastSync: "3 hr ago",
    blurb: "Local-first review aggregation. Tampa neighborhood pages.",
    ringColor: "#83C75D",
  },
  {
    name: "Plaid",
    category: "ACH",
    status: "Connected",
    lastSync: "12 hr ago",
    blurb: "Bank-account verification for ACH payouts to crews + payroll.",
    ringColor: "#000000",
  },
  {
    name: "Zapier",
    category: "Automation",
    status: "Available",
    lastSync: "—",
    blurb:
      "Connect to 7,000+ apps via Zaps. Webhook fan-out from any engine event.",
    ringColor: "#FF4F00",
  },
  {
    name: "Slack",
    category: "Notifications",
    status: "Available",
    lastSync: "—",
    blurb: "Pipe Save Plays + at-risk alerts to your ops channel.",
    ringColor: "#4A154B",
  },
  {
    name: "Gusto",
    category: "Payroll",
    status: "Available",
    lastSync: "—",
    blurb: "One-click weekly payroll run from the Timesheets engine.",
    ringColor: "#F45D48",
  },
  {
    name: "HubSpot",
    category: "Marketing",
    status: "Available",
    lastSync: "—",
    blurb: "Push won customers to a long-term nurture list.",
    ringColor: "#FF7A59",
  },
];

export function IntegrationsBrowser({ product }: { product: ProductKind }) {
  const connected = INTEGRATIONS.filter((i) => i.status === "Connected");
  const available = INTEGRATIONS.filter((i) => i.status === "Available");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Integrations"
        subtitle="Connector tiles. One-click OAuth where supported."
        actions={
          <Button variant="secondary" size="sm">
            <RefreshCw className="h-3.5 w-3.5" /> Sync all now
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Connected"
          value={String(connected.length)}
          delta="0 errors · 24h"
          trend="flat"
        />
        <KPICard
          label="Available"
          value={String(available.length)}
          delta="One-click OAuth"
          trend="flat"
        />
        <KPICard
          label="Webhooks delivered · 24h"
          value="1,284"
          delta="+12.4%"
          trend="up"
        />
        <KPICard
          label="Median sync latency"
          value="284ms"
          delta="−42ms"
          trend="down"
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Connected · {connected.length}
          </h2>
          <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Live
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {connected.map((it) => (
            <IntegrationCard key={it.name} item={it} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Available · {available.length}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {available.map((it) => (
            <IntegrationCard key={it.name} item={it} />
          ))}
        </div>
      </section>
    </div>
  );
}

function IntegrationCard({ item }: { item: Integration }) {
  const isConnected = item.status === "Connected";
  return (
    <div className="g-card p-4 flex flex-col gap-3 transition-colors hover:border-g-border">
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-md flex items-center justify-center font-mono text-[11px] shrink-0"
          style={{
            background: item.ringColor
              ? `${item.ringColor}1A`
              : "var(--g-surface-2)",
            color: item.ringColor || "var(--g-text)",
            border: `1px solid ${item.ringColor || "var(--g-border)"}30`,
          }}
        >
          {item.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-g-text font-medium truncate">{item.name}</span>
            {isConnected ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-g-success shrink-0" />
            ) : (
              <CircleSlash className="h-3.5 w-3.5 text-g-text-faint shrink-0" />
            )}
          </div>
          <div className="text-[11px] text-g-text-faint">{item.category}</div>
        </div>
      </div>
      <p className="text-[12px] text-g-text-muted leading-relaxed">{item.blurb}</p>
      <div className="flex items-center justify-between pt-2 border-t border-g-border-subtle/60">
        <div className="text-[11px] font-mono text-g-text-faint">
          {isConnected ? `Synced ${item.lastSync}` : "Not yet connected"}
        </div>
        {isConnected ? (
          <StatusPill tone="success">Connected</StatusPill>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-g-accent/40 bg-g-accent-faint px-2 py-1 text-[11px] text-g-accent hover:bg-g-accent/20"
          >
            <Plug className="h-3 w-3" />
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
