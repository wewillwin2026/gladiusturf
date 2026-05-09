"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import { Button } from "@/components/app/ui/Button";
import { Textarea } from "@/components/app/ui/Input";
import { sendReviewAsk } from "./actions";

/**
 * Manual review-ask SMS launcher for the customer detail page.
 *
 * Today (Bright Lights pilot Day-1) the operator triggers the ask per
 * customer from this dialog. The Auto-ask cadence on /app/reviews handles
 * the post-visit "3 day later" flavour — this is the on-demand companion.
 *
 * Pattern intentionally mirrors LogVisitButton.tsx so the right-rail
 * actions feel consistent. Bilingual: the dialog pre-fills EN or ES copy
 * based on customer.preferred_language. Operator can edit before sending.
 *
 * The actual {first_name} / {review_url} substitution happens server-side
 * in sendReviewAsk() so the operator can leave or edit those tokens
 * without needing to know the customer's tenant review URL on the client.
 */

const TEMPLATE_EN =
  "Hi {first_name} — thank you for trusting {tenant_display_name} with your landscape lighting. If we earned your 5 stars, would you mind sharing on Google? {review_url}";
const TEMPLATE_ES =
  "Hola {first_name} — gracias por confiar en {tenant_display_name} para tu iluminación. Si nos ganamos tus 5 estrellas, ¿nos compartirías una reseña en Google? {review_url}";

function defaultBody(language: string, tenantDisplayName: string): string {
  const tpl = language === "es" ? TEMPLATE_ES : TEMPLATE_EN;
  // Pre-substitute the tenant display name so the operator can read the
  // copy without mental token-replacement. {first_name} + {review_url}
  // stay so the operator sees they'll be filled in at send-time.
  return tpl.replaceAll("{tenant_display_name}", tenantDisplayName);
}

export function SendReviewAskButton({
  customerId,
  customerName,
  preferredLanguage,
  tenantDisplayName,
}: {
  customerId: string;
  customerName: string;
  preferredLanguage: string;
  tenantDisplayName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [body, setBody] = React.useState(() =>
    defaultBody(preferredLanguage, tenantDisplayName),
  );

  React.useEffect(() => {
    if (!open) {
      setBody(defaultBody(preferredLanguage, tenantDisplayName));
      setBusy(false);
    }
  }, [open, preferredLanguage, tenantDisplayName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!body.trim()) {
      toast.error("Add a message body before sending.");
      return;
    }
    setBusy(true);
    try {
      const res = await sendReviewAsk({ customerId, body });
      if ("error" in res) {
        const map: Record<string, string> = {
          unauthenticated: "Session expired — sign in again.",
          missing_field: "Message body is required.",
          not_found_in_tenant: "Customer not in your workspace.",
          body_too_short: "Message must be at least 20 characters after fill-in.",
          body_too_long: "Message exceeds 1600 characters after fill-in.",
        };
        toast.error(map[res.error] ?? `Could not send (${res.error}).`);
        return;
      }
      if (res.mode === "dry_run") {
        toast.success(`Preview logged for ${customerName}`, {
          description:
            "Twilio creds not set — message captured to audit_log only.",
        });
      } else {
        toast.success(`Review-ask sent to ${customerName}`, {
          description: "We'll log the response on this customer's timeline.",
        });
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.warn("sendReviewAsk threw", err);
      toast.error("Could not send the review-ask. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const langLabel = preferredLanguage === "es" ? "ES" : "EN";

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={() => setOpen(true)}
      >
        <Star className="h-3.5 w-3.5" />
        Ask for review
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader
            title={`Ask for a review · ${customerName}`}
            description="Send a one-tap review-ask SMS. Consent + quiet hours are enforced. Edit the body to taste before hitting Send."
          />

          <div className="mb-3 flex items-center gap-2 text-[12px] text-g-text-muted">
            <span className="rounded-md bg-g-surface-2 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-g-text">
              {langLabel}
            </span>
            <span>{customerName}&apos;s preferred language</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Message body
              </label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="mt-1.5"
                autoFocus
              />
              <p className="mt-1 text-[11px] text-g-text-faint">
                <code>{"{first_name}"}</code> and{" "}
                <code>{"{review_url}"}</code> are filled in at send time. Body
                must be 20–1600 characters after substitution.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={busy || !body.trim()}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Star className="h-3.5 w-3.5" />
                    Send review-ask
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
