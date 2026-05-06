"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { armStormMode } from "../actions";

/**
 * Activate Storm Mode — calls the server action that loops every customer
 * in the affected ZIPs through the SMS dispatcher. The dispatcher gates on
 * canSend() (consent + quiet hours + blocked weekday) and on Twilio
 * credentials: when env is missing it operates in dry-run mode and logs
 * each preview to audit_log without sending. The operator sees the mode
 * directly in the toast.
 */
export function StormActivateButton({
  inStormCount,
  guardianCount,
  dispatcherMode,
}: {
  inStormCount: number;
  guardianCount: number;
  dispatcherMode: "live" | "dry_run";
}) {
  const [busy, setBusy] = React.useState(false);

  async function handleActivate() {
    if (busy) return;
    if (inStormCount === 0) return;
    const verb = dispatcherMode === "live" ? "Send" : "Preview-send";
    const ok = window.confirm(
      `${verb} the Storm Mode check-in to ${inStormCount} customers (${guardianCount} priority Guardian)?\n\n` +
        (dispatcherMode === "live"
          ? "Live mode — real SMS will go out via Twilio. Customers without opted-in consent will be blocked."
          : "Dry-run mode — Twilio creds are not set, so this previews only and logs each message to the audit trail. No SMS will leave the platform."),
    );
    if (!ok) return;

    setBusy(true);
    try {
      const result = await armStormMode();
      if (!result.ok) {
        toast.error("Storm Mode failed to arm.", {
          description: result.error,
        });
        return;
      }
      const tone =
        result.mode === "live" ? "Storm Mode armed." : "Storm Mode previewed.";
      const description =
        result.mode === "live"
          ? `${result.sent} sent · ${result.blocked} blocked by consent · ${result.failed} failed.`
          : `${result.dryRun} previews logged · ${result.blocked} would have been blocked by consent · ${result.failed} failed lookups. Set TWILIO_ACCOUNT_SID + AUTH_TOKEN + FROM_NUMBER to send for real.`;
      if (result.mode === "live") {
        toast.success(tone, { description });
      } else {
        toast.info(tone, { description });
      }
    } catch (err) {
      toast.error("Storm Mode failed.", {
        description: err instanceof Error ? err.message : "Unknown error.",
      });
    } finally {
      setBusy(false);
    }
  }

  const label = dispatcherMode === "live" ? "Send now" : "Preview-send";

  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={handleActivate}
      disabled={busy || inStormCount === 0}
    >
      {busy ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Arming…
        </>
      ) : (
        <>
          <Send className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
