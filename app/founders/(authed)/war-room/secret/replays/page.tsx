import { Clock, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { SecretEmptyState } from "@/components/app/SecretEmptyState";
import { loadReplays } from "@/lib/tracking/queries";
import { relTime } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

const PRODUCT_TONE: Record<string, "info" | "accent" | "warning" | "neutral"> = {
  marketing: "info",
  demo_crm: "accent",
  war_room: "warning",
};

const EVENT_DOT: Record<string, string> = {
  pageview: "bg-g-info",
  click: "bg-g-text-faint",
  rage_click: "bg-g-danger",
  dead_click: "bg-g-warning",
  exit: "bg-g-text-faint",
  demo_login: "bg-g-success",
  ai_chat_open: "bg-g-accent",
  ai_chat_message: "bg-g-accent",
  cmdk_open: "bg-g-info",
  quote_drafted: "bg-g-accent",
  settings_billing_view: "bg-g-warning",
  demo_form_focus: "bg-g-info",
  demo_form_submit: "bg-g-success",
};

export default async function SecretReplaysPage() {
  const { sessions, schemaMissing } = await loadReplays(18);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Secret · Replays"
        subtitle="Recent sessions rendered as event timelines. Full rrweb pixel-replay ships in Phase 7."
        actions={
          <StatusPill tone="accent">
            <MessageSquare className="h-3 w-3" />
            {sessions.length} sessions
          </StatusPill>
        }
      />

      {schemaMissing || sessions.length === 0 ? (
        <SecretEmptyState
          schemaMissing={schemaMissing}
          title={
            schemaMissing
              ? "Tracking schema not live yet"
              : "No sessions yet — drive some traffic and refresh."
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {sessions.map((s) => (
            <section key={s.id} className="g-card p-4">
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-[12px] text-g-text truncate">
                    {s.visitorHash.slice(0, 12)}…
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-g-text-faint">
                    <Clock className="h-3 w-3" />
                    <span>{relTime(s.startedAt)}</span>
                    <span>·</span>
                    <span>{s.events.length} events</span>
                  </div>
                </div>
                {s.product && (
                  <StatusPill tone={PRODUCT_TONE[s.product] || "neutral"}>
                    {s.product}
                  </StatusPill>
                )}
              </header>

              {s.events.length === 0 ? (
                <p className="mt-3 text-[11px] text-g-text-faint">
                  No events captured.
                </p>
              ) : (
                <ol className="relative mt-3 max-h-[260px] overflow-y-auto pr-2">
                  <span className="absolute left-[7px] top-1 bottom-1 w-px bg-g-border-subtle" />
                  {s.events.slice(0, 30).map((e, i) => (
                    <li key={i} className="relative pl-6 pb-2 last:pb-0">
                      <span
                        className={`absolute left-1.5 top-1 h-2 w-2 rounded-full ${
                          EVENT_DOT[e.type] || "bg-g-text-faint"
                        }`}
                      />
                      <div className="flex items-baseline justify-between gap-2 text-[11px]">
                        <span className="text-g-text font-mono truncate">
                          {e.type}
                        </span>
                        <span className="text-g-text-faint font-mono shrink-0">
                          {new Date(e.ts).toLocaleTimeString()}
                        </span>
                      </div>
                      {(e.path || e.target) && (
                        <div className="mt-0.5 text-[10px] text-g-text-muted truncate">
                          {e.path}
                          {e.target && (
                            <span className="ml-1.5 text-g-text-faint">
                              · {e.target}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                  {s.events.length > 30 && (
                    <li className="pl-6 text-[10px] text-g-text-faint">
                      + {s.events.length - 30} more events
                    </li>
                  )}
                </ol>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
