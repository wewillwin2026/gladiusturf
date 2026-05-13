import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/demo-data/timbercare";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="tc-eyebrow-muted">Settings</span>
        <h1 className="tc-serif text-[28px] leading-[1.1]" style={{ color: "var(--tc-text)" }}>
          Yard profile
        </h1>
        <p className="text-[13px]" style={{ color: "var(--tc-text-muted)" }}>
          Founder-led setup during your first 30 days.
        </p>
      </header>

      <section className="tc-card grid gap-3 p-5 md:grid-cols-2">
        <Field label="Company name" value={BRAND.name} />
        <Field label="Founder" value={BRAND.founder} />
        <Field label="Phone" value={BRAND.phone} mono />
        <Field label="Email" value={BRAND.email} mono />
        <Field label="Yard" value={BRAND.yard} span={2} />
        <Field label="Service area" value={BRAND.serviceArea} span={2} />
        <Field label="ISA-certified arborists" value={String(BRAND.isaArboristCount)} />
        <Field label="Crew members" value={String(BRAND.crewMembers)} />
      </section>

      <section className="tc-card flex flex-col gap-2 p-5">
        <span className="tc-eyebrow">Ready to talk to a founder?</span>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--tc-text-muted)" }}
        >
          The fastest way to see your real numbers is a 30-minute demo. We&rsquo;ll
          run a crane-utilization audit on three recent jobs.
        </p>
        <Link
          href="/demo?utm_source=timbercare-demo"
          className="tc-btn-primary mt-1 self-start"
        >
          Book a 30-minute demo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  span,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span?: 1 | 2;
}) {
  return (
    <div
      className="flex flex-col gap-1"
      style={span === 2 ? { gridColumn: "span 2 / span 2" } : undefined}
    >
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--tc-text-faint)" }}
      >
        {label}
      </span>
      <div
        className="rounded-md px-3 py-2 text-[13px]"
        style={{
          background: "rgba(0,0,0,0.18)",
          border: "1px solid var(--tc-border)",
          color: "var(--tc-text)",
          fontFamily: mono ? "var(--font-geist-mono, ui-monospace, monospace)" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}
