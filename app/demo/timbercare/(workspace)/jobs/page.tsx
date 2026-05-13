import Link from "next/link";
import { ArrowRight, Construction, Trees, Truck } from "lucide-react";
import { JOBS, STAGE_LABEL, type JobStage } from "@/lib/demo-data/timbercare";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const STAGE_ORDER: JobStage[] = [
  "lead",
  "estimate",
  "scheduled",
  "in_progress",
  "complete",
  "billed",
];

const STAGE_ACCENT: Record<JobStage, string> = {
  lead: "var(--tc-text-muted)",
  estimate: "var(--tc-info)",
  scheduled: "var(--tc-accent)",
  in_progress: "var(--tc-warning)",
  complete: "var(--tc-leaf)",
  billed: "var(--tc-success)",
};

export default function JobsPage() {
  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    items: JOBS.filter((j) => j.stage === stage),
  }));

  const totalContracted = JOBS.reduce((s, j) => s + j.contractedCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="tc-eyebrow-muted">Job board</span>
        <h1 className="tc-serif text-[28px] leading-[1.1]" style={{ color: "var(--tc-text)" }}>
          {JOBS.length} jobs · {money(totalContracted)} backlog
        </h1>
        <p className="text-[13px]" style={{ color: "var(--tc-text-muted)" }}>
          Drag-to-advance ships v2. Crane-required jobs flagged separately
          so dispatch reserves the rig in advance.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {grouped.map(({ stage, items }) => (
          <div key={stage} className="tc-card flex flex-col gap-2 p-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: STAGE_ACCENT[stage] }}
                />
                <h2
                  className="text-[12px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--tc-text-faint)" }}
                >
                  {STAGE_LABEL[stage]}
                </h2>
              </div>
              <span className="text-[11px]" style={{ color: "var(--tc-text-faint)" }}>
                {items.length}
              </span>
            </header>
            {items.length === 0 ? (
              <p className="text-[11px]" style={{ color: "var(--tc-text-faint)" }}>
                — empty —
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((j) => (
                  <li
                    key={j.id}
                    className="rounded-md px-3 py-2"
                    style={{ background: "rgba(0,0,0,0.18)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]" style={{ color: "var(--tc-text)" }}>
                        {j.customerName}
                      </span>
                      {j.craneRequired && (
                        <span
                          className="tc-pill"
                          style={{
                            color: "var(--tc-warning)",
                            background: "rgba(244,184,96,0.10)",
                            borderColor: "rgba(244,184,96,0.40)",
                          }}
                          title="Crane required"
                        >
                          <Construction className="h-3 w-3" />
                          Crane
                        </span>
                      )}
                    </div>
                    <div
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--tc-text-muted)" }}
                    >
                      {j.scope}
                    </div>
                    {j.trees.length > 0 && (
                      <div
                        className="mt-1 flex flex-wrap gap-1 text-[10px]"
                        style={{ color: "var(--tc-text-faint)" }}
                      >
                        <Trees className="h-3 w-3" />
                        {j.trees.map((t, i) => (
                          <span key={i}>
                            {t.species} DBH {t.dbh}&quot; · h{t.height}&apos;{i < j.trees.length - 1 ? " ·" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span style={{ color: "var(--tc-text-faint)" }}>
                        {j.isaArboristName} · ISA-cert
                      </span>
                      <span className="tc-mono" style={{ color: "var(--tc-text)" }}>
                        {money(j.contractedCents)}
                      </span>
                    </div>
                    {j.estStartDate && (
                      <div
                        className="mt-1 text-[10px]"
                        style={{ color: "var(--tc-text-faint)" }}
                      >
                        Start: {j.estStartDate}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="tc-card flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4" style={{ color: "var(--tc-accent)" }} />
          <span className="tc-eyebrow">Why crane planning matters</span>
        </div>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--tc-text-muted)" }}
        >
          Tampa Bay tree work over 50&apos; almost always needs a crane.
          Booking a crane subcontractor 7–10 days out is the difference between
          a one-day job and a three-day stand-around. The board flags crane
          jobs early so the rig is reserved before the customer asks.
        </p>
        <Link
          href="/demo/timbercare/customers"
          className="tc-btn-ghost mt-2 self-start"
        >
          See customers <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </div>
  );
}
