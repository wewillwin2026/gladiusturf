"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Sparkles,
  Trees,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Input";
import { StatusPill } from "./ui/StatusPill";
import { SatelliteCanvas } from "./SatelliteCanvas";
import { SERVICE_RATES, priceFor } from "@/lib/shared/pricing";
import { money, num, sqft } from "@/lib/shared/format";
import { cn } from "@/lib/cn";
import { trackConversion } from "@/lib/tracking/client";

const TAMPA_ADDRESSES: { value: string; label: string }[] = [
  { value: "2231 Lakeshore Way, Tampa FL 33606", label: "2231 Lakeshore Way" },
  { value: "412 Bayshore Blvd, Tampa FL 33606", label: "412 Bayshore Blvd" },
  { value: "3218 Maple Hollow Ln, Tampa FL 33625", label: "3218 Maple Hollow Ln" },
  { value: "780 Heritage Oaks, Tampa FL 33625", label: "780 Heritage Oaks" },
  { value: "5601 Riverside Dr, Tampa FL 33626", label: "5601 Riverside Dr" },
  { value: "1450 Beaumont Ave, Tampa FL 33611", label: "1450 Beaumont Ave" },
  { value: "2102 Cypress Pointe, Tampa FL 33606", label: "2102 Cypress Pointe" },
  { value: "660 Hampton Pl, Tampa FL 33629", label: "660 Hampton Pl" },
  { value: "1820 Sunset Park Rd, Tampa FL 33611", label: "1820 Sunset Park Rd" },
  { value: "3340 Davis Islands Way, Tampa FL 33606", label: "3340 Davis Islands Way" },
  { value: "445 Beach Park Ave, Tampa FL 33609", label: "445 Beach Park Ave" },
  { value: "1207 Westshore Ct, Tampa FL 33611", label: "1207 Westshore Ct" },
  { value: "5520 Ridgeview Dr, Tampa FL 33625", label: "5520 Ridgeview Dr" },
  { value: "812 Hyde Park Ave, Tampa FL 33606", label: "812 Hyde Park Ave" },
  { value: "2900 Riverwalk Cove, Tampa FL 33602", label: "2900 Riverwalk Cove" },
];

type Measurements = {
  address: string;
  lat: number;
  lng: number;
  turfSqft: number;
  drivewaySqft: number;
  bedsSqft: number;
  trees: number;
  polygon: [number, number][];
};

type Step = "address" | "measure" | "services" | "scope" | "preview" | "sent";

const SUGGESTED_BY_DEFAULT = new Set([
  "mowing",
  "edging",
  "fertilization",
  "weed-control",
]);

export function AIQuoteDrafter({ mapboxToken }: { mapboxToken: string | null }) {
  const [step, setStep] = React.useState<Step>("address");
  const [address, setAddress] = React.useState("");
  const [matches, setMatches] = React.useState<typeof TAMPA_ADDRESSES>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [measuring, setMeasuring] = React.useState(false);
  const [measurements, setMeasurements] = React.useState<Measurements | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(SUGGESTED_BY_DEFAULT);
  const [scope, setScope] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    const q = address.trim().toLowerCase();
    if (q.length < 2) {
      setMatches([]);
      return;
    }
    setMatches(
      TAMPA_ADDRESSES.filter(
        (a) =>
          a.value.toLowerCase().includes(q) ||
          a.label.toLowerCase().includes(q),
      ).slice(0, 8),
    );
  }, [address]);

  function pickAddress(value: string) {
    setAddress(value);
    setShowDropdown(false);
  }

  async function startMeasurement() {
    if (!address.trim()) return;
    setStep("measure");
    setMeasuring(true);
    setMeasurements(null);
    try {
      // Brief beat so the spinner is visible — feels real.
      await new Promise((r) => setTimeout(r, 600));
      const res = await fetch("/api/measure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) throw new Error("measure failed");
      const m = (await res.json()) as Measurements;
      setMeasurements(m);
      // Hold on the measurement screen briefly so the polygon animation completes.
      await new Promise((r) => setTimeout(r, 1400));
      setStep("services");
    } catch (err) {
      toast.error("Couldn't measure that property");
      setStep("address");
    } finally {
      setMeasuring(false);
    }
  }

  function toggleService(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function streamScope() {
    if (!measurements) return;
    setStep("scope");
    setStreaming(true);
    setScope("");
    const services = SERVICE_RATES.filter((s) => selected.has(s.slug)).map(
      (s) => s.name,
    );
    try {
      const res = await fetch("/api/ai/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          measurements: {
            turfSqft: measurements.turfSqft,
            drivewaySqft: measurements.drivewaySqft,
            bedsSqft: measurements.bedsSqft,
            trees: measurements.trees,
          },
          services,
        }),
      });
      if (!res.ok || !res.body) throw new Error("scope stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setScope((prev) => prev + chunk);
      }
    } catch (err) {
      toast.error("Couldn't generate scope-of-work");
    } finally {
      setStreaming(false);
    }
  }

  async function sendQuote() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setStep("sent");
    const turf = measurements?.turfSqft ?? 0;
    const totalDollars = Array.from(selected).reduce(
      (s, slug) => s + (priceFor(slug, turf) || 0),
      0,
    );
    trackConversion("quote_drafted", Math.round(totalDollars * 100), {
      address,
      services: Array.from(selected),
      turfSqft: turf,
    });
    toast.success("Quote sent · text + email", {
      description: `Delivered to a customer at ${address.split(",")[0]}.`,
    });
  }

  function reset() {
    setStep("address");
    setAddress("");
    setMeasurements(null);
    setSelected(SUGGESTED_BY_DEFAULT);
    setScope("");
  }

  // Compute prices
  const services = SERVICE_RATES.map((s) => {
    const checked = selected.has(s.slug);
    let units = 0;
    if (s.unit === "sqft") {
      units = ["mowing", "fertilization", "weed-control", "pest-control"].includes(s.slug)
        ? measurements?.turfSqft ?? 0
        : s.slug === "aeration" || s.slug === "overseed"
          ? measurements?.turfSqft ?? 0
          : s.slug === "mulch"
            ? measurements?.bedsSqft ?? 0
            : measurements?.turfSqft ?? 0;
    } else if (s.unit === "linear_ft") {
      units = Math.round(((measurements?.turfSqft ?? 0) / 100) * 4); // rough perimeter
    } else if (s.unit === "each") {
      units = s.slug === "tree-trim" ? measurements?.trees ?? 0 : 1;
    }
    return { ...s, checked, units, total: priceFor(s.slug, units) };
  });
  const total = services
    .filter((s) => s.checked)
    .reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Stepper step={step} />

        {step === "address" && (
          <div className="g-card p-6">
            <h2>Step 1 · Property address</h2>
            <p className="mt-1 text-[13px] text-g-text-muted">
              Type to search 15 sample Tampa-area addresses, or paste any.
            </p>
            <div className="mt-4 relative">
              <Input
                placeholder="Start typing an address…"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
              {showDropdown && matches.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 g-card max-h-72 overflow-y-auto z-10 shadow-xl">
                  {matches.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => pickAddress(m.value)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-g-text-muted hover:bg-g-surface-2 hover:text-g-text"
                    >
                      <MapPin className="h-3 w-3 text-g-text-faint shrink-0" />
                      <span className="font-geist-mono">{m.value}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                disabled={!address.trim()}
                onClick={startMeasurement}
              >
                Measure property
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {(step === "measure" || step === "services" || step === "scope" || step === "preview" || step === "sent") && (
          <div className="g-card p-6">
            <div className="flex items-baseline justify-between">
              <h2>Satellite measurement</h2>
              {measurements && (
                <StatusPill tone="accent">
                  <Check className="h-3 w-3" />
                  Measured
                </StatusPill>
              )}
            </div>
            <div className="mt-4 aspect-[16/10] rounded-lg overflow-hidden border border-g-border">
              <SatelliteCanvas
                mapboxToken={mapboxToken}
                measuring={measuring}
                measurements={measurements}
              />
            </div>
            {measurements && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                <Stat label="Turf" value={sqft(measurements.turfSqft)} />
                <Stat label="Driveway" value={sqft(measurements.drivewaySqft)} />
                <Stat label="Beds" value={sqft(measurements.bedsSqft)} />
                <Stat label="Trees" value={String(measurements.trees)} />
              </div>
            )}
          </div>
        )}

        {(step === "services" || step === "scope" || step === "preview" || step === "sent") && measurements && (
          <div className="g-card p-6">
            <h2>Step 2 · Services</h2>
            <p className="mt-1 text-[13px] text-g-text-muted">
              Defaults checked based on lot size. Toggle to adjust.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => toggleService(s.slug)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border text-left transition-colors",
                    s.checked
                      ? "border-g-accent/50 bg-g-accent-faint"
                      : "border-g-border bg-g-surface hover:bg-g-surface-2",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        "h-4 w-4 shrink-0 rounded border flex items-center justify-center",
                        s.checked
                          ? "bg-g-accent border-g-accent"
                          : "border-g-border",
                      )}
                    >
                      {s.checked && <Check className="h-2.5 w-2.5 text-black" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] text-g-text truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-g-text-faint truncate">
                        {s.unit === "each"
                          ? `${s.units} × $${s.rate}`
                          : `${num(s.units)} ${s.unit} × $${s.rate}`}
                      </div>
                    </div>
                  </div>
                  <span className="font-geist-mono text-[13px] text-g-text shrink-0 tabular-nums">
                    {money(s.total * 100)}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-g-border-subtle pt-4">
              <span className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
                Estimated total
              </span>
              <span className="font-geist-mono text-[20px] text-g-accent tabular-nums">
                {money(total * 100)}
              </span>
            </div>
            {step === "services" && (
              <div className="mt-4 flex justify-end">
                <Button variant="primary" size="lg" onClick={streamScope}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Draft scope with AI
                </Button>
              </div>
            )}
          </div>
        )}

        {(step === "scope" || step === "preview" || step === "sent") && (
          <div className="g-card p-6">
            <div className="flex items-baseline justify-between">
              <h2>Step 3 · Scope of work</h2>
              {streaming ? (
                <StatusPill tone="info">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Streaming · Anthropic
                </StatusPill>
              ) : (
                <StatusPill tone="accent">
                  <Check className="h-3 w-3" />
                  Ready
                </StatusPill>
              )}
            </div>
            <Textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={9}
              className="mt-4 font-geist-sans"
              placeholder="Scope of work will stream here…"
              readOnly={streaming}
            />
            {!streaming && step === "scope" && scope.trim().length > 0 && (
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={streamScope}>
                  Re-draft
                </Button>
                <Button variant="primary" size="lg" onClick={() => setStep("preview")}>
                  Preview quote
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="g-card p-5 sticky top-16">
          <div className="flex items-baseline justify-between">
            <h2>Preview</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Quote · DRAFT
            </span>
          </div>

          <div className="mt-4 rounded-md border border-g-border-subtle p-4 bg-g-surface-2/30">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-[15px] text-g-text">
                Cypress Lawn &amp; Landscape
              </span>
              <span className="font-geist-mono text-[10px] text-g-text-faint">
                Tampa, FL
              </span>
            </div>
            <p className="mt-1 text-[11px] text-g-text-faint">
              {address || "(address pending)"}
            </p>

            {measurements && (
              <div className="mt-4 flex gap-3 text-[11px] text-g-text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {sqft(measurements.turfSqft)} turf
                </span>
                <span className="inline-flex items-center gap-1">
                  <Trees className="h-3 w-3" />
                  {measurements.trees} trees
                </span>
              </div>
            )}

            <ul className="mt-4 flex flex-col gap-1.5 text-[12px]">
              {services
                .filter((s) => s.checked)
                .map((s) => (
                  <li
                    key={s.slug}
                    className="flex items-center justify-between gap-3 border-b border-g-border-subtle pb-1.5 last:border-b-0"
                  >
                    <span className="text-g-text-muted">{s.name}</span>
                    <span className="font-geist-mono tabular-nums text-g-text">
                      {money(s.total * 100)}
                    </span>
                  </li>
                ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-g-border pt-2">
              <span className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
                Total
              </span>
              <span className="font-geist-mono text-[16px] text-g-accent tabular-nums">
                {money(total * 100)}
              </span>
            </div>

            {scope && (
              <div className="mt-4 text-[11px] leading-relaxed text-g-text-muted whitespace-pre-wrap">
                {scope}
                {streaming && <span className="inline-block w-1 h-3 ml-0.5 bg-g-accent animate-pulse" />}
              </div>
            )}
          </div>

          {step === "preview" && (
            <div className="mt-4 flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={sendQuote}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send quote (text + email)
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
              <Button variant="ghost" size="md" onClick={() => setStep("scope")}>
                Back to scope
              </Button>
            </div>
          )}

          {step === "sent" && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="rounded-md border border-g-accent/30 bg-g-accent-faint p-3 text-[12px] text-g-accent">
                Quote delivered. The customer can view it on the portal and
                we&rsquo;ll fire the InstantText engine if they don&rsquo;t
                open it within 4 hours.
              </div>
              <Button variant="secondary" onClick={reset}>
                Draft another
              </Button>
            </div>
          )}

          {!mapboxToken && (
            <p className="mt-4 text-[10px] text-g-text-faint border-t border-g-border-subtle pt-3">
              Mapbox token not set — using styled SVG fallback for the satellite
              view. Add{" "}
              <span className="font-geist-mono">NEXT_PUBLIC_MAPBOX_TOKEN</span>{" "}
              to upgrade.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "address", label: "Address" },
    { id: "measure", label: "Measure" },
    { id: "services", label: "Services" },
    { id: "scope", label: "Scope" },
    { id: "preview", label: "Send" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);
  const idx = step === "sent" ? steps.length : currentIdx;
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2 text-[11px]">
          <span
            className={cn(
              "h-6 w-6 inline-flex items-center justify-center rounded-full font-geist-mono",
              i < idx
                ? "bg-g-accent text-black"
                : i === idx
                  ? "bg-g-accent-faint text-g-accent border border-g-accent/40"
                  : "bg-g-surface-2 text-g-text-faint border border-g-border-subtle",
            )}
          >
            {i < idx ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span
            className={cn(
              "uppercase tracking-[0.14em]",
              i <= idx ? "text-g-text" : "text-g-text-faint",
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="w-6 h-px bg-g-border-subtle mx-1" />
          )}
        </li>
      ))}
    </ol>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="g-surface-2 rounded-md p-2.5 border border-g-border-subtle">
      <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
        {label}
      </div>
      <div className="mt-0.5 font-geist-mono text-[14px] text-g-text">{value}</div>
    </div>
  );
}
