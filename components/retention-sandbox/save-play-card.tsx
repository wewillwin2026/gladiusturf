"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
  Leaf,
  MessageSquare,
  Pencil,
  Send,
  TrendingDown,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type AtRiskCustomer,
  FOLLOW_UP_STEPS,
  type SaveSignalKey,
} from "@/content/retention-demo-data";

const ICON: Record<SaveSignalKey, LucideIcon> = {
  "payment-lag": Clock,
  "reply-lag": MessageSquare,
  "revenue-down": TrendingDown,
  complaints: AlertCircle,
  "seasonal-lapse": Leaf,
  "slow-inbound": Inbox,
};

type Tab = "signals" | "play" | "follow-up";

type Props = {
  customer: AtRiskCustomer;
  onClose: () => void;
  onMarkSaved: (id: string) => void;
  onToast: (message: string) => void;
};

/**
 * Save-play modal. Three tabs: signals / save play / follow-up.
 * Closes on Esc, backdrop click, or close button. Visual-only — no
 * server calls. "Send" and "Mark saved" raise a toast via callback.
 */
export function SavePlayCard({ customer, onClose, onMarkSaved, onToast }: Props) {
  const [tab, setTab] = useState<Tab>("signals");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(customer.draftedMessage);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Save play for ${customer.name}`}
    >
      <div
        className="absolute inset-0 bg-pitch/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-bone/15 bg-slate-deep shadow-pop">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-bone/10 px-6 py-5">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne-bright">
              Save play · {customer.confidence}% confidence
            </div>
            <h3 className="mt-1 truncate font-serif text-xl font-semibold tracking-tight text-bone">
              {customer.name}
            </h3>
            <p className="text-[12px] text-bone/55">
              {customer.segment} · last service {customer.lastService} · ${customer.monthlySpend.toLocaleString()}/mo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-bone/55 transition-colors hover:bg-bone/[0.06] hover:text-bone"
            aria-label="Close save play"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-bone/10 px-4 pt-3">
          <TabButton active={tab === "signals"} onClick={() => setTab("signals")}>
            The signals
          </TabButton>
          <TabButton active={tab === "play"} onClick={() => setTab("play")}>
            The save play
          </TabButton>
          <TabButton active={tab === "follow-up"} onClick={() => setTab("follow-up")}>
            The follow-up
          </TabButton>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "signals" ? (
            <ul className="space-y-3.5">
              {customer.signals.map((s) => {
                const Icon = ICON[s.key];
                return (
                  <li
                    key={s.key}
                    className="rounded-xl border border-bone/10 bg-bone/[0.02] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-champagne/30 bg-champagne/10 text-champagne-bright">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-serif text-[15px] font-semibold text-bone">
                            {s.label}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone/45">
                            tripped {s.trippedOn}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-[1.6] text-bone/70">
                          {s.explanation}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {tab === "play" ? (
            <div>
              <div className="rounded-xl border border-bone/10 bg-bone/[0.02] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/45">
                  AI draft · in your voice
                </div>
                {editing ? (
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={6}
                    className="mt-3 block w-full resize-none rounded-lg border border-bone/15 bg-pitch/60 p-3 text-[14px] leading-[1.6] text-bone outline-none transition-colors focus:border-champagne/50"
                  />
                ) : (
                  <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.65] text-bone/85">
                    {draft}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onToast(`Save play sent to ${customer.name}`);
                    setEditing(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-lime-bright px-5 py-2.5 text-sm font-semibold text-forest-deep shadow-cta transition-shadow hover:shadow-cta-hover"
                >
                  <Send className="h-4 w-4" />
                  Send as-is
                </button>
                <button
                  type="button"
                  onClick={() => setEditing((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-champagne-bright/40 px-5 py-2.5 text-sm font-semibold text-champagne-bright transition-colors hover:border-champagne-bright hover:bg-champagne/10"
                >
                  <Pencil className="h-4 w-4" />
                  {editing ? "Done editing" : "Edit before send"}
                </button>
              </div>
              <p className="mt-3 font-mono text-[11px] text-bone/45">
                Mocked · message won&apos;t actually go out in the sandbox.
              </p>
            </div>
          ) : null}

          {tab === "follow-up" ? (
            <ol className="relative space-y-5 pl-5">
              <span
                aria-hidden
                className="absolute left-[7px] top-2 bottom-2 w-px bg-bone/15"
              />
              {FOLLOW_UP_STEPS.map((step) => (
                <li key={step.day} className="relative">
                  <span
                    aria-hidden
                    className="absolute left-[-20px] top-1.5 h-3 w-3 rounded-full border-2 border-champagne-bright bg-pitch"
                  />
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne-bright">
                    {step.day}
                  </div>
                  <div className="mt-1 font-serif text-[15px] font-semibold text-bone">
                    {step.label}
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.6] text-bone/65">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-bone/10 bg-pitch/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-bone/65 transition-colors hover:text-bone"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkSaved(customer.id);
              onToast(`${customer.name} marked as saved`);
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-moss/40 bg-moss/10 px-4 py-2 text-sm font-semibold text-moss-bright transition-colors hover:border-moss-bright hover:bg-moss/20"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as saved
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "relative rounded-t-lg px-3.5 py-2 text-[13px] font-semibold text-champagne-bright"
          : "rounded-t-lg px-3.5 py-2 text-[13px] font-medium text-bone/55 transition-colors hover:text-bone"
      }
    >
      {children}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-2 -bottom-px h-[2px] bg-champagne-bright"
        />
      ) : null}
    </button>
  );
}
