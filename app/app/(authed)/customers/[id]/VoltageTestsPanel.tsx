"use client";

import * as React from "react";
import { CircleAlert, CircleCheck, Loader2, Zap } from "lucide-react";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { logVoltageTest } from "./_actions/voltage-tests";

export type VoltageTestRow = {
  id: string;
  fixture_id: string | null;
  measured_volts: number;
  source_tap_volts: number | null;
  tap_label: string | null;
  result: "pass" | "low" | "high" | "open" | "short";
  notes: string | null;
  measured_at: string;
};

export type FixtureOption = { id: string; label: string };
export type TransformerOption = { id: string; label: string };

const RESULT_TONE: Record<VoltageTestRow["result"], Tone> = {
  pass: "success",
  low: "warning",
  high: "warning",
  open: "danger",
  short: "danger",
};

const RESULT_LABEL: Record<VoltageTestRow["result"], string> = {
  pass: "Pass",
  low: "Low",
  high: "High",
  open: "Open",
  short: "Short",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function VoltageTestsPanel({
  customerId,
  fixtures,
  transformers,
  tests,
}: {
  customerId: string;
  fixtures: FixtureOption[];
  transformers: TransformerOption[];
  tests: VoltageTestRow[];
}) {
  const [open, setOpen] = React.useState(tests.length === 0);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await logVoltageTest(formData);
      if ("error" in res) {
        setError(res.error);
      } else {
        setOk(true);
        formRef.current?.reset();
      }
    });
  }

  const passCount = tests.filter((t) => t.result === "pass").length;
  const failCount = tests.length - passCount;

  return (
    <section className="g-card">
      <header className="flex items-start justify-between gap-3 border-b border-g-border-subtle px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-g-accent" />
            <h2 className="text-[13px] text-g-text">Voltage tests</h2>
          </div>
          <p className="text-[11px] text-g-text-muted">
            {tests.length} reading{tests.length === 1 ? "" : "s"} on file ·{" "}
            {passCount} pass · {failCount} flagged. Low-voltage outdoor target
            10.8–13.2 V at the fixture.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-g-border bg-g-surface-2 px-3 py-1.5 text-[11px] font-medium text-g-text transition-colors hover:bg-g-surface-3"
        >
          {open ? "Hide form" : "Log a reading"}
        </button>
      </header>

      {open && (
        <form
          ref={formRef}
          action={onSubmit}
          className="grid gap-3 border-b border-g-border-subtle px-5 py-4 md:grid-cols-3"
        >
          <input type="hidden" name="customerId" value={customerId} />
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Measured volts (at fixture)
            </span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="40"
              name="measuredVolts"
              required
              placeholder="11.8"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Source tap volts (optional)
            </span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="40"
              name="sourceTapVolts"
              placeholder="13.5"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Tap label
            </span>
            <select
              name="tapLabel"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
              defaultValue=""
            >
              <option value="">—</option>
              <option value="12V">12V</option>
              <option value="13V">13V</option>
              <option value="14V">14V</option>
              <option value="15V">15V</option>
              <option value="22V">22V (Common)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Fixture (optional)
            </span>
            <select
              name="fixtureId"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
              defaultValue=""
            >
              <option value="">— (run / transformer reading)</option>
              {fixtures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Transformer (optional)
            </span>
            <select
              name="transformerId"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
              defaultValue=""
            >
              <option value="">—</option>
              {transformers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Notes
            </span>
            <input
              type="text"
              name="notes"
              placeholder="e.g. run #3, walkway path"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <div className="flex items-center gap-3 md:col-span-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-g-accent px-4 py-2 text-[12px] font-semibold text-g-bg transition-colors hover:bg-g-accent-bright disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              {pending ? "Logging..." : "Log reading"}
            </button>
            {ok && (
              <span className="inline-flex items-center gap-1 text-[12px] text-g-success">
                <CircleCheck className="h-3.5 w-3.5" />
                Logged. Reload to see it below.
              </span>
            )}
            {error && (
              <span className="inline-flex items-center gap-1 text-[12px] text-g-danger">
                <CircleAlert className="h-3.5 w-3.5" />
                Couldn&rsquo;t log ({error}). Try again.
              </span>
            )}
          </div>
        </form>
      )}

      {tests.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-[13px] text-g-text-muted">
            No voltage readings yet. Pull a multimeter, hit{" "}
            <strong className="text-g-text">Log a reading</strong>, build a
            paper trail across the property.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-g-border-subtle">
          {tests.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[100px_minmax(0,1fr)_auto_auto] md:items-center md:gap-4"
            >
              <span className="font-mono text-[14px] tabular-nums text-g-text">
                {t.measured_volts.toFixed(1)} V
              </span>
              <div className="min-w-0 text-[12px] text-g-text-muted">
                {t.tap_label && `${t.tap_label} tap · `}
                {t.source_tap_volts != null &&
                  `source ${t.source_tap_volts.toFixed(1)} V · `}
                {t.notes || "—"}
              </div>
              <span className="text-[11px] text-g-text-faint">
                {fmtDate(t.measured_at)}
              </span>
              <StatusPill tone={RESULT_TONE[t.result]}>
                {RESULT_LABEL[t.result]}
              </StatusPill>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
