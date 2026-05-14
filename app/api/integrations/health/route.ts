import { NextResponse } from "next/server";
import { authIntegration, unauthorized } from "@/lib/integrations/auth";

export async function GET(req: Request) {
  const tenant = await authIntegration(req);
  if (!tenant) return unauthorized();
  return NextResponse.json({
    ok: true,
    tenant_slug: tenant.slug,
    server_time: new Date().toISOString(),
  });
}
