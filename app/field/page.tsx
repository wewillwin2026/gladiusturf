import type { Metadata } from "next";
import {
  ArrowRight,
  Brain,
  Camera,
  ChevronRight,
  Clock,
  FileSignature,
  MapPin,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Field Crew App — Offline-first PWA for the truck.",
  description:
    "GPS clock-in, before/after photo grids, site memory recall, signature capture. Works in dead zones. Built for the cab, not the office.",
};

// ─── Mock visualization primitives (RSC-safe, inline SVG / styled divs) ───

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* outer phone shell */}
      <div className="rounded-[44px] border border-bone/15 bg-obsidian p-3 shadow-pop">
        <div className="rounded-[34px] border border-bone/10 bg-slate-deep p-1">
          {/* notch */}
          <div className="relative flex h-6 items-center justify-center">
            <div className="h-1 w-16 rounded-full bg-bone/20" />
          </div>
          {/* screen */}
          <div className="overflow-hidden rounded-[28px] bg-obsidian">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 py-2 font-mono text-[10px] text-bone/50">
      <span>7:43</span>
      <div className="flex items-center gap-1.5">
        <span className="text-honey-bright">●●●</span>
        <Wifi className="h-3 w-3" />
        <span>92%</span>
      </div>
    </div>
  );
}

function HeroPhoneMock() {
  return (
    <PhoneFrame>
      <StatusBar />
      <div className="px-4 pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-moss-bright">
          Job · GTRF-08412
        </p>
        <h3 className="mt-1 font-serif text-xl text-bone tracking-[-0.01em]">
          Cavendish Residence
        </h3>
        <p className="mt-1 text-xs text-bone/60">
          1428 Magnolia Ridge Rd · Brookhaven, GA
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-bone/10 bg-bone/[0.03] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-bone/40">
              Service
            </p>
            <p className="mt-1 text-xs text-bone">Maintenance · Tier 2</p>
          </div>
          <div className="rounded-xl border border-bone/10 bg-bone/[0.03] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-bone/40">
              Crew
            </p>
            <p className="mt-1 text-xs text-bone">Truck 04 · Marcus L.</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-champagne/20 bg-champagne/5 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-champagne-bright">
            Today
          </p>
          <p className="mt-0.5 text-xs text-bone">12 of 47 jobs · on pace</p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-bone/10 bg-bone/[0.03] px-3 py-2 text-[11px] text-bone/70">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-moss-bright" />
            Geofence ready · 312 ft
          </span>
          <ChevronRight className="h-3 w-3 text-bone/40" />
        </div>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-bright py-4 text-sm font-semibold text-forest-deep shadow-cta"
        >
          <Clock className="h-4 w-4" />
          Clock In
        </button>
        <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-bone/40">
          Hold to confirm · offline ok
        </p>
      </div>
    </PhoneFrame>
  );
}

function SyncStackMock() {
  const items = [
    {
      id: "GTRF-08410",
      title: "Patel Residence",
      meta: "Closed · 11:42 AM",
      tone: "synced" as const,
    },
    {
      id: "GTRF-08411",
      title: "Highland Park HOA",
      meta: "Uploading · 7 of 12 photos",
      tone: "uploading" as const,
    },
    {
      id: "GTRF-08412",
      title: "Cavendish Residence",
      meta: "Queued offline · waiting on signal",
      tone: "queued" as const,
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      {items.map((it) => {
        const dot =
          it.tone === "synced"
            ? "bg-moss-bright"
            : it.tone === "uploading"
              ? "bg-honey-bright"
              : "bg-bone/40";
        const badge =
          it.tone === "synced"
            ? "border-moss/40 bg-moss/10 text-moss-bright"
            : it.tone === "uploading"
              ? "border-honey/40 bg-honey/10 text-honey-bright"
              : "border-bone/20 bg-bone/[0.04] text-bone/60";
        const label =
          it.tone === "synced"
            ? "Synced"
            : it.tone === "uploading"
              ? "Uploading"
              : "Offline";
        const Icon =
          it.tone === "queued" ? WifiOff : it.tone === "uploading" ? Wifi : Wifi;
        return (
          <div
            key={it.id}
            className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40">
                {it.id}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${dot} ${
                    it.tone === "uploading" ? "animate-pulse-dot" : ""
                  }`}
                />
                <Icon className="h-3 w-3" />
                {label}
              </span>
            </div>
            <p className="mt-2 font-serif text-base text-bone tracking-[-0.01em]">
              {it.title}
            </p>
            <p className="mt-1 text-xs text-bone/55">{it.meta}</p>
          </div>
        );
      })}
    </div>
  );
}

function GeofenceMapMock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
      <svg
        viewBox="0 0 320 220"
        className="h-56 w-full"
        aria-hidden="true"
      >
        {/* property outline */}
        <path
          d="M40 40 L260 40 L280 100 L260 180 L80 180 L40 120 Z"
          fill="rgba(127,226,122,0.06)"
          stroke="rgba(127,226,122,0.32)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* driveway */}
        <path
          d="M150 180 L150 210"
          stroke="rgba(245,241,232,0.18)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* house */}
        <rect
          x="125"
          y="80"
          width="70"
          height="50"
          rx="2"
          fill="rgba(245,241,232,0.06)"
          stroke="rgba(245,241,232,0.18)"
        />
        {/* geofence radius */}
        <circle
          cx="160"
          cy="105"
          r="78"
          fill="none"
          stroke="rgba(212,255,74,0.35)"
          strokeWidth="1.2"
          strokeDasharray="2 4"
        />
        {/* property pin */}
        <circle cx="160" cy="105" r="6" fill="#D4FF4A" />
        <circle
          cx="160"
          cy="105"
          r="11"
          fill="none"
          stroke="#D4FF4A"
          strokeOpacity="0.4"
        />
        {/* truck icon */}
        <g transform="translate(216,158)">
          <rect
            x="-12"
            y="-6"
            width="24"
            height="12"
            rx="2"
            fill="#F4CC85"
            stroke="#B8893E"
          />
          <circle cx="-6" cy="8" r="2.5" fill="#062018" />
          <circle cx="6" cy="8" r="2.5" fill="#062018" />
        </g>
        <text
          x="216"
          y="180"
          textAnchor="middle"
          className="fill-honey-bright"
          fontSize="9"
          fontFamily="monospace"
          letterSpacing="1"
        >
          TRUCK 04
        </text>
      </svg>

      <div className="mt-4 rounded-xl border border-moss/30 bg-moss/[0.06] p-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-moss-bright">
            Arrived · Geofence verified
          </p>
          <span className="font-mono text-[10px] text-bone/50">7:43 AM</span>
        </div>
        <p className="mt-1 text-xs text-bone/70">
          Cavendish Residence · auto-SMS sent to homeowner
        </p>
      </div>
    </div>
  );
}

function PhotoGridMock({
  label,
  tone,
}: {
  label: string;
  tone: "before" | "after";
}) {
  const captions = [
    "Front",
    "Back",
    "Edges",
    "Hardscape",
    "Irrigation",
    "Problem zones",
  ];
  const ringTone =
    tone === "before"
      ? "border-champagne/30 text-champagne-bright"
      : "border-moss/40 text-moss-bright";
  return (
    <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-4">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] ${ringTone}`}
        >
          {label}
        </span>
        <span className="font-mono text-[10px] text-bone/40">
          07:46 · 33.8910, -84.3387
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {captions.map((c, i) => (
          <div
            key={c}
            className="aspect-square overflow-hidden rounded-lg border border-bone/10 bg-gradient-to-br from-forest-mid to-forest-deep"
          >
            <div className="flex h-full flex-col justify-between p-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-bone/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-champagne-bright">{c}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteMemoryMock() {
  const items = [
    {
      icon: "🚪",
      label: "Back gate code",
      detail: "4928 — sticky in summer, lift handle slightly",
    },
    {
      icon: "🐕",
      label: "Dog: Mango",
      detail: "Friendly. Will follow the crew. Don't leave gate open.",
    },
    {
      icon: "💧",
      label: "NE corner drip line",
      detail: "Brittle. Handle gently. Replace next visit if torn.",
    },
    {
      icon: "🌿",
      label: "Customer preference",
      detail: "Fewer chemicals — use Tier-3 organic blend on lawn.",
    },
  ];
  return (
    <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-moss-bright">
            Site Memory
          </p>
          <p className="mt-1 font-serif text-lg text-bone tracking-[-0.01em]">
            Cavendish Residence
          </p>
          <p className="text-xs text-bone/55">1428 Magnolia Ridge Rd</p>
        </div>
        <span className="rounded-full border border-champagne/30 bg-champagne/5 px-2.5 py-0.5 font-mono text-[10px] text-champagne-bright">
          14 notes
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((m) => (
          <li
            key={m.label}
            className="flex items-start gap-3 rounded-xl border border-bone/10 bg-bone/[0.03] p-3"
          >
            <span className="text-lg leading-none">{m.icon}</span>
            <div className="min-w-0">
              <p className="text-sm text-bone">{m.label}</p>
              <p className="mt-0.5 text-xs text-bone/55">{m.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-moss/40 px-4 py-2 text-xs font-medium text-moss-bright"
      >
        + Add memory · hold to record
      </button>
    </div>
  );
}

function SignoffMock() {
  const punch = [
    "Edge work along walks + beds",
    "Trim hedges (front + south side)",
    "Hardscape blow-off + cleanup",
    "Irrigation zone 3 head adjusted",
  ];
  return (
    <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-moss-bright">
        Customer Signoff
      </p>
      <p className="mt-1 font-serif text-lg text-bone tracking-[-0.01em]">
        Punch list reviewed
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {punch.map((p) => (
          <li
            key={p}
            className="flex items-center gap-3 rounded-xl border border-bone/10 bg-bone/[0.03] p-3"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-moss/40 bg-moss/10 text-moss-bright">
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span className="text-sm text-bone/85">{p}</span>
          </li>
        ))}
      </ul>

      {/* signature canvas */}
      <div className="mt-4 rounded-xl border border-bone/15 bg-slate-deep p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-bone/40">
          Customer Signature
        </p>
        <svg
          viewBox="0 0 280 60"
          className="mt-2 h-14 w-full"
          aria-hidden="true"
        >
          <path
            d="M10 38 C 30 18, 45 50, 65 32 S 95 12, 115 30 S 150 50, 175 28 S 215 12, 235 32 S 260 44, 270 30"
            fill="none"
            stroke="#F5F1E8"
            strokeOpacity="0.85"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M40 50 L110 50"
            stroke="#F5F1E8"
            strokeOpacity="0.6"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <p className="mt-1 font-mono text-[10px] text-bone/50">
          R. Cavendish · 04/24/2026 · 11:08 AM
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-champagne/30 bg-champagne/[0.06] px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-crest text-champagne-bright">
            Total
          </p>
          <p className="mt-0.5 font-serif text-lg text-champagne-bright">$487.50</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-lime-bright px-4 py-2 text-xs font-semibold text-forest-deep shadow-cta"
        >
          Send invoice
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────

const SYNC_BULLETS = [
  "Cached service-worker fonts + assets — zero font flash on cold start",
  "IndexedDB persistent storage for jobs, photos, signatures, memory notes",
  "Automatic batched photo upload the moment a usable signal returns",
  "Per-record conflict resolution (last-write-wins by timestamp, with audit log)",
];

const ARRIVAL_BULLETS = [
  "300-foot geofence by default — per-site override for gated estates and HOAs",
  "Auto-SMS to the homeowner on arrival (\"Crew is on-site, will start in 10 min\")",
  "Pause / resume timer for breaks, parts runs, and weather holds",
  "Auto-stop the moment the truck leaves the property polygon",
];

const PHOTO_BULLETS = [
  "Six-cell standard grid — configurable per service type (mow, install, irrigation)",
  "Automatic timestamp + GPS, with PII stripped before upload",
  "Batch upload over Wi-Fi or cellular, whichever lands first",
  "Side-by-side before/after comparison auto-generated for the customer portal",
  "Photos feed Site Memory and Quality Radar engines downstream",
];

const MEMORY_BULLETS = [
  "Voice-add memory in five seconds via Whisper transcription",
  "Categorized by zone — front, back, side, irrigation, structures",
  "Auto-tag with photos taken in the same session",
  "Surfaces on the next visit and every visit thereafter",
  "Propagates into the Knowledge Codex so the office sees what the cab sees",
];

const SIGNOFF_BULLETS = [
  "Signature canvas with HiDPI rendering and pressure awareness",
  "Punch list templated by service type — edit on the fly",
  "Invoice fires the second the customer signs, with a Stripe payment link",
  "T+72-hour review request scheduled automatically via Cadence",
];

const VITALS = [
  { stat: "<200ms", label: "interactive response" },
  { stat: "100%", label: "offline-capable on day-of-job flow" },
  { stat: "<60s", label: "full sync after signal returns (typical 8-photo job)" },
  { stat: "0 deps", label: "on the cell network for the core flow" },
];

const DEVICES = [
  {
    title: "iPhone (iOS 16+)",
    body: "Add to home screen, launch like a native app. Full PWA experience, including push, background fetch, and persistent storage. Tested on iPhone 12 through 16 Pro.",
  },
  {
    title: "Android (Chrome)",
    body: "Same install flow, same offline behavior, same battery profile. Service worker caches the entire shell on first run — every subsequent open is sub-second.",
  },
  {
    title: "Rugged tablets",
    body: "Tested on Samsung Galaxy Tab Active5 and Panasonic Toughbook G2. Big-glove buttons, daylight-readable contrast, and a layout that survives the worst rain shift of the year.",
  },
];

export default function FieldPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-bone/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(127,226,122,0.10),transparent_60%)]"
          />
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
            <div>
              <ScrollReveal>
                <Pill>
                  <Smartphone className="h-3 w-3" />
                  Field Crew App
                </Pill>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <h1 className="mt-8 max-w-3xl font-serif text-4xl text-bone tracking-[-0.02em] leading-[1.05] md:text-6xl">
                  Built for the cab,
                  <br />
                  not the office.
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-8 max-w-2xl text-lg text-bone/60 md:text-xl">
                  Most landscape software is designed by people who have never
                  sat in a truck at 5 AM in a no-cell zone, gloves wet, trying
                  to find a customer&apos;s gate code on a screen that won&apos;t load.
                  We have. The Field Crew App is the answer.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="mt-5 max-w-2xl text-lg text-bone/60 md:text-xl">
                  Offline-first, photo-heavy, signature-ready, and built to
                  survive the worst day your crew has ever had — the storm
                  Tuesday, the ice-cold gloves, the dead phone, the irate dog,
                  the gate that swung shut behind the truck. Every screen is
                  designed for one thumb and a foreman who has nine more stops.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <CtaButton href="/demo" size="lg">
                    Book a demo
                  </CtaButton>
                  <a
                    href="#engineering"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-champagne-bright transition-colors hover:text-champagne"
                  >
                    See engineering write-up
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.1}>
              <HeroPhoneMock />
            </ScrollReveal>
          </div>
        </section>

        {/* ── Capability 1 · Offline-first sync ─────────────────── */}
        <section className="bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>Offline</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 max-w-3xl font-serif text-3xl text-bone tracking-[-0.02em] leading-[1.1] md:text-5xl">
                Works in the dead zone behind the customer&apos;s barn.
              </h2>
            </ScrollReveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
              <ScrollReveal>
                <div className="flex flex-col gap-5">
                  <p className="text-base text-bone/60 md:text-lg">
                    The crew opens the day&apos;s route on a flip phone in a
                    Wi-Fi-only coffee shop, drives forty minutes to a no-cell
                    property at the edge of a state park, completes the job,
                    takes twelve photos, gets the customer to sign — and
                    everything syncs the moment a usable signal returns.
                  </p>
                  <p className="text-base text-bone/60 md:text-lg">
                    No spinning circles. No &ldquo;please retry.&rdquo; No foreman at the
                    end of the day re-typing a punch list because the app
                    forgot what he did at 9:14 AM. The day-of-job flow is
                    100% local. The network is a luxury, not a dependency.
                  </p>
                  <ul className="mt-2 flex flex-col gap-3">
                    {SYNC_BULLETS.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-bone/75"
                      >
                        <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-moss-bright" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <SyncStackMock />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Capability 2 · GPS arrival ────────────────────────── */}
        <section className="border-y border-bone/10 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="champagne">Arrival</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 max-w-3xl font-serif text-3xl text-bone tracking-[-0.02em] leading-[1.1] md:text-5xl">
                Hit &ldquo;Arrived&rdquo; the moment you cross the property line.
              </h2>
            </ScrollReveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
              <ScrollReveal>
                <GeofenceMapMock />
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="flex flex-col gap-5">
                  <p className="text-base text-bone/60 md:text-lg">
                    The geofence pings the moment the truck enters the
                    customer&apos;s property boundary — 300 feet by default,
                    customizable per site for gated estates, HOAs, and
                    commercial campuses with long driveways. Job start time
                    auto-stamps. The customer auto-receives a polite SMS that
                    the crew has arrived.
                  </p>
                  <p className="text-base text-bone/60 md:text-lg">
                    No more &ldquo;we got there at 7&rdquo; / &ldquo;the GPS says 7:34&rdquo; arguments
                    on Friday. No more foremen forgetting to clock in. No more
                    payroll disputes that take a Tuesday morning to untangle.
                    The property line is the source of truth — and your
                    customer sees the timestamp on their portal in real time.
                  </p>
                  <ul className="mt-2 flex flex-col gap-3">
                    {ARRIVAL_BULLETS.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-bone/75"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne-bright" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Capability 3 · Photo grid ─────────────────────────── */}
        <section className="bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>Photos</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 max-w-4xl font-serif text-3xl text-bone tracking-[-0.02em] leading-[1.1] md:text-5xl">
                Six photos before. Six photos after. Done in two minutes.
              </h2>
            </ScrollReveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
              <ScrollReveal>
                <div className="flex flex-col gap-5">
                  <p className="text-base text-bone/60 md:text-lg">
                    The crew chief shoots a six-square photo grid before any
                    work begins — front beds, back lawn, edges, hardscape,
                    irrigation manifold, and whatever zones the property has
                    flagged as problem areas. After work: a matching six-square
                    grid, same angles, same order, two minutes flat.
                  </p>
                  <p className="text-base text-bone/60 md:text-lg">
                    A side-by-side comparison auto-generates for the customer&apos;s
                    portal and for whichever crew rotates onto the property
                    next month. No &ldquo;did you actually edge the back?&rdquo; dispute
                    ever happens again. No upsell conversation ever starts
                    cold — every photo is fuel for the next quote.
                  </p>
                  <ul className="mt-2 flex flex-col gap-3">
                    {PHOTO_BULLETS.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-bone/75"
                      >
                        <Camera className="mt-0.5 h-4 w-4 shrink-0 text-moss-bright" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="flex flex-col gap-4">
                  <PhotoGridMock label="Before · 07:46" tone="before" />
                  <PhotoGridMock label="After · 09:12" tone="after" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Capability 4 · Site memory ────────────────────────── */}
        <section className="border-y border-bone/10 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="champagne">Memory</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 max-w-4xl font-serif text-3xl text-bone tracking-[-0.02em] leading-[1.1] md:text-5xl">
                The gate code, the dog, the back zone the customer hates.
              </h2>
            </ScrollReveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
              <ScrollReveal>
                <SiteMemoryMock />
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="flex flex-col gap-5">
                  <p className="text-base text-bone/60 md:text-lg">
                    Site Memory items surface as the crew enters the property —
                    not buried three taps deep in a tab the foreman never
                    opens. Gate codes, dog names, customer preferences, the
                    drip line that&apos;s brittle on the south side, the homeowner
                    who works overnights and would like the crew to skip the
                    blower before 9 AM.
                  </p>
                  <p className="text-base text-bone/60 md:text-lg">
                    New memory captured during the visit logs in five seconds
                    via voice-to-text or a quick &ldquo;+memory&rdquo; button. Six-month
                    crew onboarding becomes six weeks, because the property
                    is teaching the next foreman what the last one learned.
                    The cab becomes a smarter place to work, every visit.
                  </p>
                  <ul className="mt-2 flex flex-col gap-3">
                    {MEMORY_BULLETS.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-bone/75"
                      >
                        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-champagne-bright" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Capability 5 · Signoff ────────────────────────────── */}
        <section className="bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow>Signoff</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 max-w-4xl font-serif text-3xl text-bone tracking-[-0.02em] leading-[1.1] md:text-5xl">
                Customer signs once. Invoice fires. Review request scheduled.
              </h2>
            </ScrollReveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
              <ScrollReveal>
                <div className="flex flex-col gap-5">
                  <p className="text-base text-bone/60 md:text-lg">
                    The on-site walkthrough is the closing moment. The crew
                    chief walks the property with the customer, reviews the
                    punch list, and captures a signature on the phone screen
                    — pressure-aware canvas, HiDPI, looks like ink, not like
                    1998 PDF software.
                  </p>
                  <p className="text-base text-bone/60 md:text-lg">
                    The invoice auto-generates the moment the signature lands.
                    A Stripe payment link is texted to the customer&apos;s phone
                    before the truck leaves the driveway. A T+72-hour review
                    request is scheduled. The job goes from &ldquo;done&rdquo; to &ldquo;paid&rdquo;
                    without anyone in the office lifting a finger — and the
                    foreman drives to the next stop with a closed loop behind
                    him.
                  </p>
                  <ul className="mt-2 flex flex-col gap-3">
                    {SIGNOFF_BULLETS.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-bone/75"
                      >
                        <FileSignature className="mt-0.5 h-4 w-4 shrink-0 text-moss-bright" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <SignoffMock />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Engineering vitals ────────────────────────────────── */}
        <section
          id="engineering"
          className="border-t border-bone/10 bg-obsidian"
        >
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="lime">Engineering</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 max-w-3xl font-serif text-3xl text-bone tracking-[-0.02em] leading-[1.1] md:text-5xl">
                Performance specs.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mt-6 max-w-2xl text-base text-bone/55 md:text-lg">
                These are the numbers we hold the build to. If a release misses
                any of them, it doesn&apos;t ship.
              </p>
            </ScrollReveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VITALS.map((v, i) => (
                <ScrollReveal key={v.stat} delay={i * 0.05}>
                  <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <p className="font-mono text-3xl text-lime-bright tracking-[-0.02em] md:text-4xl">
                      {v.stat}
                    </p>
                    <p className="mt-3 text-sm text-bone/65">{v.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Devices band ──────────────────────────────────────── */}
        <section className="border-t border-bone/10 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="champagne">Devices</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="mt-3 max-w-3xl font-serif text-3xl text-bone tracking-[-0.02em] leading-[1.1] md:text-5xl">
                Runs on the phone you already have.
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {DEVICES.map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 0.05}>
                  <div className="h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <Smartphone className="h-5 w-5 text-champagne-bright" />
                    <h3 className="mt-4 font-serif text-xl text-bone tracking-[-0.01em]">
                      {d.title}
                    </h3>
                    <p className="mt-3 text-sm text-bone/60">{d.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.2}>
              <p className="mt-10 max-w-2xl text-sm text-bone/50">
                No app store. No 30% tax. No &ldquo;please update from 1.2.3 to
                1.2.4&rdquo; nags during the morning route. PWA means we ship on
                Tuesday, the crew gets it Tuesday, and nobody gets fired by
                Apple.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Final CTA band ────────────────────────────────────── */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
