/**
 * GladiusDefense — Tier 1 (edge proxy gate)
 *
 * Hot-path defense for every gladiuscrm.com request. Runs in Edge
 * runtime, so all logic is synchronous + uses only Edge-safe primitives
 * (no @supabase/supabase-js, no node:crypto, no Prisma).
 *
 * Responsibilities (in order — each is O(1)):
 *   1. Honeypot path Set check         → 403
 *   2. IP blocklist Map check          → 403
 *   3. Challenge ladder tier check     → tarpit delay (≥3) / 403 (≥4)
 *
 * Logging: middleware can't call `after()` reliably across Edge
 * runtimes, and @supabase/supabase-js doesn't load in Edge at all.
 * So we emit a header-only signal that downstream Node-runtime
 * handlers (api routes, page server components) can pick up and
 * persist via the standard Prisma `db.$executeRaw` path. For now the
 * IP blocklist and challenge ladder are EMPTY in middleware — they'll
 * be re-hydrated by a future Pulse job that pushes the top-N worst
 * IPs into a SHARED edge config (Edge Config or KV) every minute.
 * Until then, honeypots are the only active gate, which is fine —
 * they catch the loudest scanners.
 */
import type { NextRequest } from "next/server";
import { testPayload } from "./attack-patterns";

const HONEYPOT_PATHS: ReadonlySet<string> = new Set([
  "/wp-admin",
  "/wp-login.php",
  "/.env",
  "/.git/config",
  "/phpmyadmin",
  "/admin.php",
  "/administrator",
  "/xmlrpc.php",
  "/wp-content/debug.log",
  "/server-status",
  "/actuator/health",
  "/api/v1/admin",
  "/backup.sql",
  "/config.php",
  "/.aws/credentials",
]);

const BLOCKED_IPS: ReadonlySet<string> = new Set();
const CHALLENGE_TIERS: ReadonlyMap<string, number> = new Map();

export interface Tier1Verdict {
  /** If non-null, the caller must return this response immediately. */
  response: Response | null;
  /** Optional artificial latency (ms) to inject before next() (tarpit tier). */
  delayMs: number;
}

const PASS: Tier1Verdict = { response: null, delayMs: 0 };

function getClientIP(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "0.0.0.0";
}

function normalizePath(pathname: string): string {
  const lowered = pathname.toLowerCase().replace(/\/+/g, "/");
  if (lowered.length > 1 && lowered.endsWith("/")) {
    return lowered.slice(0, -1);
  }
  return lowered;
}

/**
 * Run Tier 1 checks against the request. Synchronous, Edge-safe.
 * Returns a verdict that either blocks (403), requests a tarpit
 * delay, or passes through.
 */
export function runTier1Defense(
  request: NextRequest,
  pathname: string,
): Tier1Verdict {
  // 1. Honeypot path check (O(1) Set lookup)
  const normalized = normalizePath(pathname);
  if (HONEYPOT_PATHS.has(normalized)) {
    return {
      response: new Response("Forbidden", {
        status: 403,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-gladius-defense": "honeypot",
        },
      }),
      delayMs: 0,
    };
  }

  // 1b. Payload pattern matching — closes the gap stress-test exposed.
  // Decodes URL once + runs the full attack-pattern library against the
  // path + query string. ~25 compiled mega-regex tests on a typical
  // <200-char URL = sub-millisecond. testPayload() is pure regex (no
  // node:crypto, no @supabase) so it's Edge-safe.
  //
  // We scan the DECODED url (percent-decoded once) so that
  // `?id=%27%20OR%20%271%27%3D%271` is caught the same as
  // `?id=' OR '1'='1`.
  const search = request.nextUrl.search ?? "";
  if (search.length > 0) {
    let decoded = search;
    try {
      decoded = decodeURIComponent(search);
    } catch {
      // Malformed encoding — keep the raw string. Decode failure on its
      // own is suspicious enough that downstream regex usually catches it.
    }
    const matches = testPayload(decoded);
    if (matches.length > 0) {
      const categories = matches.map((m) => m.category).join(",");
      return {
        response: new Response("Forbidden", {
          status: 403,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "x-gladius-defense": "payload-match",
            "x-gladius-pattern": categories.slice(0, 200),
          },
        }),
        delayMs: 0,
      };
    }
  }

  // 2. IP blocklist (O(1) Set lookup). Currently empty — populated by
  // a planned Pulse job that pushes worst IPs into Edge Config.
  const ip = getClientIP(request);
  if (BLOCKED_IPS.has(ip)) {
    return {
      response: new Response("Forbidden", {
        status: 403,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-gladius-defense": "blocked-ip",
        },
      }),
      delayMs: 0,
    };
  }

  // 3. Challenge ladder
  const tier = CHALLENGE_TIERS.get(ip) ?? 0;
  if (tier >= 4) {
    return {
      response: new Response("Forbidden", {
        status: 403,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-gladius-defense": "challenge-block",
        },
      }),
      delayMs: 0,
    };
  }
  if (tier >= 3) {
    const delayMs = Math.min(4000, 1500 + (tier - 3) * 1500);
    return { response: null, delayMs };
  }

  return PASS;
}

/** Edge-safe sleep used by middleware to apply the tarpit delay. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
