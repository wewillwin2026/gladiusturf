import * as React from "react";
import {
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Mailbox,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Button } from "./ui/Button";
import { type ProductKind } from "./engines";
import { num, money } from "@/lib/shared/format";

type Campaign = {
  id: string;
  name: string;
  channel: "SMS + Email" | "SMS" | "Email" | "Voice + SMS" | "Postcard";
  status: "Live" | "Scheduled" | "Paused";
  touches: number;
  sent: number;
  replied: number;
  booked: number;
  pipelineCents: number;
  audience: string;
};

const CHANNEL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  SMS: MessageSquare,
  "SMS + Email": MessageSquare,
  "Voice + SMS": Phone,
  Email: Mail,
  Postcard: Mailbox,
};

const CHANNEL_TONE: Record<string, "info" | "success" | "warning" | "accent" | "neutral"> = {
  SMS: "info",
  Email: "accent",
  "SMS + Email": "info",
  "Voice + SMS": "warning",
  Postcard: "neutral",
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp_spring_clean",
    name: "Spring Clean-Up Outbound",
    channel: "SMS + Email",
    status: "Live",
    touches: 4,
    sent: 412,
    replied: 38,
    booked: 14,
    pipelineCents: 1800000,
    audience: "Tier 2+ · last quoted >90d",
  },
  {
    id: "cmp_aeration",
    name: "Fall Aeration Push",
    channel: "SMS",
    status: "Live",
    touches: 3,
    sent: 188,
    replied: 22,
    booked: 9,
    pipelineCents: 720000,
    audience: "Active customers · zoysia / bermuda",
  },
  {
    id: "cmp_lapsed_winback",
    name: "Lapsed Customer Win-Back",
    channel: "Voice + SMS",
    status: "Live",
    touches: 5,
    sent: 64,
    replied: 11,
    booked: 6,
    pipelineCents: 540000,
    audience: "Churned <120d",
  },
  {
    id: "cmp_neighbor",
    name: "Neighbor Of Active Customer",
    channel: "Postcard",
    status: "Live",
    touches: 1,
    sent: 1240,
    replied: 41,
    booked: 18,
    pipelineCents: 2240000,
    audience: "Adjacent properties · ZIP 33606/33611/33629",
  },
  {
    id: "cmp_storm_response",
    name: "Post-Storm Yard Cleanup",
    channel: "SMS",
    status: "Scheduled",
    touches: 1,
    sent: 92,
    replied: 18,
    booked: 12,
    pipelineCents: 660000,
    audience: "All customers · weather trigger ≥45 mph",
  },
  {
    id: "cmp_referral_ask",
    name: "Referral Ask · Promoters Only",
    channel: "Email",
    status: "Live",
    touches: 2,
    sent: 84,
    replied: 14,
    booked: 7,
    pipelineCents: 280000,
    audience: "NPS ≥9 · last 60d",
  },
  {
    id: "cmp_holiday_lights",
    name: "Holiday Lights Add-On",
    channel: "Email",
    status: "Paused",
    touches: 2,
    sent: 240,
    replied: 21,
    booked: 12,
    pipelineCents: 840000,
    audience: "Tier 1+ · prior holiday buyers",
  },
  {
    id: "cmp_irrigation",
    name: "Irrigation Tune-Up · April",
    channel: "SMS",
    status: "Live",
    touches: 2,
    sent: 168,
    replied: 14,
    booked: 6,
    pipelineCents: 480000,
    audience: "Properties >5,000 sqft turf",
  },
];

export function CampaignsBrowser({ product }: { product: ProductKind }) {
  const totalSent = CAMPAIGNS.reduce((s, c) => s + c.sent, 0);
  const totalReplied = CAMPAIGNS.reduce((s, c) => s + c.replied, 0);
  const totalBooked = CAMPAIGNS.reduce((s, c) => s + c.booked, 0);
  const totalPipeline = CAMPAIGNS.reduce((s, c) => s + c.pipelineCents, 0);
  const replyRate = ((totalReplied / totalSent) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Campaigns"
        subtitle="Outbound BDC sequences across SMS, email, voice, postcards."
        actions={
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" /> New campaign
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Active campaigns"
          value={String(CAMPAIGNS.filter((c) => c.status === "Live").length)}
          delta={`${CAMPAIGNS.filter((c) => c.status === "Scheduled").length} scheduled`}
          trend="up"
        />
        <KPICard
          label="Reply rate"
          value={`${replyRate}%`}
          delta="+1.6 pts"
          trend="up"
        />
        <KPICard
          label="Booked · 30d"
          value={num(totalBooked)}
          delta="+22 vs last"
          trend="up"
        />
        <KPICard
          label="Pipeline · 30d"
          value={money(totalPipeline)}
          delta="+18.4%"
          trend="up"
        />
      </section>

      <section className="flex flex-col gap-3">
        {CAMPAIGNS.map((c) => (
          <CampaignRow key={c.id} c={c} />
        ))}
      </section>
    </div>
  );
}

function CampaignRow({ c }: { c: Campaign }) {
  const Icon = CHANNEL_ICON[c.channel.split(" ")[0]!] ?? Send;
  const replyPct = (c.replied / c.sent) * 100;
  const bookedPct = (c.booked / c.sent) * 100;
  const tone =
    c.status === "Live"
      ? "success"
      : c.status === "Scheduled"
        ? "info"
        : "warning";

  return (
    <div className="g-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-g-surface-2 border border-g-border-subtle flex items-center justify-center text-g-text-muted shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-g-text font-medium truncate">{c.name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <StatusPill tone={CHANNEL_TONE[c.channel] || "neutral"}>
                {c.channel}
              </StatusPill>
              <StatusPill tone={tone}>{c.status}</StatusPill>
            </div>
          </div>
          <div className="mt-0.5 text-[11px] text-g-text-faint">
            {c.touches} touch{c.touches > 1 ? "es" : ""} · {c.audience}
          </div>
        </div>
      </div>

      {/* Funnel bar */}
      <div className="grid grid-cols-3 gap-3">
        <FunnelTile
          label="Sent"
          value={num(c.sent)}
          pct={100}
          tone="bg-g-text-faint/40"
        />
        <FunnelTile
          label="Replied"
          value={num(c.replied)}
          pct={replyPct}
          tone="bg-g-info/70"
          subtitle={`${replyPct.toFixed(1)}%`}
        />
        <FunnelTile
          label="Booked"
          value={num(c.booked)}
          pct={bookedPct * 6}
          tone="bg-g-accent"
          subtitle={`${bookedPct.toFixed(1)}%`}
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-g-border-subtle/60 text-[11px]">
        <div className="text-g-text-faint">
          Pipeline contributed:{" "}
          <span className="font-mono text-g-accent">
            {money(c.pipelineCents)}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="text-g-text-muted hover:text-g-text">
            Duplicate
          </button>
          <button className="text-g-text-muted hover:text-g-text">View</button>
        </div>
      </div>
    </div>
  );
}

function FunnelTile({
  label,
  value,
  pct,
  tone,
  subtitle,
}: {
  label: string;
  value: string;
  pct: number;
  tone: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-md border border-g-border-subtle bg-g-surface-2/40 px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
          {label}
        </div>
        {subtitle && (
          <div className="font-mono text-[10px] text-g-text-faint">
            {subtitle}
          </div>
        )}
      </div>
      <div className="mt-1 font-mono text-[16px] text-g-text">{value}</div>
      <div className="mt-1.5 h-1 rounded-full bg-g-surface overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
