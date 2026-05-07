"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { acceptQuote } from "../actions";

/**
 * Customer-side accept button. Calls the server action, swaps to a
 * confirmation state on success. Stays graceful on error: surfaces a
 * friendly retry message instead of leaving the customer staring at a
 * spinner. Email-reply remains the fallback path (the parent page
 * still renders the mailto: link).
 */
export function AcceptButton({
  proposalId,
  accent,
  labelEn,
  labelEs,
  language,
  alreadyAccepted,
}: {
  proposalId: string;
  accent: string;
  labelEn: string;
  labelEs: string;
  language: "en" | "es";
  alreadyAccepted: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(alreadyAccepted);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    if (busy || done) return;
    setBusy(true);
    setError(null);
    try {
      const res = await acceptQuote(proposalId);
      if ("error" in res) {
        if (res.error === "rate_limited") {
          setError(
            language === "es"
              ? "Demasiados intentos — por favor espere un minuto y vuelva a intentar."
              : "Too many attempts — please wait a minute and try again.",
          );
        } else {
          setError(
            language === "es"
              ? "No pudimos confirmar la aceptación. Por favor, responda este correo."
              : "We couldn't confirm acceptance. Please reply to the email instead.",
          );
        }
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-2">
        <div
          className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold"
          style={{
            background: accent,
            color: "#0a0a0a",
          }}
        >
          <CheckCircle2 className="h-4 w-4" />
          {language === "es" ? "Aceptado · gracias" : "Accepted · thank you"}
        </div>
        <p className="text-xs leading-relaxed text-bone/60">
          {language === "es"
            ? "Su contratista fue notificado y reservó una ventana tentativa en su calendario. Le contactarán en 24 horas para confirmar la fecha de instalación."
            : "Your contractor has been alerted and reserved a tentative window in their calendar. They'll reach out within 24 hours to confirm the install date."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition-all disabled:opacity-70"
        style={{
          background: accent,
          color: "#0a0a0a",
        }}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {language === "es" ? "Confirmando…" : "Confirming…"}
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            {language === "es" ? labelEs : labelEn}
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-300 leading-snug">{error}</p>
      )}
    </div>
  );
}
