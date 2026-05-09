import { cookies } from "next/headers";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/founders/vertical-leads/csv — export filtered vertical_leads as CSV.
 *
 * Query params (all optional, all combined with AND):
 *   vertical = pool|irrigation|...|all
 *   status   = new|contacted|converted|disqualified|all
 *   q        = case-insensitive substring against email + company + name
 *
 * Founders only — gladius_founder_session cookie required. CSV escapes
 * fields with `"` / `,` / newline per RFC 4180.
 */

const ALLOWED_VERTICALS = [
  "pool",
  "irrigation",
  "landscape",
  "lawn-care",
  "tree-care",
  "snow",
  "commercial",
  "lighting",
] as const;
const ALLOWED_STATUSES = [
  "new",
  "contacted",
  "converted",
  "disqualified",
] as const;

function csvEscape(raw: string | null | undefined): string {
  if (raw == null) return "";
  const s = String(raw);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const store = await cookies();
  const founder = verifyFounderSessionCookieValue(
    store.get(FOUNDER_COOKIE_NAME)?.value,
  );
  if (!founder) {
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const vertical = (url.searchParams.get("vertical") ?? "all").trim();
  const status = (url.searchParams.get("status") ?? "all").trim();
  const q = (url.searchParams.get("q") ?? "").trim();

  const sb = supabaseAdmin();
  let query = sb
    .from("vertical_leads")
    .select(
      "id, vertical, name, email, phone, company, service_area, years_in_business, crews, pain_point, status, utm_source, utm_campaign, source_page, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (vertical !== "all" && (ALLOWED_VERTICALS as readonly string[]).includes(vertical)) {
    query = query.eq("vertical", vertical);
  }
  if (status !== "all" && (ALLOWED_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status);
  }
  if (q) {
    // PostgREST or-filter — match on email OR company OR name. ilike for
    // case-insensitive substring; .* wildcards both ends.
    const safe = q.replace(/[\\,()]/g, ""); // strip filter delimiters
    query = query.or(
      `email.ilike.%${safe}%,company.ilike.%${safe}%,name.ilike.%${safe}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = data ?? [];
  const header = [
    "vertical",
    "company",
    "name",
    "email",
    "phone",
    "service_area",
    "years_in_business",
    "crews",
    "pain_point",
    "status",
    "utm_source",
    "utm_campaign",
    "source_page",
    "created_at",
  ];

  const lines: string[] = [header.map(csvEscape).join(",")];
  for (const r of rows) {
    const row = r as Record<string, string | null>;
    lines.push(header.map((k) => csvEscape(row[k])).join(","));
  }
  const body = lines.join("\r\n") + "\r\n";

  const dateStamp = new Date().toISOString().slice(0, 10);
  const verticalTag = vertical === "all" ? "all" : vertical;
  const filename = `vertical_leads_${verticalTag}_${dateStamp}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
