import { NextResponse } from "next/server";
import { authIntegration, unauthorized } from "@/lib/integrations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/health
 *
 * Connection test for the WordPress plugin's "Test connection" button.
 * Authenticates the API key + returns { ok, tenant_slug, server_time }.
 *
 * Why authenticate health? So the plugin's test button validates the
 * key, not just the URL. A misconfigured key needs to fail visibly.
 */

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  const tenant = await authIntegration(req);
  if (!tenant) {
    const r = unauthorized();
    for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
    return r;
  }

  return NextResponse.json(
    {
      ok: true,
      tenant_slug: tenant.slug,
      tenant_name: tenant.display_name,
      vertical: tenant.vertical,
      server_time: new Date().toISOString(),
      version: "v1",
    },
    { status: 200, headers: cors },
  );
}
