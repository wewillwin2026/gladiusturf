"use client";

import * as React from "react";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { askQuestionAboutQuote } from "../actions";

/**
 * Customer-side question form. Replaces the mailto: fallback with a
 * proper textarea + submission. Tenant gets a Resend email with the
 * customer's message + reply-to address so they can answer in their
 * inbox the way they normally would.
 */
export function AskQuestionForm({
  proposalId,
  language,
}: {
  proposalId: string;
  language: "en" | "es";
}) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const t = (en: string, es: string) => (language === "es" ? es : en);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || done) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setError(
        t(
          "Please write a question before sending.",
          "Por favor escriba una pregunta antes de enviar.",
        ),
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await askQuestionAboutQuote(proposalId, trimmed);
      if ("error" in res) {
        if (res.error === "rate_limited") {
          setError(
            t(
              "Too many messages — please wait a minute and try again.",
              "Demasiados mensajes — por favor espere un minuto y vuelva a intentar.",
            ),
          );
        } else if (res.error === "too_many_questions") {
          setError(
            t(
              "This quote has too many questions on it already. Please reply directly to the contractor's email.",
              "Esta cotización ya tiene demasiadas preguntas. Por favor responda al correo del contratista directamente.",
            ),
          );
        } else {
          setError(
            t(
              "We couldn't deliver your question. Please try again.",
              "No pudimos entregar su pregunta. Intente de nuevo.",
            ),
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
      <div className="group inline-flex items-center justify-center gap-2 rounded-xl border border-bone/20 bg-bone/[0.06] px-6 py-4 text-base font-medium text-bone">
        <Mail className="h-4 w-4" />
        {t("Sent · we'll reply soon", "Enviado · responderemos pronto")}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center justify-center gap-2 rounded-xl border border-bone/20 bg-bone/[0.02] px-6 py-4 text-base font-medium text-bone transition-colors hover:bg-bone/[0.06]"
      >
        <MessageSquare className="h-4 w-4" />
        {t("Ask a question", "Preguntar")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t(
          "Type your question here…",
          "Escriba su pregunta aquí…",
        )}
        rows={4}
        autoFocus
        maxLength={2000}
        disabled={busy}
        className="rounded-xl border border-bone/20 bg-bone/[0.04] px-4 py-3 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-bone/40"
      />
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMessage("");
            setError(null);
          }}
          disabled={busy}
          className="text-xs text-bone/50 hover:text-bone/80"
        >
          {t("Cancel", "Cancelar")}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-bone/20 bg-bone/[0.06] px-5 py-3 text-sm font-medium text-bone transition-colors hover:bg-bone/[0.10] disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("Sending…", "Enviando…")}
            </>
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" />
              {t("Send question", "Enviar")}
            </>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-300 leading-snug">{error}</p>}
    </form>
  );
}
