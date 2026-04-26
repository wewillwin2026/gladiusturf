"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  readFirstTouchUtm,
  trackDemoBooked,
  trackDemoFormStart,
  trackDemoSlotPicked,
  trackDemoTierSelected,
} from "@/lib/track";

type Status = "idle" | "submitting" | "success" | "error";
type Tier = "independent" | "professional" | "enterprise";

const CURRENT_SOFTWARE = [
  "Jobber",
  "LMN",
  "Service Autopilot",
  "Aspire",
  "Zentive",
  "Whiteboard / spreadsheet",
  "Other",
];

const CREW_SIZES = ["1 crew", "2–5 crews", "6–10 crews", "11–30 crews", "30+ crews"];

const TIERS: ReadonlyArray<{
  id: Tier;
  name: string;
  price: string;
  outcome: string;
}> = [
  {
    id: "independent",
    name: "Independent",
    price: "$397/crew/mo",
    outcome: "Quote Intercept + Upsell Whisperer for the owner-operator.",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$997/crew/mo",
    outcome: "All seven engines, Referral Radar, full migration support.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$2,997/crew/mo",
    outcome: "Multi-rooftop ops, dedicated founder line, custom routing.",
  },
];

const TIME_SLOTS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "10:00 AM ET", value: "10:00" },
  { label: "11:00 AM ET", value: "11:00" },
  { label: "2:00 PM ET", value: "14:00" },
  { label: "3:00 PM ET", value: "15:00" },
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type DateOption = {
  value: string; // YYYY-MM-DD
  weekday: string;
  day: string;
  month: string;
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function buildNextWeekdays(count: number): DateOption[] {
  const out: DateOption[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1); // start tomorrow
  while (out.length < count) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      const value = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(
        cursor.getDate()
      )}`;
      out.push({
        value,
        weekday: WEEKDAY_SHORT[dow],
        day: String(cursor.getDate()),
        month: MONTH_SHORT[cursor.getMonth()],
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function buildPreferredAt(date: string, time: string): string | null {
  if (!date || !time) return null;
  // ET is UTC-4 in DST (Mar–Nov), UTC-5 otherwise. We use the date itself
  // to decide which offset to apply (rough DST window — close enough for MVP).
  const [y, m, d] = date.split("-").map((s) => Number.parseInt(s, 10));
  if (!y || !m || !d) return null;
  // DST in US runs 2nd Sun of Mar through 1st Sun of Nov. Approximate: months 3–10 (Apr–Oct fully) -> -04:00.
  // Mar and Nov edge cases are close enough for MVP; defaulting Mar/Nov to -04:00.
  const inDst = m >= 3 && m <= 11;
  const offset = inDst ? "-04:00" : "-05:00";
  return `${date}T${time}:00${offset}`;
}

export function DemoForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Field state
  const [crewName, setCrewName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentSoftware, setCurrentSoftware] = useState("");
  const [crewSize, setCrewSize] = useState("");
  const [tier, setTier] = useState<Tier | null>(null);
  const [wantsBdc, setWantsBdc] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [altTimeNote, setAltTimeNote] = useState("");

  const startedRef = useRef(false);
  const slotFiredRef = useRef<string>("");

  const dateOptions = useMemo(() => buildNextWeekdays(14), []);

  function noteStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackDemoFormStart();
  }

  function selectTier(next: Tier) {
    noteStart();
    setTier(next);
    trackDemoTierSelected(next);
  }

  function selectDate(value: string) {
    noteStart();
    setPreferredDate(value);
    if (value && preferredTime) {
      const key = `${value}|${preferredTime}`;
      if (slotFiredRef.current !== key) {
        slotFiredRef.current = key;
        trackDemoSlotPicked(value, preferredTime);
      }
    }
  }

  function selectTime(value: string) {
    noteStart();
    setPreferredTime(value);
    if (preferredDate && value) {
      const key = `${preferredDate}|${value}`;
      if (slotFiredRef.current !== key) {
        slotFiredRef.current = key;
        trackDemoSlotPicked(preferredDate, value);
      }
    }
  }

  const isComplete =
    crewName.trim() !== "" &&
    ownerName.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    currentSoftware !== "" &&
    crewSize !== "" &&
    tier !== null &&
    preferredDate !== "" &&
    preferredTime !== "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isComplete || tier === null) return;
    setStatus("submitting");
    setError(null);

    const utm = readFirstTouchUtm();
    const preferredAt = buildPreferredAt(preferredDate, preferredTime);

    const body = {
      crewName,
      ownerName,
      email,
      phone,
      currentSoftware,
      crewSize,
      tier,
      wantsBdc,
      preferredDate,
      preferredTime,
      ...(preferredAt ? { preferredAt } : {}),
      ...(altTimeNote.trim() ? { altTimeNote: altTimeNote.trim() } : {}),
      ...utm,
      source_page:
        typeof window !== "undefined" ? window.location.pathname : "/demo",
    };

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Something went wrong");
      }
      trackDemoBooked(tier, wantsBdc, crewSize);
      setStatus("success");
      // Reset state
      setCrewName("");
      setOwnerName("");
      setEmail("");
      setPhone("");
      setCurrentSoftware("");
      setCrewSize("");
      setTier(null);
      setWantsBdc(false);
      setPreferredDate("");
      setPreferredTime("");
      setAltTimeNote("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-moss/40 bg-moss/[0.05] p-8">
        <h3 className="font-serif text-2xl font-semibold text-bone">
          Demo confirmed
        </h3>
        <p className="mt-4 text-[15px] leading-[1.6] text-bone/75">
          Joshua or Ricardo will email you a calendar invite within the hour.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={noteStart}
      className="flex flex-col gap-5 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
    >
      <Field label="Crew / shop name">
        <input
          name="crewName"
          required
          autoComplete="organization"
          value={crewName}
          onChange={(e) => setCrewName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Your name">
        <input
          name="ownerName"
          required
          autoComplete="name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Current software">
        <select
          name="currentSoftware"
          required
          className={inputCls}
          value={currentSoftware}
          onChange={(e) => setCurrentSoftware(e.target.value)}
        >
          <option value="" disabled>
            Pick one
          </option>
          {CURRENT_SOFTWARE.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Crew size">
        <select
          name="crewSize"
          required
          className={inputCls}
          value={crewSize}
          onChange={(e) => setCrewSize(e.target.value)}
        >
          <option value="" disabled>
            Pick one
          </option>
          {CREW_SIZES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>

      {/* Tier cards */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
          Pick a tier
        </span>
        <div
          role="radiogroup"
          aria-label="Tier"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {TIERS.map((t) => {
            const active = tier === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectTier(t.id)}
                className={cn(
                  "rounded-xl border p-5 text-left transition-colors cursor-pointer",
                  active
                    ? "border-champagne-bright bg-champagne/10"
                    : "border-bone/15 bg-bone/[0.02] hover:border-bone/30"
                )}
              >
                <p className="font-serif text-[18px] leading-tight text-bone">
                  {t.name}
                </p>
                <p
                  className={cn(
                    "mt-1 font-mono text-[12px]",
                    active ? "text-champagne-bright" : "text-bone/70"
                  )}
                >
                  {t.price}
                </p>
                <p className="mt-3 text-[13px] leading-[1.5] text-bone/60">
                  {t.outcome}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add-on */}
      <label className="flex items-start gap-3 rounded-xl border border-bone/10 bg-bone/[0.02] p-4 cursor-pointer">
        <input
          type="checkbox"
          name="wantsBdc"
          checked={wantsBdc}
          onChange={(e) => {
            noteStart();
            setWantsBdc(e.target.checked);
          }}
          className="mt-1 h-4 w-4 accent-moss-bright"
        />
        <span className="text-[14px] leading-[1.5] text-bone/80">
          <span className="font-semibold text-bone">Add GladiusBDC</span>{" "}
          <span className="text-bone/60">— 24/7 AI phone team — +$499/mo</span>
        </span>
      </label>

      {/* Date strip */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
          Preferred date (next 14 weekdays)
        </span>
        <div
          role="radiogroup"
          aria-label="Preferred date"
          className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-7 sm:gap-2 sm:overflow-x-visible"
        >
          {dateOptions.map((d) => {
            const active = preferredDate === d.value;
            return (
              <button
                key={d.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectDate(d.value)}
                className={cn(
                  "flex h-[64px] min-w-[56px] shrink-0 flex-col items-center justify-center rounded-lg border px-2 transition-colors",
                  active
                    ? "border-champagne-bright bg-champagne/10"
                    : "border-bone/10 bg-bone/[0.04] hover:border-champagne/30"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.12em]",
                    active ? "text-champagne-bright" : "text-bone/55"
                  )}
                >
                  {d.weekday}
                </span>
                <span
                  className={cn(
                    "font-serif text-[18px] leading-none",
                    active ? "text-bone" : "text-bone/85"
                  )}
                >
                  {d.day}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.1em]",
                    active ? "text-champagne-bright" : "text-bone/45"
                  )}
                >
                  {d.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time chips */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
          Preferred time
        </span>
        <div
          role="radiogroup"
          aria-label="Preferred time"
          className="flex flex-wrap gap-2"
        >
          {TIME_SLOTS.map((slot) => {
            const active = preferredTime === slot.value;
            return (
              <button
                key={slot.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectTime(slot.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "border-moss-bright bg-moss/15 text-bone"
                    : "border-bone/15 bg-bone/[0.04] text-bone/75 hover:border-moss/40"
                )}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="If those don't work, what does? (optional)">
        <input
          name="altTimeNote"
          type="text"
          value={altTimeNote}
          onChange={(e) => setAltTimeNote(e.target.value)}
          placeholder="e.g. Tuesday after 4pm CT, or weekend mornings"
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting" || !isComplete}
        className={cn(
          "group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover",
          status === "submitting" && "cursor-wait opacity-70",
          !isComplete && status !== "submitting" && "cursor-not-allowed opacity-50"
        )}
      >
        {status === "submitting" ? "Sending..." : "Confirm my demo"}
        {status !== "submitting" && (
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </button>

      {error && (
        <p className="text-[13px] text-bone/80">
          {error}. Try again, or email{" "}
          <a
            href="mailto:founders@gladiusturf.com"
            className="text-moss-bright underline underline-offset-2"
          >
            founders@gladiusturf.com
          </a>
          .
        </p>
      )}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-md border border-bone/10 bg-bone/[0.04] px-3 text-[15px] text-bone placeholder:text-bone/40 focus:border-moss/60 focus:outline-none focus:ring-2 focus:ring-moss/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
        {label}
      </span>
      {children}
    </label>
  );
}
