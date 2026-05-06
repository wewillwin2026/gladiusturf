import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Cryptographic transparency root — Trust Director's stretch ask
 * (2026-05-08). Each UTC day, we compute a SHA-256 Merkle root over the
 * audit chain that mattered that day:
 *
 *   - ai_run                      (every AI call)
 *   - audit_log                   (every tenant-side action)
 *   - cross_tenant_access_log     (every founder cross-tenant read)
 *   - customer_messaging_consent  (every consent record / change)
 *
 * The root is recomputable by anyone with read access to those four
 * tables. We publish the daily root so a tenant — or a regulator, or
 * a journalist — can hand the hash to a forensic auditor and ask
 * "does our audit chain still produce this?" If we'd silently mutated
 * an old row, the root for that date would no longer match.
 *
 * v1: pure compute, no `transparency_roots` table yet. The /api/
 * transparency/root/[date] endpoint computes the root on demand. v2
 * adds a daily cron that snapshots the root + counts into a tenant-
 * indexed table; v3 publishes the chain of roots to a public verify
 * endpoint with notary timestamps.
 *
 * Tenant scoping: every row we hash carries a `tenant_id` field, so a
 * tenant root only includes that tenant's rows. The "all tenants" root
 * is a separate hash useful for platform-wide forensics (engineering
 * + legal, not customer-visible).
 */

function sha256Hex(buf: string | Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/**
 * Standard binary Merkle tree over an ordered array of leaf hex hashes.
 * Odd-count layer duplicates the last leaf (Bitcoin-style, simple and
 * deterministic). Empty input returns the all-zero hash.
 */
export function merkleRootHex(leaves: string[]): string {
  if (leaves.length === 0) return "0".repeat(64);
  let layer = leaves.slice();
  while (layer.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] ?? layer[i];
      next.push(sha256Hex(Buffer.from(left + right, "hex")));
    }
    layer = next;
  }
  return layer[0];
}

/**
 * Hash a single audit record into a leaf. We canonicalize the
 * stringification so two systems hashing the "same" row produce the
 * same hex. JSON keys are stringified in the order they appear.
 */
function hashRow(prefix: string, row: Record<string, unknown>): string {
  const ordered = Object.entries(row)
    .filter(([_, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${JSON.stringify(v ?? null)}`)
    .join("|");
  return sha256Hex(`${prefix}|${ordered}`);
}

export type RootSummary = {
  date: string;
  tenantId: string | null;
  rootHex: string;
  counts: {
    aiRuns: number;
    auditEvents: number;
    crossTenantReads: number;
    consentEvents: number;
  };
  computedAt: string;
};

/**
 * Compute the Merkle root for a single UTC day, optionally scoped to
 * one tenant. Pulls the four audit-bearing tables, hashes each row into
 * a leaf, sorts deterministically (created_at then id), then folds.
 */
export async function computeDailyRoot(
  utcDate: string, // YYYY-MM-DD
  tenantId: string | null,
): Promise<RootSummary> {
  const sb = supabaseAdmin();
  const start = `${utcDate}T00:00:00Z`;
  const end = `${utcDate}T23:59:59.999Z`;

  // ai_run rows
  const aiQuery = sb
    .from("ai_run")
    .select(
      "id, tenant_id, surface, model, prompt_hash, prompt_version, input_tokens, cached_input_tokens, output_tokens, cost_cents, created_at",
    )
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });
  if (tenantId) aiQuery.eq("tenant_id", tenantId);

  // audit_log rows
  const auditQuery = sb
    .from("audit_log")
    .select("id, tenant_id, user_id, action, entity_type, entity_id, created_at")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });
  if (tenantId) auditQuery.eq("tenant_id", tenantId);

  // cross_tenant_access_log rows
  const crossQuery = sb
    .from("cross_tenant_access_log")
    .select(
      "id, tenant_id, actor_email, surface, action, resource_id, granted_by_id, created_at",
    )
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });
  if (tenantId) crossQuery.eq("tenant_id", tenantId);

  // customer_messaging_consent rows
  const consentQuery = sb
    .from("customer_messaging_consent")
    .select(
      "id, tenant_id, customer_id, channel, status, source, consent_at, revoked_at, updated_at",
    )
    .gte("updated_at", start)
    .lte("updated_at", end)
    .order("updated_at", { ascending: true });
  if (tenantId) consentQuery.eq("tenant_id", tenantId);

  const [ai, audit, cross, consent] = await Promise.all([
    aiQuery,
    auditQuery,
    crossQuery,
    consentQuery,
  ]);

  // Best-effort: missing tables (cross_tenant_access_log might not exist
  // on older deploys) yield an empty array, not an error throw.
  const aiRows = (ai.data ?? []) as Array<Record<string, unknown>>;
  const auditRows = (audit.data ?? []) as Array<Record<string, unknown>>;
  const crossRows = (cross.data ?? []) as Array<Record<string, unknown>>;
  const consentRows = (consent.data ?? []) as Array<Record<string, unknown>>;

  // Hash each row into a leaf with a per-table prefix so a row with
  // colliding shape across tables doesn't accidentally hash the same.
  const leaves: string[] = [
    ...aiRows.map((r) => hashRow("ai_run", r)),
    ...auditRows.map((r) => hashRow("audit_log", r)),
    ...crossRows.map((r) => hashRow("cross_tenant_access_log", r)),
    ...consentRows.map((r) => hashRow("customer_messaging_consent", r)),
  ];
  // Lexicographically sort the combined leaf list so the Merkle root is
  // stable regardless of fetch ordering across tables.
  leaves.sort();

  return {
    date: utcDate,
    tenantId,
    rootHex: merkleRootHex(leaves),
    counts: {
      aiRuns: aiRows.length,
      auditEvents: auditRows.length,
      crossTenantReads: crossRows.length,
      consentEvents: consentRows.length,
    },
    computedAt: new Date().toISOString(),
  };
}
