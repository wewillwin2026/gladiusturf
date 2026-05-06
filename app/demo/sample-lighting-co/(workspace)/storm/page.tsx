import {
  CloudLightning,
  Crown,
  Languages,
  MapPin,
  Send,
  Shield,
  Wind,
  Zap,
} from "lucide-react";
import { STORM_HISTORY, STORM_PLAYBOOK } from "@/lib/demo-data/bright-lights";
import { StormToggle } from "./StormToggle";

export const dynamic = "force-dynamic";

export default function StormPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="bl-eyebrow-muted">Reactive revenue · productized</span>
        <h1
          className="bl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Storm Mode — Helene and Milton, but on rails.
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bl-text-muted)" }}>
          One toggle activates a pre-built bilingual workflow. Every customer in
          the path gets a check-in offer; Bright Guardian members jump the
          queue. Your biggest reactive revenue spike of the year stops being
          ad-hoc.
        </p>
      </header>

      <section
        className="bl-card-elevated flex flex-col gap-4 p-6"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(232,95,95,0.18) 0%, rgba(232,95,95,0.04) 50%, transparent 80%)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: "rgba(232,95,95,0.18)",
                color: "var(--bl-alert)",
                border: "1px solid rgba(232,95,95,0.4)",
              }}
            >
              <CloudLightning className="h-6 w-6" />
            </div>
            <div>
              <span className="bl-eyebrow" style={{ color: "var(--bl-alert)" }}>
                Hurricane response
              </span>
              <h2
                className="bl-serif mt-1 text-[22px]"
                style={{ color: "var(--bl-text)" }}
              >
                Pre-built · Helene + Milton 2024
              </h2>
            </div>
          </div>
          <StormToggle />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {STORM_HISTORY.map((s) => (
            <div
              key={s.name}
              className="rounded-md px-4 py-3"
              style={{
                background: "rgba(0,0,0,0.32)",
                border: "1px solid var(--bl-border)",
              }}
            >
              <div className="flex items-center gap-2">
                <Wind
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--bl-alert)" }}
                />
                <span
                  className="bl-eyebrow"
                  style={{ color: "var(--bl-alert)" }}
                >
                  Hurricane {s.name}
                </span>
              </div>
              <div
                className="mt-2 text-[13px]"
                style={{ color: "var(--bl-text)" }}
              >
                {s.date}
              </div>
              <div
                className="mt-1 text-[11px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                {s.landfall}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="bl-card overflow-hidden">
          <header
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <span className="bl-eyebrow">One-click campaign</span>
            <span
              className="bl-mono text-[11px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              {STORM_PLAYBOOK.affectedCustomers} customers · 10 ZIPs
            </span>
          </header>
          <div className="px-5 py-5">
            <p
              className="text-[13px] leading-[1.55]"
              style={{ color: "var(--bl-text-muted)" }}
            >
              When the National Hurricane Center declares a named storm
              landfall in your service area, a pre-built campaign queues itself
              up. Approve once, and every customer in the affected ZIPs gets:
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              <PlaybookStep
                icon={Languages}
                title="Bilingual check-in offer"
                detail="English + Spanish auto-personalized; Cristian's voice; reply to the same address that books the ladder visit."
              />
              <PlaybookStep
                icon={Crown}
                title="Bright Guardian priority queue"
                detail="Guardian-tier members jump ahead. 24-hour SLA after named storms is the differentiator that closes the upsell."
                tone="amber"
              />
              <PlaybookStep
                icon={MapPin}
                title="Geographic targeting"
                detail={`Sends only to customers in affected ZIPs (${STORM_PLAYBOOK.affectedZips.length} live). No spam to inland customers who didn't see weather.`}
              />
              <PlaybookStep
                icon={Shield}
                title="Photo capture on arrival"
                detail="Every Guardian visit logs before/after photos. Insurance documentation. Customer trust. Repeatable."
              />
            </ul>
            <div className="mt-5 flex items-center gap-3">
              <button className="bl-btn-primary">
                <Send className="h-4 w-4" /> Activate playbook
              </button>
              <button className="bl-btn-ghost">Preview email</button>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <div className="bl-card p-4">
            <span className="bl-eyebrow">Sample message · EN</span>
            <p
              className="mt-2 text-[12px] leading-[1.6] italic"
              style={{ color: "var(--bl-text)" }}
            >
              {STORM_PLAYBOOK.oneLineEnglish}
            </p>
          </div>
          <div className="bl-card p-4">
            <span className="bl-eyebrow">Mensaje · ES</span>
            <p
              className="mt-2 text-[12px] leading-[1.6] italic"
              style={{ color: "var(--bl-text)" }}
            >
              {STORM_PLAYBOOK.oneLineSpanish}
            </p>
          </div>
          <div
            className="bl-card p-4"
            style={{
              background: "rgba(244,184,96,0.06)",
              border: "1px solid rgba(244,184,96,0.32)",
            }}
          >
            <div className="flex items-center gap-2">
              <Zap
                className="h-4 w-4"
                style={{ color: "var(--bl-accent)" }}
              />
              <span className="bl-eyebrow">Why this matters</span>
            </div>
            <p
              className="mt-2 text-[12px] leading-[1.6]"
              style={{ color: "var(--bl-text-muted)" }}
            >
              Helene and Milton in 2024 drove your biggest reactive call-volume
              spike of the year. Productizing it means you stop scrambling at
              4 a.m. on a Sunday — the system has already booked the route by
              the time the rain stops.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function PlaybookStep({
  icon: Icon,
  title,
  detail,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  tone?: "amber";
}) {
  const color = tone === "amber" ? "var(--bl-accent)" : "var(--bl-info)";
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{
          background: tone === "amber" ? "rgba(244,184,96,0.16)" : "rgba(124,200,232,0.16)",
          color,
          border: `1px solid ${color}55`,
        }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1">
        <div
          className="text-[13px] font-medium"
          style={{ color: "var(--bl-text)" }}
        >
          {title}
        </div>
        <p
          className="mt-0.5 text-[12px] leading-[1.55]"
          style={{ color: "var(--bl-text-muted)" }}
        >
          {detail}
        </p>
      </div>
    </li>
  );
}
