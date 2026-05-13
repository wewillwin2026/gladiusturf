import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/demo-data/heritage-grounds";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="hg-eyebrow-muted">Settings</span>
        <h1
          className="hg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--hg-text)" }}
        >
          Studio profile
        </h1>
        <p className="text-[13px]" style={{ color: "var(--hg-text-muted)" }}>
          Founder-led setup. Direct line to the team during your first 30 days.
        </p>
      </header>

      <section className="hg-card grid gap-3 p-5 md:grid-cols-2">
        <Field label="Studio name" value={BRAND.name} />
        <Field label="Founder" value={BRAND.founder} />
        <Field label="Phone" value={BRAND.phone} mono />
        <Field label="Email" value={BRAND.email} mono />
        <Field label="Yard" value={BRAND.yard} span={2} />
        <Field label="Service area" value={BRAND.serviceArea} span={2} />
        <Field label="Designers" value={String(BRAND.designers)} />
        <Field label="Installers" value={String(BRAND.installers)} />
      </section>

      <section className="hg-card flex flex-col gap-2 p-5">
        <span className="hg-eyebrow">Ready to talk to a founder?</span>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--hg-text-muted)" }}
        >
          The fastest way to see your real numbers in a workspace like this is
          a 30-minute demo. We&rsquo;ll run a free project-margin audit on
          three of your most recent jobs.
        </p>
        <Link
          href="/demo?utm_source=heritage-grounds-demo"
          className="hg-btn-primary mt-1 self-start"
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
        style={{ color: "var(--hg-text-faint)" }}
      >
        {label}
      </span>
      <div
        className="rounded-md px-3 py-2 text-[13px]"
        style={{
          background: "rgba(0,0,0,0.18)",
          border: "1px solid var(--hg-border)",
          color: "var(--hg-text)",
          fontFamily: mono
            ? "var(--font-geist-mono, ui-monospace, monospace)"
            : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}
