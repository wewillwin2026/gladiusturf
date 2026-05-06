import { computeDailyRoot } from "@/lib/audit/merkle";
import { readAppSession } from "@/lib/app/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/transparency/root/[date]
 *
 * Returns the SHA-256 Merkle root over the audit chain for a given
 * UTC date. Trust Director's stretch ask — anyone with read access to
 * the underlying tables can independently re-compute and verify.
 *
 * Auth model:
 *   - Tenant session: returns tenant-scoped root over their rows.
 *   - Bearer CRON_SECRET: returns the all-tenants root (engineering
 *     + legal use; not exposed publicly).
 *   - No auth: 401.
 *
 * Anonymous public access at a per-day level is a follow-up feature —
 * Trust Director wants the daily roots POSTED to a public board with
 * notary timestamps so even Gladius can't deny what was hashed when.
 * That ships behind a daily cron + a `transparency_roots` table.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> },
): Promise<Response> {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: "date must be YYYY-MM-DD UTC" },
      { status: 400 },
    );
  }

  const session = await readAppSession();
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (session.kind === "tenant") {
    try {
      const root = await computeDailyRoot(date, session.tenant.id);
      return Response.json(root, {
        headers: { "Cache-Control": "private, max-age=300" },
      });
    } catch (err) {
      console.warn("transparency root error", err);
      return Response.json({ error: "compute_failed" }, { status: 500 });
    }
  }

  if (isCron) {
    try {
      const root = await computeDailyRoot(date, null);
      return Response.json(root);
    } catch (err) {
      console.warn("transparency root error", err);
      return Response.json({ error: "compute_failed" }, { status: 500 });
    }
  }

  return Response.json({ error: "unauthenticated" }, { status: 401 });
}
