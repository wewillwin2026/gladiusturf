import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Sparkles } from "lucide-react";

/**
 * Stub page card used by the "Coming X" nav stubs (Campaigns, Referrals,
 * QuickBooks Sync, Help, etc.). Production-SaaS-pattern: aspirational, not
 * deceptive — clearly labeled with a target date and a "notify me" button.
 */
export function ComingSoonCard({
  title,
  badge,
  description,
  bullets,
  notifyLabel = "Notify me when this ships",
}: {
  title: string;
  badge: string;
  description: string;
  bullets?: string[];
  notifyLabel?: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
      <div className="bl-card-elevated bl-fade-in flex w-full max-w-xl flex-col items-center px-8 py-10 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-md"
          style={{
            background: "rgba(244,184,96,0.18)",
            color: "var(--bl-accent)",
            border: "1px solid rgba(244,184,96,0.4)",
          }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <h1
          className="bl-serif mt-5 text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          {title}
        </h1>
        <span
          className="bl-pill bl-pill-amber mt-3"
          style={{ fontSize: 11, padding: "4px 10px" }}
        >
          {badge}
        </span>
        <p
          className="mt-4 max-w-md text-[14px] leading-[1.6]"
          style={{ color: "var(--bl-text-muted)" }}
        >
          {description}
        </p>
        {bullets && bullets.length > 0 && (
          <ul className="mt-5 flex flex-col items-start gap-2 text-left">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-[13px]"
                style={{ color: "var(--bl-text-muted)" }}
              >
                <span
                  className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--bl-accent)" }}
                />
                {b}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="bl-btn-primary mt-6"
          aria-label={notifyLabel}
        >
          <Bell className="h-3.5 w-3.5" />
          {notifyLabel}
        </button>
        <Link
          href="/demo/bright-lights-encina/dashboard"
          className="mt-5 inline-flex items-center gap-1.5 text-[12px]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Today
        </Link>
      </div>
    </div>
  );
}
