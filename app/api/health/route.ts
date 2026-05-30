// ---------------------------------------------------------------------------
// Health check endpoint for external uptime monitors.
// ---------------------------------------------------------------------------
//
// Ported from gladius-crm's /api/health pattern, adapted to gladiusturf's
// stack (Supabase client directly, no Prisma).
//
// Returns 200 `healthy` when the DB ping succeeds, 503 `degraded` otherwise.
// Feature env-flag checks are observational only — they NEVER block.
//
// Hard budget: <5s total. Every external dep call is wrapped in a 3s
// timeout + try/catch. A failing dep DEGRADES — it never throws out of
// this handler.
//
// Wire an external monitor (Better Stack, UptimeRobot, Vercel Monitors)
// to GET this every minute. Critical failures → page the founder.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "error" | "configured" | "not_configured";

type HealthCheck = {
  status: CheckStatus;
  message?: string;
  detail?: string;
};

type HealthChecks = Record<string, HealthCheck>;

/**
 * Wrap a promise with a hard timeout. Resolves with the inner result, or
 * rejects with a Timeout error after `ms` milliseconds. We never let a
 * hanging Supabase / network call eat into the 5s health budget.
 */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function GET(): Promise<Response> {
  const requestId = `hc_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const startedAt = Date.now();
  const checks: HealthChecks = {};

  // ─── Database (hard requirement) ──────────────────────────────
  // SELECT 1-equivalent: ask Supabase for a single id from a table we
  // know exists in the init migration. demo_requests is the oldest
  // table in supabase/migrations/20260424_init.sql — stable target.
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      checks.database = {
        status: "error",
        message:
          "Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)",
      };
    } else {
      const supabase = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await withTimeout(
        Promise.resolve(
          supabase.from("demo_requests").select("id").limit(1),
        ).then((r) => r),
        3000,
        "supabase.select",
      );
      if (error) {
        checks.database = {
          status: "error",
          message: error.message,
        };
      } else {
        checks.database = { status: "ok" };
      }
    }
  } catch (err) {
    checks.database = {
      status: "error",
      message: err instanceof Error ? err.message : "Supabase ping failed",
    };
  }

  // ─── Feature availability (non-blocking) ──────────────────────
  // Every entry below is `!!process.env.X` → configured / not_configured.
  // None of these can flip the overall verdict.
  checks.supabase = {
    status:
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "configured"
        : "not_configured",
  };

  checks.mesh = {
    status: !!process.env.MESH_FEDERATION_TOKEN
      ? "configured"
      : "not_configured",
  };

  checks.crons = {
    status: !!process.env.CRON_SECRET ? "configured" : "not_configured",
  };

  checks.resend = {
    status: !!process.env.RESEND_API_KEY ? "configured" : "not_configured",
  };

  checks.stripe = {
    status: !!process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
  };

  checks.stripeWebhook = {
    status: !!process.env.STRIPE_WEBHOOK_SECRET
      ? "configured"
      : "not_configured",
  };

  checks.twilio = {
    status:
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      !!process.env.TWILIO_FROM_NUMBER
        ? "configured"
        : "not_configured",
  };

  checks.anthropic = {
    status: !!process.env.ANTHROPIC_API_KEY ? "configured" : "not_configured",
  };

  checks.adminAuth = {
    status:
      !!process.env.ADMIN_PASSWORD_HASH &&
      !!process.env.ADMIN_EMAIL &&
      !!process.env.ADMIN_SESSION_SECRET
        ? "configured"
        : "not_configured",
  };

  checks.trackingSalt = {
    status: !!process.env.GLADIUS_TRACKING_SALT
      ? "configured"
      : "not_configured",
  };

  checks.plausible = {
    status: !!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      ? "configured"
      : "not_configured",
  };

  // ─── Overall verdict ──────────────────────────────────────────
  // Healthy requires: DB reachable. Feature flags never block.
  const allOk = checks.database.status === "ok";
  const durationMs = Date.now() - startedAt;

  // Structured observability: silent on healthy (uptime monitors hit this
  // every minute), WARN on degraded with triage context.
  if (!allOk) {
    const failed = Object.entries(checks)
      .filter(([, c]) => c.status === "error")
      .map(([k, c]) => `${k}:${c.status}`)
      .join(",");
    console.warn("[health] degraded", {
      requestId,
      durationMs,
      failed,
      checks,
    });
  }

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
      timestamp: new Date().toISOString(),
      durationMs,
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: { "X-Request-Id": requestId },
    },
  );
}
