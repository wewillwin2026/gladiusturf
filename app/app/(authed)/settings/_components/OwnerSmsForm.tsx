"use client";

import * as React from "react";
import { Coffee, Send } from "lucide-react";
import { toast } from "sonner";
import { sendTestBriefingNow, updateOwnerSmsPrefs } from "../actions";

/**
 * Inline form on /app/settings to set the owner's phone number and
 * opt in to the daily one-liner SMS. Two coupled fields: enabling the
 * briefing without a phone is silently downgraded to disabled
 * server-side (cron would skip anyway).
 */
export function OwnerSmsForm({
  initialPhone,
  initialEnabled,
}: {
  initialPhone: string | null;
  initialEnabled: boolean;
}) {
  const [phone, setPhone] = React.useState(initialPhone ?? "");
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [pending, startTransition] = React.useTransition();
  const [testing, startTest] = React.useTransition();
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [lastPreview, setLastPreview] = React.useState<{
    mode: "sent" | "dry_run";
    body: string;
  } | null>(null);

  const dirty =
    (initialPhone ?? "") !== phone || initialEnabled !== enabled;
  // Phone must be saved (not just typed) before a test send is meaningful —
  // the test action reads from the DB, not the form state.
  const canTest = !dirty && (initialPhone ?? "").length > 0;

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const result = await updateOwnerSmsPrefs(fd);
          if ("ok" in result) {
            setSavedAt(Date.now());
            toast.success("Daily briefing preferences saved");
          } else if (result.error === "invalid_phone_format") {
            toast.error("Phone format invalid — try +19412051000");
          } else if (result.error === "column_not_ready") {
            toast.error(
              "Migration not applied yet — email founders@gladiusturf.com",
            );
          } else {
            toast.error("Save failed — try again");
          }
        })
      }
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <Coffee className="h-4 w-4 text-g-accent" />
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Owner&apos;s Daily One-Liner SMS
        </span>
      </div>
      <p className="text-[12px] text-g-text-muted leading-relaxed">
        7 AM ET each morning, a one-sentence briefing of your day plus
        your single highest-priority move. Same data the dashboard
        renders — pre-coffee. Default off; flip it on when you want it.
      </p>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] text-g-text-muted">
          Phone (E.164 — we&apos;ll normalize 10-digit US numbers)
        </span>
        <input
          name="owner_phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+19412051000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text placeholder:text-g-text-faint focus:border-g-accent focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2.5 text-[13px] text-g-text">
        <input
          type="checkbox"
          name="daily_briefing_sms_enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          disabled={phone.trim().length === 0}
          className="h-4 w-4 rounded border-g-border-subtle accent-g-accent disabled:opacity-50"
        />
        <span>
          Send me the daily briefing at 7 AM ET
          {phone.trim().length === 0 && (
            <span className="ml-2 text-[11px] text-g-text-faint italic">
              (set a phone first)
            </span>
          )}
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending || !dirty}
          className="rounded-md bg-g-accent px-4 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={!canTest || testing}
          onClick={() =>
            startTest(async () => {
              const result = await sendTestBriefingNow();
              if ("ok" in result) {
                setLastPreview({ mode: result.mode, body: result.body });
                if (result.mode === "sent") {
                  toast.success("Test SMS sent — check your phone");
                } else {
                  toast.message("Dry-run preview ready (TWILIO env not set)");
                }
              } else if (result.error === "no_phone_set") {
                toast.error("Save a phone number first");
              } else if (result.error === "no_briefing_pre_onboarding") {
                toast.error("Add at least one customer before testing");
              } else if (result.error === "column_not_ready") {
                toast.error(
                  "Migration not applied yet — email founders@gladiusturf.com",
                );
              } else if (result.error === "invalid_phone_format") {
                toast.error("Saved phone failed E.164 validation");
              } else {
                toast.error(`Test send failed: ${result.error}`);
              }
            })
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[12px] text-g-text-muted hover:border-g-accent hover:text-g-text disabled:cursor-not-allowed disabled:opacity-40"
          title={
            !canTest
              ? "Save a phone number first"
              : "Send a test briefing right now"
          }
        >
          <Send className="h-3 w-3" />
          {testing ? "Sending…" : "Send test now"}
        </button>
        {savedAt !== null && !dirty && (
          <span className="text-[11px] text-g-accent">Saved.</span>
        )}
      </div>

      {lastPreview && (
        <div className="mt-2 rounded-md border border-g-border-subtle bg-g-surface-2 p-3">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-g-text-faint">
            <span>
              {lastPreview.mode === "sent"
                ? "Sent · would be delivered now"
                : "Dry-run preview · TWILIO env not set"}
            </span>
            <button
              type="button"
              onClick={() => setLastPreview(null)}
              className="text-g-text-faint hover:text-g-text"
            >
              dismiss
            </button>
          </div>
          <pre className="mt-2 whitespace-pre-wrap font-geist-mono text-[12px] text-g-text leading-relaxed">
            {lastPreview.body}
          </pre>
        </div>
      )}
    </form>
  );
}
