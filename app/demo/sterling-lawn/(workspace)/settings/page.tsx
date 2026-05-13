import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { BRAND } from "@/lib/demo-data/sterling-lawn";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="sl-eyebrow-muted">Settings</span>
        <h1
          className="sl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          Your shop, configured.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--sl-text-muted)" }}>
          Most settings are managed by your account team during onboarding.
          Direct line to founders during your first 30 days.
        </p>
      </header>

      <section className="sl-card flex flex-col gap-4 p-5">
        <span className="sl-eyebrow">Shop profile</span>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Legal name" value={BRAND.name} />
          <Field label="Owner" value={BRAND.founder} />
          <Field
            label="Phone"
            icon={Phone}
            value={BRAND.phone}
            mono
          />
          <Field
            label="Email"
            icon={Mail}
            value={BRAND.email}
            mono
          />
          <Field
            label="Yard / shop"
            icon={MapPin}
            value={BRAND.yard}
            span={2}
          />
          <Field
            label="Service area"
            value={BRAND.serviceArea}
            span={2}
          />
          <Field label="Hours" value={BRAND.hours} />
          <Field label="Founded" value={BRAND.founded} />
        </div>
      </section>

      <section className="sl-card flex flex-col gap-3 p-5">
        <span className="sl-eyebrow">Crew</span>
        <p
          className="text-[13px]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          {BRAND.crewChiefs} crew chiefs, {BRAND.fleetTrucks} trucks. Each
          chief gets a Field Crew App login that installs on the cheapest
          Android in 30 seconds.
        </p>
      </section>

      <section className="sl-card flex flex-col gap-3 p-5">
        <span className="sl-eyebrow">Integrations</span>
        <ul className="grid gap-2 md:grid-cols-2">
          <IntegrationRow name="QuickBooks Online" status="Ships week 1" />
          <IntegrationRow name="Stripe (card-on-file)" status="Ships day 1" />
          <IntegrationRow name="Resend (transactional email)" status="Built in" />
          <IntegrationRow name="Twilio (SMS)" status="Built in" />
        </ul>
      </section>

      <section className="sl-card flex flex-col gap-2 p-5">
        <span className="sl-eyebrow">Ready to talk to a founder?</span>
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          The fastest way to see your real numbers in a workspace like this is
          a 30-minute demo with Ricardo or Joshua. We&rsquo;ll run a free
          pipeline audit on the call.
        </p>
        <Link
          href="/demo?leak=&utm_source=sterling-lawn-demo"
          className="sl-btn-primary mt-1 self-start"
        >
          Book a 30-minute demo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}

type LucideLikeIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

function Field({
  label,
  value,
  icon: Icon,
  mono,
  span,
}: {
  label: string;
  value: string;
  icon?: LucideLikeIcon;
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
        style={{ color: "var(--sl-text-faint)" }}
      >
        {label}
      </span>
      <div
        className="flex items-center gap-2 rounded-md px-3 py-2"
        style={{
          background: "rgba(0,0,0,0.18)",
          border: "1px solid var(--sl-border)",
          color: "var(--sl-text)",
        }}
      >
        {Icon && (
          <Icon
            className="h-3.5 w-3.5"
            style={{ color: "var(--sl-text-faint)" }}
          />
        )}
        <span className={mono ? "sl-mono text-[13px]" : "text-[13px]"}>
          {value}
        </span>
      </div>
    </div>
  );
}

function IntegrationRow({ name, status }: { name: string; status: string }) {
  return (
    <li
      className="flex items-center justify-between rounded-md px-3 py-2 text-[12px]"
      style={{
        background: "rgba(0,0,0,0.18)",
        border: "1px solid var(--sl-border)",
      }}
    >
      <span style={{ color: "var(--sl-text)" }}>{name}</span>
      <span
        className="sl-pill"
        style={{
          background: "rgba(127,226,122,0.10)",
          color: "var(--sl-accent)",
          borderColor: "rgba(127,226,122,0.40)",
        }}
      >
        {status}
      </span>
    </li>
  );
}
