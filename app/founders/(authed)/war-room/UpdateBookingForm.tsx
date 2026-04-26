"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateBooking } from "./actions";

export type BookingFormDefaults = {
  id: string;
  status: string | null;
  assignedTo: string | null;
  notes: string | null;
  conversionValueCents: number | null;
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "new", label: "New" },
  { value: "scheduled", label: "Scheduled" },
  { value: "demoed", label: "Demoed" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "no_show", label: "No-show" },
];

const ASSIGNEE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Unassigned" },
  { value: "ricardo", label: "Ricardo" },
  { value: "joshua", label: "Joshua" },
];

type Variant = "row" | "panel";

type Props = {
  defaults: BookingFormDefaults;
  variant?: Variant;
};

export function StatusQuickUpdate({ defaults }: { defaults: BookingFormDefaults }) {
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(defaults.status ?? "new");

  function submit(next: string) {
    setValue(next);
    setError(null);
    const fd = new FormData();
    fd.set("id", defaults.id);
    fd.set("status", next);
    startTransition(async () => {
      const res = await updateBooking(fd);
      if ("error" in res) {
        setError(res.error);
      } else {
        setSavedAt(Date.now());
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => submit(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="rounded-md border border-bone/10 bg-pitch px-2 py-1 text-xs text-bone focus:border-champagne/30 focus:outline-none"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-pitch text-bone">
            {opt.label}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-bone/40" />}
      {savedAt && !pending && (
        <Check className="h-3.5 w-3.5 text-moss-bright" aria-label="saved" />
      )}
      {error && <span className="text-xs text-honey-bright">{error}</span>}
    </div>
  );
}

export function FullBookingForm({ defaults }: Props) {
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dollars =
    defaults.conversionValueCents != null
      ? Math.round(defaults.conversionValueCents / 100)
      : "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Conversion value in form is dollars; convert to cents before submitting.
    const dollarsRaw = String(fd.get("conversion_value_dollars") ?? "").trim();
    fd.delete("conversion_value_dollars");
    if (dollarsRaw !== "") {
      const n = Number(dollarsRaw);
      if (Number.isFinite(n) && n >= 0) {
        fd.set("conversion_value_cents", String(Math.round(n * 100)));
      }
    }
    startTransition(async () => {
      const res = await updateBooking(fd);
      if ("error" in res) {
        setError(res.error);
      } else {
        setSavedAt(Date.now());
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      onClick={(e) => e.stopPropagation()}
      className="grid gap-3 md:grid-cols-2"
    >
      <input type="hidden" name="id" value={defaults.id} />
      <label className="flex flex-col gap-1 text-xs uppercase tracking-tagline text-bone/40">
        Status
        <select
          name="status"
          defaultValue={defaults.status ?? "new"}
          className="rounded-md border border-bone/10 bg-pitch px-2 py-1.5 text-sm normal-case tracking-normal text-bone focus:border-champagne/30 focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-pitch text-bone">
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-tagline text-bone/40">
        Assigned to
        <select
          name="assigned_to"
          defaultValue={defaults.assignedTo ?? ""}
          className="rounded-md border border-bone/10 bg-pitch px-2 py-1.5 text-sm normal-case tracking-normal text-bone focus:border-champagne/30 focus:outline-none"
        >
          {ASSIGNEE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-pitch text-bone">
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-tagline text-bone/40">
        Pipeline $ (annual)
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          name="conversion_value_dollars"
          defaultValue={dollars}
          placeholder="auto from tier"
          className="rounded-md border border-bone/10 bg-pitch px-2 py-1.5 text-sm normal-case tracking-normal text-bone placeholder:text-bone/30 focus:border-champagne/30 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-tagline text-bone/40">
        Acting as
        <select
          name="actor"
          defaultValue="ricardo"
          className="rounded-md border border-bone/10 bg-pitch px-2 py-1.5 text-sm normal-case tracking-normal text-bone focus:border-champagne/30 focus:outline-none"
        >
          <option value="ricardo" className="bg-pitch text-bone">Ricardo</option>
          <option value="joshua" className="bg-pitch text-bone">Joshua</option>
        </select>
      </label>
      <label className="md:col-span-2 flex flex-col gap-1 text-xs uppercase tracking-tagline text-bone/40">
        Notes
        <textarea
          name="notes"
          defaultValue={defaults.notes ?? ""}
          rows={3}
          placeholder="Call recap, next step, blockers..."
          className="rounded-md border border-bone/10 bg-pitch px-2 py-1.5 text-sm normal-case tracking-normal text-bone placeholder:text-bone/30 focus:border-champagne/30 focus:outline-none"
        />
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md border border-champagne/30 bg-champagne-bright/10 px-4 py-1.5 text-xs uppercase tracking-tagline text-champagne-bright transition-colors hover:bg-champagne-bright/20 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Save changes
        </button>
        {savedAt && !pending && (
          <span className="text-xs text-moss-bright">Saved.</span>
        )}
        {error && <span className="text-xs text-honey-bright">{error}</span>}
      </div>
    </form>
  );
}
