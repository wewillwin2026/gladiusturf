"use client";

import { useState } from "react";
import {
  ArrowRight,
  Beaker,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  Gift,
  MailPlus,
  MapPin,
  Phone,
  PlusCircle,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import {
  PORTAL_DEMO,
  RESCHEDULE_BLOCKED_DATES,
  type FeedEntry,
  type UpcomingVisit,
} from "@/content/portal-demo";
import { JobCard } from "@/components/portal/job-card";
import { PaymentLink } from "@/components/portal/payment-link";
import { RescheduleForm } from "@/components/portal/reschedule-form";
import { cn } from "@/lib/cn";

export default function PortalDemoPage() {
  const c = PORTAL_DEMO.customer;
  const [reschedule, setReschedule] = useState<UpcomingVisit | null>(null);
  const [feedOpen, setFeedOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(PORTAL_DEMO.referral.shareUrl)
        .then(() => {
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 1800);
        })
        .catch(() => {
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 1800);
        });
    } else {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sandbox banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-honey-deep/25 bg-honey/15 px-4 py-3 text-[13px] text-forest">
        <Beaker className="mt-0.5 h-4 w-4 flex-none text-honey-deep" />
        <p>
          <span className="font-semibold">You&apos;re viewing a sandbox preview.</span>{" "}
          No data is saved. Click around — none of these actions hit a real database.
        </p>
      </div>

      {/* Welcome strip */}
      <section className="overflow-hidden rounded-2xl border border-pitch/10 bg-white shadow-card">
        <div className="grid gap-0 md:grid-cols-[1.5fr_1fr]">
          <div className="p-6 md:p-7">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
              Welcome back
            </div>
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.02em] text-forest md:text-4xl">
              Hi {c.firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-[15px] text-forest/80">
              Your next visit is{" "}
              <span className="font-semibold text-forest">
                {PORTAL_DEMO.nextVisitHeadline}
              </span>{" "}
              — bi-weekly mowing with Marcus, 9–11am.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-forest">
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 rounded-full bg-champagne"
              />
              {PORTAL_DEMO.status.label}
              <span className="font-normal text-forest/70">
                · {PORTAL_DEMO.status.detail}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <QuickAction
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Reschedule"
                onClick={() => setReschedule(PORTAL_DEMO.upcomingVisits[0])}
              />
              <QuickAction
                icon={<CreditCard className="h-3.5 w-3.5" />}
                label="Pay invoice"
                href="#invoices"
              />
              <QuickAction
                icon={<PlusCircle className="h-3.5 w-3.5" />}
                label="Request service"
                href="#feed"
              />
            </div>
          </div>

          <div className="border-t border-pitch/10 bg-bone p-6 md:border-l md:border-t-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
              Property on file
            </div>
            <div className="mt-2 flex items-start gap-2 text-[14px] text-forest">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-forest/60" />
              <div>
                <div className="font-medium">{c.address}</div>
                <div className="text-stone">{c.cityState}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5 text-[12px] text-stone">
              <span className="inline-flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-honey-deep" /> Forecast Thu: 72°
                / clear
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Crew chief: Marcus Reyes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-forest/60" />{" "}
                {c.sinceLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column: visits + invoices */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Upcoming visits */}
        <section className="rounded-2xl border border-pitch/10 bg-white p-6 shadow-card">
          <SectionHeader
            title="Upcoming visits"
            kicker="Next 30 days"
            action={
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-forest/70 hover:text-forest"
              >
                View calendar <ArrowRight className="h-3 w-3" />
              </button>
            }
          />
          <ul className="mt-4 divide-y divide-pitch/10">
            {PORTAL_DEMO.upcomingVisits.map((v) => (
              <li
                key={v.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex h-12 w-14 flex-none flex-col items-center justify-center rounded-lg bg-bone text-center">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone">
                    {v.dateLabel.split(" · ")[0]}
                  </span>
                  <span className="font-serif text-base font-semibold text-forest">
                    {v.dateLabel.split(" · ")[1]?.replace(/\D+/, "") ||
                      v.dateLabel.split(" · ")[1]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-[15px] font-semibold tracking-[-0.01em] text-forest">
                    {v.service}
                  </div>
                  <div className="mt-0.5 text-[12px] text-stone">
                    {v.serviceDetail}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {v.crewChief}
                    </span>
                    <span>·</span>
                    <span>{v.window}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReschedule(v)}
                  className="inline-flex items-center gap-1.5 self-start rounded-full border border-forest/15 bg-bone px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-paper sm:self-center"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Reschedule
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Open invoices */}
        <section
          id="invoices"
          className="rounded-2xl border border-pitch/10 bg-white p-6 shadow-card"
        >
          <SectionHeader
            title="Open invoices"
            kicker={`${PORTAL_DEMO.openInvoices.length} outstanding`}
          />
          <div className="mt-4 space-y-3">
            {PORTAL_DEMO.openInvoices.map((inv) => (
              <PaymentLink
                key={inv.id}
                invoice={inv}
                customerEmail={c.email}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-bone/50 px-3 py-2.5 text-[12px] text-forest/80">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-forest/60" />
              ACH or card · receipts auto-emailed
            </span>
            <button
              type="button"
              className="font-semibold text-forest hover:underline"
            >
              View all
            </button>
          </div>
        </section>
      </div>

      {/* Recent jobs */}
      <section className="rounded-2xl border border-pitch/10 bg-white p-6 shadow-card">
        <SectionHeader
          title="Recent jobs"
          kicker="Last 30 days"
          action={
            <button
              type="button"
              onClick={() => setFeedOpen(true)}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-forest/70 hover:text-forest"
            >
              View full history <ArrowRight className="h-3 w-3" />
            </button>
          }
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PORTAL_DEMO.completedJobs.map((j) => (
            <JobCard
              key={j.id}
              date={j.date}
              service={j.service}
              crew={j.crew}
              duration={j.duration}
              notes={j.notes}
              photoCount={j.photoCount}
              signedBy={j.signedBy}
            />
          ))}
        </div>
      </section>

      {/* Refer + earn */}
      <section className="overflow-hidden rounded-2xl border border-pitch/10 bg-gradient-to-br from-pitch to-slate-deep p-6 text-parchment shadow-card md:p-7">
        <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-champagne/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-crest text-champagne-bright">
              <Gift className="h-3 w-3" /> Refer + earn
            </div>
            <h2 className="mt-3 font-serif text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
              Refer a neighbor → both get $50 credit.
            </h2>
            <p className="mt-2 max-w-md text-[14px] text-parchment/75">
              Send your unique link. When they book their first visit, $50
              lands on both your accounts. Tracked automatically — no codes,
              no forms.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-full bg-lime-bright px-5 py-2.5 text-sm font-semibold text-pitch transition-colors hover:bg-lime"
              >
                <Copy className="h-3.5 w-3.5" />
                {shareCopied ? "Copied!" : "Get share link"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-champagne-bright/40 px-4 py-2 text-sm font-medium text-champagne-bright transition-colors hover:bg-champagne/10"
              >
                <MailPlus className="h-3.5 w-3.5" />
                Email a neighbor
              </button>
            </div>
            {shareCopied && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-champagne/20 px-3 py-1 text-[12px] font-medium text-champagne-bright">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Link copied to clipboard
              </div>
            )}
          </div>
          <div className="rounded-xl border border-champagne/20 bg-champagne/5 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-crest text-parchment/60">
                Your credits
              </span>
              <span className="font-serif text-2xl font-semibold text-champagne-bright">
                ${PORTAL_DEMO.referral.earned}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-parchment/10">
              <div
                className="h-full rounded-full bg-champagne-bright"
                style={{ width: "60%" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-parchment/60">
              <span>${PORTAL_DEMO.referral.earned} earned</span>
              <span>${PORTAL_DEMO.referral.pending} pending</span>
            </div>
            <div className="mt-4 truncate rounded-lg bg-pitch/60 px-3 py-2 font-mono text-[11px] text-parchment/75">
              {PORTAL_DEMO.referral.shareUrl}
            </div>
          </div>
        </div>
      </section>

      {/* Service history feed */}
      <section
        id="feed"
        className="rounded-2xl border border-pitch/10 bg-white shadow-card"
      >
        <button
          type="button"
          onClick={() => setFeedOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left"
          aria-expanded={feedOpen}
        >
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
              Service history
            </div>
            <h2 className="mt-1 font-serif text-xl font-semibold tracking-[-0.01em] text-forest">
              Last 6 months · {PORTAL_DEMO.feed.length} entries
            </h2>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-bone text-forest">
            {feedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>
        {feedOpen && (
          <div className="border-t border-pitch/10 px-6 py-5">
            <ol className="relative ml-2 space-y-5 border-l border-pitch/10 pl-5">
              {PORTAL_DEMO.feed.map((entry) => (
                <FeedRow key={entry.id} entry={entry} />
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Footer note */}
      <div className="pt-2 text-center text-[11px] text-stone">
        Powered by GladiusTurf · Client Portal · sandbox preview
      </div>

      {/* Reschedule modal */}
      <RescheduleForm
        open={!!reschedule}
        visitLabel={reschedule?.dateLabel ?? ""}
        serviceLabel={reschedule?.service ?? ""}
        anchorDate={reschedule?.isoDate ?? "2026-05-07"}
        blockedDates={RESCHEDULE_BLOCKED_DATES}
        onClose={() => setReschedule(null)}
      />
    </div>
  );
}

function SectionHeader({
  title,
  kicker,
  action,
}: {
  title: string;
  kicker?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        {kicker && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
            {kicker}
          </div>
        )}
        <h2 className="mt-0.5 font-serif text-xl font-semibold tracking-[-0.01em] text-forest">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-bone px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-paper";
  if (href) {
    return (
      <a href={href} className={cls}>
        {icon} {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {icon} {label}
    </button>
  );
}

function FeedRow({ entry }: { entry: FeedEntry }) {
  const accent = feedAccent(entry.kind);
  return (
    <li className="relative">
      <span
        aria-hidden
        className={cn(
          "absolute -left-[27px] top-1 inline-flex h-4 w-4 items-center justify-center rounded-full",
          accent.bg
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} />
      </span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone">
          {entry.date}
        </span>
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", accent.label)}>
          {kindLabel(entry.kind)}
        </span>
      </div>
      <div className="mt-0.5 font-serif text-[15px] font-semibold tracking-[-0.01em] text-forest">
        {entry.title}
      </div>
      <p className="mt-0.5 text-[13px] leading-[1.55] text-forest/75">
        {entry.detail}
      </p>
    </li>
  );
}

function feedAccent(kind: FeedEntry["kind"]) {
  switch (kind) {
    case "payment":
      return {
        bg: "bg-champagne/20",
        dot: "bg-champagne",
        label: "text-champagne",
      };
    case "approval":
      return {
        bg: "bg-honey/20",
        dot: "bg-honey-deep",
        label: "text-honey-deep",
      };
    case "referral":
      return {
        bg: "bg-champagne/15",
        dot: "bg-champagne",
        label: "text-champagne",
      };
    case "message":
      return {
        bg: "bg-bone",
        dot: "bg-stone",
        label: "text-stone",
      };
    case "visit":
    default:
      return {
        bg: "bg-pitch/10",
        dot: "bg-pitch",
        label: "text-forest/80",
      };
  }
}

function kindLabel(kind: FeedEntry["kind"]): string {
  switch (kind) {
    case "payment":
      return "Payment";
    case "approval":
      return "Approval";
    case "referral":
      return "Referral";
    case "message":
      return "Message";
    case "visit":
      return "Visit";
  }
}

