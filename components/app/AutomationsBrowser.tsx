import * as React from "react";
import {
  ArrowRight,
  CloudRain,
  Flame,
  Mic,
  RotateCw,
  Send,
  Sparkles,
  Star,
  Voicemail,
  Zap,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { Button } from "./ui/Button";
import { type ProductKind } from "./engines";
import { num } from "@/lib/shared/format";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  runs: number;
  conv: number;
  state: "Live" | "Paused";
  icon: React.ComponentType<{ className?: string }>;
  saves?: string;
};

const FLOWS: Workflow[] = [
  {
    id: "auto_quote_intercept",
    name: "Quote Intercept · Voicemail",
    trigger: "Inbound voicemail",
    action: "AI returns call in <60s",
    runs: 84,
    conv: 31,
    state: "Live",
    icon: Voicemail,
    saves: "$8,420 / mo recovered",
  },
  {
    id: "auto_instant_text",
    name: "InstantText · Web form",
    trigger: "Form submit",
    action: "AI replies <60s with availability",
    runs: 312,
    conv: 44,
    state: "Live",
    icon: Send,
    saves: "$14,000 / mo pipeline",
  },
  {
    id: "auto_ghost_recovery",
    name: "Ghost Recovery · Day 7",
    trigger: "Quote not viewed 7d",
    action: "Send personalized re-pitch",
    runs: 47,
    conv: 21,
    state: "Live",
    icon: RotateCw,
    saves: "9 won quotes · $11.4K",
  },
  {
    id: "auto_save_play",
    name: "Save Play · At-risk",
    trigger: "Reply latency 2× baseline",
    action: "Schedule founder call",
    runs: 12,
    conv: 67,
    state: "Live",
    icon: Flame,
    saves: "8 saved · $12.6K LTV",
  },
  {
    id: "auto_weather_pivot",
    name: "Weather Pivot",
    trigger: "NOAA 60%+ rain",
    action: "Reshuffle routes, text customers",
    runs: 9,
    conv: 0,
    state: "Live",
    icon: CloudRain,
    saves: "47 min/day saved",
  },
  {
    id: "auto_review_blast",
    name: "Review Ask · Promoters",
    trigger: "Job complete + NPS≥8",
    action: "Send Google + Nextdoor link",
    runs: 88,
    conv: 32,
    state: "Live",
    icon: Star,
    saves: "+23 reviews this month",
  },
  {
    id: "auto_invoice_followup",
    name: "Invoice Reminder · D+7",
    trigger: "Invoice unpaid 7d",
    action: "SMS + email reminder",
    runs: 41,
    conv: 62,
    state: "Live",
    icon: Send,
    saves: "−1.2 days to pay",
  },
  {
    id: "auto_referral_ask",
    name: "Referral Ask · Won quote",
    trigger: "Quote signed",
    action: "Ask for 1 neighbor",
    runs: 68,
    conv: 18,
    state: "Live",
    icon: Mic,
    saves: "9 referrals booked",
  },
];

export function AutomationsBrowser({ product }: { product: ProductKind }) {
  const totalRuns = FLOWS.reduce((s, f) => s + f.runs, 0);
  const live = FLOWS.filter((f) => f.state === "Live").length;
  const avgConv =
    FLOWS.filter((f) => f.conv > 0).reduce((s, f) => s + f.conv, 0) /
    FLOWS.filter((f) => f.conv > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Automations"
        subtitle="Workflow engine. Triggers fire actions. Actions fire revenue."
        actions={
          <Button variant="primary" size="sm">
            <Zap className="h-3.5 w-3.5" /> New workflow
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Live workflows" value={String(live)} delta="0 paused" trend="flat" />
        <KPICard
          label="Runs · 30d"
          value={num(totalRuns)}
          delta="+22%"
          trend="up"
        />
        <KPICard
          label="Avg. conversion"
          value={`${avgConv.toFixed(1)}%`}
          delta="+4 pts"
          trend="up"
        />
        <KPICard label="Engines firing" value="33 / 33" trend="flat" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {FLOWS.map((f) => (
          <WorkflowCard key={f.id} flow={f} />
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({ flow }: { flow: Workflow }) {
  const Icon = flow.icon;
  return (
    <div className="g-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-g-accent-faint border border-g-accent/40 flex items-center justify-center text-g-accent shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-g-text font-medium truncate">{flow.name}</span>
            <StatusPill tone={flow.state === "Live" ? "success" : "neutral"}>
              {flow.state}
            </StatusPill>
          </div>
          <div className="mt-1 text-[11px] text-g-text-faint font-mono">
            {flow.id}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[12px]">
        <div className="flex-1 px-2.5 py-1.5 rounded-md bg-g-surface-2 border border-g-border-subtle">
          <div className="text-[9px] uppercase tracking-[0.14em] text-g-text-faint">
            When
          </div>
          <div className="text-g-text-muted truncate">{flow.trigger}</div>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-g-accent shrink-0" />
        <div className="flex-1 px-2.5 py-1.5 rounded-md bg-g-accent-faint border border-g-accent/30">
          <div className="text-[9px] uppercase tracking-[0.14em] text-g-accent">
            Then
          </div>
          <div className="text-g-text-muted truncate">{flow.action}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1 border-t border-g-border-subtle/60">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Runs · 30d
          </div>
          <div className="font-mono text-[14px] text-g-text">{num(flow.runs)}</div>
        </div>
        <div className="flex-[2]">
          <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Conversion
          </div>
          {flow.conv > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-g-surface-2 overflow-hidden">
                <div
                  className="h-full bg-g-accent"
                  style={{ width: `${Math.min(100, flow.conv)}%` }}
                />
              </div>
              <span className="font-mono text-[12px] text-g-accent">
                {flow.conv}%
              </span>
            </div>
          ) : (
            <span className="text-[12px] text-g-text-faint">—</span>
          )}
        </div>
      </div>

      {flow.saves && (
        <div className="flex items-center gap-1.5 text-[11px] text-g-text-muted">
          <Sparkles className="h-3 w-3 text-g-accent" />
          <span>{flow.saves}</span>
        </div>
      )}
    </div>
  );
}
