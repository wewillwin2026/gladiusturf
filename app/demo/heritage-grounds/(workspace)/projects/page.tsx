import { PROJECTS, STAGE_LABEL, type ProjectStage } from "@/lib/demo-data/heritage-grounds";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

const STAGE_ORDER: ProjectStage[] = [
  "lead",
  "design",
  "approved",
  "scheduled",
  "in_install",
  "walkthrough",
  "punch_list",
  "complete",
];

const STAGE_ACCENT: Record<ProjectStage, string> = {
  lead: "var(--hg-text-muted)",
  design: "var(--hg-info)",
  approved: "var(--hg-accent)",
  scheduled: "var(--hg-accent)",
  in_install: "var(--hg-accent)",
  walkthrough: "var(--hg-olive)",
  punch_list: "#f4b860",
  complete: "var(--hg-success)",
};

export default function ProjectsPage() {
  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    items: PROJECTS.filter((p) => p.stage === stage),
  }));

  const totalContracted = PROJECTS.reduce(
    (s, p) => s + (p.stage === "complete" ? 0 : p.contractedCents),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <span className="hg-eyebrow-muted">Projects</span>
        <h1
          className="hg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--hg-text)" }}
        >
          Project board · {PROJECTS.length} in motion
        </h1>
        <p className="text-[13px]" style={{ color: "var(--hg-text-muted)" }}>
          Drag-to-advance ships in v2. For now the board renders by stage —
          backlog value {money(totalContracted)}.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {grouped.map(({ stage, items }) => (
          <div key={stage} className="hg-card flex flex-col gap-2 p-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: STAGE_ACCENT[stage] }}
                />
                <h2
                  className="text-[12px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--hg-text-faint)" }}
                >
                  {STAGE_LABEL[stage]}
                </h2>
              </div>
              <span
                className="text-[11px]"
                style={{ color: "var(--hg-text-faint)" }}
              >
                {items.length}
              </span>
            </header>
            {items.length === 0 ? (
              <p
                className="text-[11px]"
                style={{ color: "var(--hg-text-faint)" }}
              >
                — empty —
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-md px-3 py-2"
                    style={{ background: "rgba(0,0,0,0.18)" }}
                  >
                    <div
                      className="text-[13px]"
                      style={{ color: "var(--hg-text)" }}
                    >
                      {p.customerName}
                    </div>
                    <div
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--hg-text-muted)" }}
                    >
                      {p.scope}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span style={{ color: "var(--hg-text-faint)" }}>
                        {p.designerName} · {p.zip}
                      </span>
                      <span
                        className="hg-mono"
                        style={{ color: "var(--hg-text)" }}
                      >
                        {money(p.contractedCents)}
                      </span>
                    </div>
                    {p.estCompleteDate && (
                      <div
                        className="mt-1 text-[10px]"
                        style={{ color: "var(--hg-text-faint)" }}
                      >
                        Est. complete: {p.estCompleteDate}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
