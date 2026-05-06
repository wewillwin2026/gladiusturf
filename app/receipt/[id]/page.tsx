import { notFound } from "next/navigation";
import Link from "next/link";
import { Bot, Clock, Hash, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Receipt · GladiusTurf",
  description:
    "Verify what the AI knew when it drafted a message — model, prompt fingerprint, timestamp.",
  robots: { index: false, follow: false },
};

const SURFACE_LABELS: Record<string, string> = {
  "ask-gladius": "Ask Gladius",
  "quote-drafter": "AI Quote Drafter",
};

/**
 * Public AI transparency receipt — Trust Director's #3 board mandate
 * (2026-05-08): every AI-drafted customer-facing message gets a public
 * URL where the recipient can verify the model, prompt fingerprint,
 * timestamp, and output excerpt that produced it. ServiceTitan / Jobber
 * / Housecall don't ship this because their AI features can't cite a
 * source; we can because every Ask Gladius and Quote Drafter call
 * writes an `ai_run` row from day one.
 *
 * Discoverability: receipt URLs are not enumerable (UUIDs). The link is
 * generated on demand by the AI surface (Quote Drafter footer, future
 * Concierge SMS) and shipped to the customer. Anyone WITH the URL can
 * see the metadata; anyone WITHOUT it cannot.
 */
export default async function AiReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const sb = supabaseAdmin();
  // Public-facing fields only. We never expose the system prompt body or
  // the full output — only the surface, model, version, timestamp,
  // prompt hash (a fingerprint, not the prompt), and a short output
  // excerpt. RLS isn't the gate here (this is anonymous read); the gate
  // is unguessable URLs + restricted column projection.
  const { data, error } = await sb
    .from("ai_run")
    .select(
      "id, surface, model, prompt_hash, prompt_version, output_excerpt, output_tokens, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) notFound();

  const run = data as {
    id: string;
    surface: string;
    model: string;
    prompt_hash: string;
    prompt_version: string | null;
    output_excerpt: string | null;
    output_tokens: number | null;
    created_at: string;
  };
  const surfaceLabel = SURFACE_LABELS[run.surface] ?? run.surface;
  const when = new Date(run.created_at);
  const whenStr = `${when.toLocaleDateString("en-US", { dateStyle: "long" })} at ${when.toLocaleTimeString("en-US", { timeStyle: "short" })}`;

  // Truncate output excerpt to first 600 chars for receipt display —
  // never show the full body if longer.
  const excerpt = run.output_excerpt ?? null;
  const trimmed = excerpt && excerpt.length > 600 ? excerpt.slice(0, 600) + "…" : excerpt;

  return (
    <div className="min-h-screen bg-pitch text-bone">
      <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <Link
          href="/"
          prefetch
          className="inline-flex items-center gap-2 text-xs uppercase tracking-crest text-bone/50 hover:text-bone"
        >
          <Sparkles className="h-3 w-3 text-champagne-bright" />
          GladiusTurf
        </Link>

        <h1 className="mt-8 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
          AI Receipt
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-bone/65">
          Someone using GladiusTurf used AI to help draft a message you
          received. Here&apos;s what the AI knew, and what it produced.
          Every AI call we run writes a record like this — verifiable by
          anyone with the link.
        </p>

        <section className="mt-10 rounded-2xl border border-bone/15 bg-bone/[0.02] p-6">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-champagne-bright" />
            <span className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
              Surface
            </span>
          </div>
          <div className="mt-1.5 text-2xl font-medium text-bone">
            {surfaceLabel}
          </div>
          {run.prompt_version && (
            <div className="mt-1 text-xs text-bone/50 font-mono">
              Prompt version: {run.prompt_version}
            </div>
          )}
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-bone/10 bg-bone/[0.02] p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-bone/50" />
              <span className="text-[11px] font-semibold uppercase tracking-crest text-bone/45">
                When
              </span>
            </div>
            <div className="mt-1.5 text-sm text-bone">{whenStr}</div>
          </div>
          <div className="rounded-xl border border-bone/10 bg-bone/[0.02] p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-bone/50" />
              <span className="text-[11px] font-semibold uppercase tracking-crest text-bone/45">
                Model
              </span>
            </div>
            <div className="mt-1.5 text-sm text-bone font-mono">
              {run.model}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-bone/10 bg-bone/[0.02] p-4">
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-bone/50" />
            <span className="text-[11px] font-semibold uppercase tracking-crest text-bone/45">
              Prompt fingerprint (sha256, first 32)
            </span>
          </div>
          <div className="mt-2 break-all text-xs text-bone font-mono">
            {run.prompt_hash || "—"}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-bone/50">
            A fingerprint of the system prompt the AI received, not the
            prompt itself. Two messages with the same fingerprint were
            generated under identical instructions. We rotate prompts
            often and you can confirm with us that any specific
            fingerprint corresponds to a known prompt version.
          </p>
        </section>

        {trimmed && (
          <section className="mt-4 rounded-xl border border-bone/10 bg-bone/[0.02] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-moss-bright" />
              <span className="text-[11px] font-semibold uppercase tracking-crest text-bone/45">
                What the AI produced (excerpt)
              </span>
            </div>
            <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-bone/85 font-sans">
{trimmed}
            </pre>
            <p className="mt-3 text-[11px] leading-relaxed text-bone/50">
              First 600 characters of the AI&apos;s output, stored when the
              call ran. {run.output_tokens != null
                ? `Total output: ${run.output_tokens} tokens.`
                : ""}
            </p>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-champagne/25 bg-champagne/[0.04] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-crest text-champagne-bright">
            Why this exists
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-bone/70">
            Most field-services software ships AI features without showing
            you what the AI knew when it spoke. We built ours so every
            call is auditable — by the operator who runs the business,
            and by you, the recipient. If something here looks wrong, or
            if you&apos;d like the human behind the message to follow up
            in writing, email{" "}
            <a
              href="mailto:legal@gladiusturf.com"
              className="text-champagne-bright underline-offset-4 hover:underline"
            >
              legal@gladiusturf.com
            </a>
            .
          </p>
          <p className="mt-3 text-xs text-bone/45">
            See <Link href="/legal/dpa" prefetch className="text-champagne-bright/85 underline-offset-4 hover:underline">our Data Processing Agreement</Link>{" "}
            for the full sub-processor list and our{" "}
            <Link href="/legal/privacy" prefetch className="text-champagne-bright/85 underline-offset-4 hover:underline">privacy policy</Link>{" "}
            for what we collect and how long we keep it.
          </p>
        </section>

        <p className="mt-8 text-[11px] text-bone/35 font-mono break-all">
          Receipt id: {run.id}
        </p>
      </main>
    </div>
  );
}
