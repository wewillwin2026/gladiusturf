import { supabaseAdmin } from "@/lib/supabase";

/**
 * Bearer-token authentication for /api/integrations/* endpoints.
 *
 * The WordPress plugin (and any future integration) sends:
 *
 *   Authorization: Bearer glx_<hex>
 *
 * We look up tenants.api_key and return the tenant row. The key is
 * the security boundary — anyone with it can submit leads + events
 * against the tenant. Rotation is supported via the founder UI
 * (writes a fresh key to the same column).
 */

export type IntegrationTenant = {
  id: string;
  slug: string;
  display_name: string;
  vertical: string;
};

function extractBearer(req: Request): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(auth.trim());
  if (!match) return null;
  return match[1] ?? null;
}

/**
 * Verify the bearer token and return the tenant. Returns null on:
 *   - missing header
 *   - malformed bearer
 *   - unknown / inactive key
 *   - db lookup error
 *
 * Callers should respond with 401 on null. We deliberately never
 * distinguish "unknown key" from "inactive tenant" in the response —
 * both look the same from the outside.
 */
export async function authIntegration(
  req: Request,
): Promise<IntegrationTenant | null> {
  const token = extractBearer(req);
  if (!token) return null;
  // Defense in depth — keys are 'glx_<48hex>' = 52 chars. Anything wildly
  // off probably isn't worth a db roundtrip.
  if (token.length < 16 || token.length > 200) return null;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenants")
    .select("id, slug, display_name, vertical, active")
    .eq("api_key", token)
    .maybeSingle();
  if (error || !data) return null;
  if (!(data as { active: boolean }).active) return null;
  const row = data as IntegrationTenant & { active: boolean };
  return {
    id: row.id,
    slug: row.slug,
    display_name: row.display_name,
    vertical: row.vertical,
  };
}

/**
 * Standardized 401 response. Same body + no hints — clients should
 * not be able to enumerate keys based on response shape.
 */
export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": 'Bearer realm="gladiusturf"',
    },
  });
}
