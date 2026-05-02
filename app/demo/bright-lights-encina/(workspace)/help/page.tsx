import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HelpPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-16">
      <div className="bl-card-elevated bl-fade-in flex w-full max-w-xl flex-col items-center px-8 py-10 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-md"
          style={{
            background: "rgba(124,200,232,0.14)",
            color: "var(--bl-info)",
            border: "1px solid rgba(124,200,232,0.4)",
          }}
        >
          <MessageSquare className="h-5 w-5" />
        </div>
        <h1
          className="bl-serif mt-5 text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Help &amp; Support
        </h1>
        <p
          className="mt-3 max-w-md text-[14px] leading-[1.6]"
          style={{ color: "var(--bl-text-muted)" }}
        >
          During the founding cohort, every question routes straight to a
          founder — no SDR, no junior CSM, no ticket queue. Text or email and
          we&rsquo;re back the same day.
        </p>

        <div className="mt-6 flex w-full flex-col gap-2 text-left">
          <Row
            icon={Phone}
            label="Founder cell"
            value="(813) 442-0253 · text or call"
          />
          <Row
            icon={Mail}
            label="Founder email"
            value="ricardo@gladiusturf.com"
          />
          <Row
            icon={MessageSquare}
            label="Live in-app chat"
            value="Coming Q3 2026 with the AI Receptionist"
          />
        </div>

        <Link
          href="/demo/bright-lights-encina/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 text-[12px]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Today
        </Link>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-md px-3 py-2.5"
      style={{
        background: "rgba(0,0,0,0.18)",
        border: "1px solid var(--bl-border)",
      }}
    >
      <Icon
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: "var(--bl-text-faint)" }}
      />
      <div className="min-w-0 flex-1">
        <div className="bl-eyebrow-muted">{label}</div>
        <div
          className="mt-0.5 text-[12px]"
          style={{ color: "var(--bl-text)" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
