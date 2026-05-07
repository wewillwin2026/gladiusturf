import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Clock,
  MapPin,
  PenSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { money } from "@/lib/shared/format";
import { AcceptButton } from "./_components/AcceptButton";
import { AskQuestionForm } from "./_components/AskQuestionForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quote · GladiusTurf",
  description: "Review the quote prepared for you and accept or ask a question.",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent for review",
  viewed: "Viewed",
  walked: "Walked",
  sold: "Accepted",
  installed: "Installed",
  lost: "Closed",
};

/**
 * Public customer-facing quote page. The tenant drafts a quote at
 * /app/quotes/draft, gets a /quote/[id] link, sends it to the customer
 * via SMS/email manually (v1) or via Resend behind canSend() (v2).
 *
 * Design constraint: the URL is the gate. UUIDs are unguessable; once
 * a tenant has the link they can hand it to the customer. No login on
 * the customer side — magic-link pattern by happenstance.
 *
 * Privacy: we render the customer's display_name (the tenant uploaded
 * it; the recipient already knows their own name) + the line items +
 * total. We do NOT render: tenant's notes ("watch the dog"), tenant's
 * profitmargin, tenant's internal status flags, or anything from the
 * customer's profile we wouldn't show them in person. Draft-status
 * proposals 404 — only sent/viewed/sold/installed are shareable.
 */
export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("proposals")
    .select(
      `id, status, total_cents, language, bom, created_at, sent_at, viewed_at, sold_at,
       customers!inner(display_name, primary_email, primary_phone, service_address),
       tenants!inner(display_name, brand_primary_hex, brand_accent_hex)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  type Customer = {
    display_name: string;
    primary_email: string | null;
    primary_phone: string | null;
    service_address: { street?: string; city?: string; zip?: string } | null;
  };
  type Tenant = {
    display_name: string;
    brand_primary_hex: string | null;
    brand_accent_hex: string | null;
  };
  type LineItem = {
    description: string;
    qty: number;
    unit_price_cents: number;
  };
  const row = data as unknown as {
    id: string;
    status: string;
    total_cents: number | null;
    language: string;
    bom: {
      title?: string;
      notes?: string | null;
      items?: LineItem[];
    } | null;
    created_at: string;
    sent_at: string | null;
    viewed_at: string | null;
    sold_at: string | null;
    customers: Customer | Customer[];
    tenants: Tenant | Tenant[];
  };

  // Drafts are not shareable. Only sent/viewed/walked/sold/installed.
  if (row.status === "draft" || row.status === "lost") {
    notFound();
  }

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
  const tenant = Array.isArray(row.tenants) ? row.tenants[0] : row.tenants;

  // Track first-view: flip sent -> viewed + stamp viewed_at + audit.
  // Skip when already viewed (or beyond), and when the request looks
  // like a bot preview (no User-Agent, link-unfurl bots). Best-effort —
  // a failure here must never block the customer from seeing the quote.
  if (row.status === "sent") {
    try {
      const hdrs = await headers();
      const ua = (hdrs.get("user-agent") ?? "").toLowerCase();
      const looksLikeBot =
        ua === "" ||
        ua.includes("bot") ||
        ua.includes("crawler") ||
        ua.includes("spider") ||
        ua.includes("preview") ||
        ua.includes("slack") ||
        ua.includes("discord") ||
        ua.includes("twitter") ||
        ua.includes("facebookexternalhit");
      if (!looksLikeBot) {
        // Need tenant_id for the audit row — re-fetch minimally.
        const { data: meta } = await sb
          .from("proposals")
          .select("tenant_id, customer_id")
          .eq("id", row.id)
          .maybeSingle();
        const nowIso = new Date().toISOString();
        await sb
          .from("proposals")
          .update({ status: "viewed", viewed_at: nowIso })
          .eq("id", row.id)
          .eq("status", "sent");
        if (meta?.tenant_id) {
          await sb.from("audit_log").insert({
            tenant_id: meta.tenant_id,
            user_id: null,
            action: "quote.viewed",
            entity_type: "proposal",
            entity_id: row.id,
            metadata: {
              customer_id: meta.customer_id,
              user_agent: ua.slice(0, 200),
              source: "public_link",
            },
          });
        }
      }
    } catch (err) {
      console.warn("quote.viewed tracking failed", err);
    }
  }
  const title = row.bom?.title ?? "Quote";
  const accent = tenant.brand_accent_hex || "#00d26a";

  const created = new Date(row.created_at).toLocaleDateString("en-US", {
    dateStyle: "long",
  });
  const addr = customer.service_address ?? {};
  const fullAddr = [addr.street, addr.city, addr.zip].filter(Boolean).join(", ");

  const lang = row.language === "es" ? "es" : "en";
  const t = (en: string, es: string) => (lang === "es" ? es : en);

  return (
    <div className="min-h-screen bg-pitch text-bone">
      <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <div
          className="text-xs font-semibold uppercase tracking-crest"
          style={{ color: accent }}
        >
          {tenant.display_name}
        </div>

        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.01em] text-bone md:text-5xl">
          {t("Your quote.", "Su presupuesto.")}
        </h1>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-bone/15 bg-bone/[0.03] px-4 py-1.5 text-xs uppercase tracking-crest text-bone/60">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: accent }}
          />
          {STATUS_LABEL[row.status] ?? row.status}
        </div>

        <section className="mt-10 rounded-2xl border border-bone/15 bg-bone/[0.02] p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-crest text-bone/45">
            <PenSquare className="h-3.5 w-3.5" />
            {t("Scope", "Alcance")}
          </div>
          <h2 className="mt-2 font-serif text-2xl text-bone leading-snug">{title}</h2>
          {row.bom?.notes && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-bone/70">
              {row.bom.notes}
            </p>
          )}
        </section>

        {row.bom?.items && row.bom.items.length > 0 && (
          <section className="mt-4 rounded-2xl border border-bone/15 bg-bone/[0.02] p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-crest text-bone/45">
              <PenSquare className="h-3.5 w-3.5" />
              {t("Line items", "Detalle")}
            </div>
            <ul className="mt-3 divide-y divide-bone/10">
              {row.bom.items.map((it, i) => {
                const subtotal = Math.round(it.qty * it.unit_price_cents);
                return (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_64px_92px_104px] gap-2 py-2 text-sm text-bone/80 items-baseline"
                  >
                    <span className="truncate">{it.description}</span>
                    <span className="text-right font-mono text-xs text-bone/60">
                      {it.qty}
                    </span>
                    <span className="text-right font-mono text-xs text-bone/60">
                      {money(it.unit_price_cents)}
                    </span>
                    <span className="text-right font-mono text-bone">
                      {money(subtotal)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mt-4 rounded-2xl border border-bone/15 bg-bone/[0.02] p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-crest text-bone/45">
            <Clock className="h-3.5 w-3.5" />
            {t("Total", "Total")}
          </div>
          <div className="mt-2 font-serif text-5xl font-semibold text-bone">
            {row.total_cents != null ? money(row.total_cents) : "—"}
          </div>
          <p className="mt-2 text-[12px] text-bone/50">
            {t("Prepared", "Preparado")} {created} · {t("for", "para")}{" "}
            <strong className="text-bone/80">{customer.display_name}</strong>
          </p>
        </section>

        {fullAddr && (
          <section className="mt-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-crest text-bone/45">
              <MapPin className="h-3.5 w-3.5" />
              {t("Property", "Propiedad")}
            </div>
            <p className="mt-2 text-sm text-bone/80">{fullAddr}</p>
          </section>
        )}

        {row.status !== "sold" && row.status !== "installed" && (
          <section className="mt-10 rounded-2xl border border-bone/10 bg-bone/[0.02] p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-crest text-bone/45">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("When you accept", "Cuando acepta")}
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-bone/70">
              <li>
                {t(
                  "Your contractor receives an alert with the dollar amount and your name.",
                  "Su contratista recibe una alerta con el monto y su nombre.",
                )}
              </li>
              <li>
                {t(
                  "A tentative install window is reserved on their calendar — they'll confirm the date with you within 24 hours.",
                  "Se reserva una ventana tentativa de instalación en su calendario — confirmarán la fecha en 24 horas.",
                )}
              </li>
              <li>
                {t(
                  "Your acceptance is recorded on a verifiable audit chain. ",
                  "Su aceptación queda registrada en una cadena auditable verificable. ",
                )}
                <Link
                  href="/transparency"
                  prefetch
                  style={{ color: accent }}
                  className="underline-offset-4 hover:underline"
                >
                  {t("Learn more", "Más información")}
                </Link>
              </li>
            </ul>
          </section>
        )}

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <AcceptButton
            proposalId={row.id}
            accent={accent}
            labelEn="Accept this quote"
            labelEs="Aceptar"
            language={lang}
            alreadyAccepted={
              row.status === "sold" || row.status === "installed"
            }
          />
          <AskQuestionForm proposalId={row.id} language={lang} />
        </section>

        <section className="mt-12 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: accent }} />
            <span className="text-xs font-semibold uppercase tracking-crest text-bone/45">
              {t("Verifiable", "Verificable")}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-bone/70">
            {t(
              "This quote was prepared with help from GladiusTurf. Want to know more about how it works, who's involved, and what data was used? Visit",
              "Este presupuesto fue preparado con ayuda de GladiusTurf. Para más información sobre cómo funciona, quiénes participan y qué datos se usaron, visite",
            )}{" "}
            <Link
              href="/transparency"
              prefetch
              style={{ color: accent }}
              className="underline-offset-4 hover:underline"
            >
              gladiusturf.com/transparency
            </Link>
            .
          </p>
          {customer.primary_phone && (
            <p className="mt-3 text-xs text-bone/45">
              {t("Talk to", "Hablar con")} {tenant.display_name}:{" "}
              <a
                href={`tel:${customer.primary_phone}`}
                className="hover:text-bone"
              >
                <Phone className="h-3 w-3 inline-block mr-1" />
                {customer.primary_phone}
              </a>
            </p>
          )}
        </section>

        <p className="mt-12 text-[11px] text-bone/30 font-mono break-all text-center">
          quote-id: {row.id}
        </p>
      </main>
    </div>
  );
}
