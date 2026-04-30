import * as React from "react";
import { Database } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { EmptyState } from "./ui/EmptyState";

/**
 * War Room engine stub. Same UI grammar as the demo CRM, but pointed at
 * Gladius's own real data — and where the data isn't wired yet, an empty
 * state with a one-liner explaining what wires it up.
 */
export function WarRoomEngineStub({
  title,
  subtitle,
  emptyTitle,
  emptyBody,
}: {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Real"
        title={title}
        subtitle={subtitle}
      />
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Today" value="—" hint="real data wires Phase 3+" />
        <KPICard label="This week" value="—" hint="real data wires Phase 3+" />
        <KPICard label="This month" value="—" hint="real data wires Phase 3+" />
        <KPICard label="All time" value="—" hint="real data wires Phase 3+" />
      </section>
      <EmptyState
        icon={Database}
        title={emptyTitle}
        body={emptyBody}
      />
    </div>
  );
}
