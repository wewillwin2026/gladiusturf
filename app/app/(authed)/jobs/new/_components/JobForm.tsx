"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { createScheduleItem, type ScheduleItemType } from "../actions";

interface CustomerOption {
  id: string;
  display_name: string;
}

interface Props {
  customers: CustomerOption[];
}

const TYPE_OPTIONS: { value: ScheduleItemType; label: string }[] = [
  { value: "install", label: "Install" },
  { value: "service", label: "Service" },
  { value: "warranty", label: "Warranty" },
  { value: "plan_visit", label: "Plan visit" },
  { value: "quote_visit", label: "Quote visit" },
  { value: "storm_response", label: "Storm response" },
  { value: "holiday_install", label: "Holiday install" },
  { value: "other", label: "Other" },
];

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
];

const SELECT_CLASS =
  "mt-1.5 h-9 w-full rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text focus-visible:border-g-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-g-accent/30 disabled:opacity-50";

export function JobForm({ customers }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<ScheduleItemType>("service");
  const [customerId, setCustomerId] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [durationMin, setDurationMin] = React.useState(90);
  const [notes, setNotes] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!title.trim()) {
      toast.error("Job title is required.");
      return;
    }
    if (!date || !time) {
      toast.error("Pick a date and a start time.");
      return;
    }
    const start = new Date(`${date}T${time}`);
    if (Number.isNaN(start.getTime())) {
      toast.error("That start date/time isn't valid.");
      return;
    }
    const end = new Date(start.getTime() + durationMin * 60000);

    setBusy(true);
    try {
      const res = await createScheduleItem({
        title,
        type,
        customer_id: customerId || null,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        notes: notes || null,
      });
      if ("error" in res) {
        toast.error(
          res.error === "missing_title"
            ? "Job title is required."
            : res.error === "invalid_start"
              ? "That start date/time isn't valid."
              : "Could not schedule the job. Try again or email founders@gladiusturf.com.",
        );
        return;
      }
      toast.success(`Scheduled ${title}`);
      router.push("/app/jobs");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <div className="g-card p-5 flex flex-col gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Job title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Spring fertilization — front + back"
            autoFocus
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as ScheduleItemType)
              }
              className={SELECT_CLASS}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">— None —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="g-card p-5 flex flex-col gap-4">
        <h3 className="text-[14px] font-medium text-g-text">When</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Date *
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Start time *
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Duration
            </label>
            <select
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className={SELECT_CLASS}
            >
              {DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="g-card p-5">
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Notes (optional)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Gate code, crew instructions, what to bring."
          className="mt-1.5"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app/jobs")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={busy || !title.trim()}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Scheduling…
            </>
          ) : (
            <>
              <CalendarPlus className="h-3.5 w-3.5" />
              Schedule a job
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
