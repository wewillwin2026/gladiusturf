import "server-only";
import { supabaseAdmin } from "@/lib/supabase";
import { isSpamSuspect } from "../spam";

export type ReviewRow = {
  id: string;
  tenant_id: string;
  customer_id: string | null;
  source: string;
  source_url: string | null;
  reviewer_name: string;
  rating: number;
  body: string;
  replied: boolean;
  reply_body: string | null;
  replied_at: string | null;
  status: "published" | "spam" | "hidden";
  submitted_at: string;
  created_at: string;
};

export type ReviewKpis = {
  lifetimeCount: number;
  lifetimeAverage: number; // 0..5, one decimal
  last30Count: number;
  last30Average: number;
  repliedRatePct: number; // 0..100
};

export type VelocityPoint = { label: string; count: number };

/**
 * Pulls the full review feed for a tenant — the page renders all five
 * sections off this single fetch so we don't make 4 round-trips. v1 has
 * no pagination; once a tenant crosses ~1k reviews we'll add cursor.
 */
export async function getReviewsForTenant(
  tenantId: string,
): Promise<ReviewRow[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("reviews")
    .select(
      "id, tenant_id, customer_id, source, source_url, reviewer_name, rating, body, replied, reply_body, replied_at, status, submitted_at, created_at",
    )
    .eq("tenant_id", tenantId)
    .order("submitted_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.warn("getReviewsForTenant error", error);
    return [];
  }
  return (data ?? []) as ReviewRow[];
}

export function summarizeReviews(rows: ReviewRow[]): ReviewKpis {
  // KPIs only count rows the public would see — exclude 'spam' + 'hidden'.
  const visible = rows.filter((r) => r.status === "published");
  const lifetimeCount = visible.length;
  const lifetimeSum = visible.reduce((s, r) => s + r.rating, 0);
  const lifetimeAverage =
    lifetimeCount === 0 ? 0 : Math.round((lifetimeSum / lifetimeCount) * 10) / 10;

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30 = visible.filter(
    (r) => new Date(r.submitted_at).getTime() >= cutoff,
  );
  const last30Count = last30.length;
  const last30Sum = last30.reduce((s, r) => s + r.rating, 0);
  const last30Average =
    last30Count === 0 ? 0 : Math.round((last30Sum / last30Count) * 10) / 10;

  const repliable = visible;
  const repliedCount = repliable.filter((r) => r.replied).length;
  const repliedRatePct =
    repliable.length === 0
      ? 0
      : Math.round((repliedCount / repliable.length) * 100);

  return {
    lifetimeCount,
    lifetimeAverage,
    last30Count,
    last30Average,
    repliedRatePct,
  };
}

/**
 * Bucket reviews into a 12-month series. Bucket 0 = the month 11
 * months ago, bucket 11 = the current month. Anchored to UTC for
 * determinism (a review at 11:59 PM EST on the 1st still buckets into
 * the local-month it was submitted; we ship a tz-aware version once a
 * tenant complains).
 */
export function reviewVelocity12Months(rows: ReviewRow[]): VelocityPoint[] {
  const visible = rows.filter((r) => r.status === "published");
  const now = new Date();
  const buckets: VelocityPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    buckets.push({ label, count: 0 });
  }
  for (const r of visible) {
    const d = new Date(r.submitted_at);
    const monthsAgo =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());
    if (monthsAgo < 0 || monthsAgo > 11) continue;
    const idx = 11 - monthsAgo;
    buckets[idx].count += 1;
  }
  return buckets;
}

/**
 * Spam moderation queue: reviews already flagged spam in the DB plus
 * any 'published' rows that trip the heuristic at display time. Caps
 * at 5 to keep the section dense — moderator can promote/dismiss to
 * shrink it.
 */
export function spamSuspects(rows: ReviewRow[]): ReviewRow[] {
  const flagged = rows.filter((r) => r.status === "spam");
  const heuristic = rows.filter(
    (r) => r.status === "published" && isSpamSuspect(r.body, r.reviewer_name),
  );
  // Dedupe (a row is in `flagged` xor `heuristic` by definition, but be
  // defensive) and sort newest-first.
  const seen = new Set<string>();
  const merged: ReviewRow[] = [];
  for (const r of [...flagged, ...heuristic]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
  }
  merged.sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  );
  return merged.slice(0, 5);
}

export function publishedReviews(rows: ReviewRow[]): ReviewRow[] {
  return rows
    .filter((r) => r.status === "published")
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    );
}

/**
 * Best-effort fetch of the tenant.review_ask_enabled column. Defaults
 * false if the column is missing (e.g. migration hasn't been applied
 * yet on a dev branch).
 */
export async function getReviewAskEnabled(tenantId: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenants")
    .select("review_ask_enabled")
    .eq("id", tenantId)
    .maybeSingle();
  if (error) {
    console.warn("getReviewAskEnabled error", error);
    return false;
  }
  return Boolean((data as { review_ask_enabled?: boolean } | null)?.review_ask_enabled);
}
