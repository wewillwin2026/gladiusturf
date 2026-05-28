/**
 * AWAIS Defense — per-request wire for gladiusturf.com.
 *
 * Edge-safe entry that runs on every public request and produces a
 * three-state verdict: BLOCK / FLAG / PASS.
 *
 *   BLOCK → middleware returns 403 immediately.
 *   FLAG  → middleware continues with `x-gx-flag: <reason>` header.
 *   PASS  → middleware continues unchanged.
 *
 * Pipeline (ordered, each O(1) or single regex test):
 *   1. Tier-1 edge gate (honeypot Set, payload regex library, IP/challenge tier)
 *   2. Per-IP path-sequence kill-chain detection (in-memory ring buffer, no DB)
 *   3. Bot-scoring heuristics on UA + path
 *   4. Cross-fire event to https://gladiuscrm.com/api/hq/defense-events
 *      on BLOCK/FLAG (fire-and-forget; 404 / network errors are silent)
 *
 * In-memory state: this module keeps a small per-IP ring buffer in
 * module-level Maps. Edge runtime keeps these warm per region per
 * lambda instance, so kill-chain stage transitions are tracked for the
 * lifetime of the worker. We cap memory at MAX_IPS to prevent unbounded
 * growth; oldest entries are evicted FIFO.
 */
import type { NextRequest } from "next/server";
import { runTier1Defense } from "./tier1-edge";

// ---------------------------------------------------------------------------
// In-memory state (per-edge-worker, evicted FIFO)
// ---------------------------------------------------------------------------

const MAX_IPS = 5000;
const PATH_HISTORY_PER_IP = 12;
const KILL_CHAIN_WINDOW_MS = 10 * 60 * 1000;

interface IpTrack {
  paths: string[];
  timestamps: number[];
  stages: Set<KillChainStage>;
  lastSeen: number;
}

type KillChainStage =
  | "reconnaissance"
  | "weaponization"
  | "delivery"
  | "exploitation"
  | "installation"
  | "command_control"
  | "actions";

const IP_TRACKS = new Map<string, IpTrack>();

function getTrack(ip: string): IpTrack {
  let t = IP_TRACKS.get(ip);
  if (!t) {
    if (IP_TRACKS.size >= MAX_IPS) {
      const oldest = IP_TRACKS.keys().next().value;
      if (oldest !== undefined) IP_TRACKS.delete(oldest);
    }
    t = {
      paths: [],
      timestamps: [],
      stages: new Set(),
      lastSeen: Date.now(),
    };
    IP_TRACKS.set(ip, t);
  }
  return t;
}

// ---------------------------------------------------------------------------
// Kill-chain stage classification (Lockheed Martin Cyber Kill Chain mapping)
// ---------------------------------------------------------------------------

function classifyStage(path: string): KillChainStage | null {
  const p = path.toLowerCase();
  // Reconnaissance
  if (
    p === "/robots.txt" ||
    p === "/sitemap.xml" ||
    p.includes("/.well-known") ||
    p === "/" ||
    p.endsWith("/favicon.ico")
  ) {
    return "reconnaissance";
  }
  // Weaponization (payload-staging probes)
  if (
    p.includes("/cgi-bin") ||
    p.endsWith(".sh") ||
    p.endsWith(".py") ||
    p.endsWith(".pl")
  ) {
    return "weaponization";
  }
  // Delivery (login / form endpoints, scripted POSTs)
  if (
    p.includes("/login") ||
    p.includes("/signin") ||
    p.includes("/signup") ||
    p.includes("/register") ||
    p.includes("/auth")
  ) {
    return "delivery";
  }
  // Exploitation (vuln/probe paths)
  if (
    p.includes("/.env") ||
    p.includes("/.git") ||
    p.includes("wp-admin") ||
    p.includes("wp-login") ||
    p.includes("phpmyadmin") ||
    p.includes("xmlrpc") ||
    p.includes("/admin") ||
    p.includes("/actuator") ||
    p.includes("/server-status")
  ) {
    return "exploitation";
  }
  // Installation (file upload / webshell hints)
  if (
    p.includes("/upload") ||
    p.endsWith(".php") ||
    p.endsWith(".jsp") ||
    p.endsWith(".asp") ||
    p.endsWith(".aspx")
  ) {
    return "installation";
  }
  // C2 (websocket / api token endpoints)
  if (
    p.includes("/ws") ||
    p.includes("/socket") ||
    p.includes("/token") ||
    p.includes("/oauth")
  ) {
    return "command_control";
  }
  // Actions on objectives (data exfil hints)
  if (
    p.includes("/export") ||
    p.includes("/download") ||
    p.includes("/backup") ||
    p.endsWith(".sql") ||
    p.endsWith(".zip") ||
    p.endsWith(".tar.gz")
  ) {
    return "actions";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Bot-scoring heuristics (UA-based, edge-safe)
// ---------------------------------------------------------------------------

const BOT_UA_PATTERNS: ReadonlyArray<{ rx: RegExp; reason: string; block: boolean }> = [
  { rx: /sqlmap/i, reason: "ua-sqlmap", block: true },
  { rx: /nikto/i, reason: "ua-nikto", block: true },
  { rx: /nmap/i, reason: "ua-nmap", block: true },
  { rx: /masscan/i, reason: "ua-masscan", block: true },
  { rx: /nuclei/i, reason: "ua-nuclei", block: true },
  { rx: /acunetix/i, reason: "ua-acunetix", block: true },
  { rx: /wpscan/i, reason: "ua-wpscan", block: true },
  { rx: /metasploit/i, reason: "ua-metasploit", block: true },
  { rx: /burpsuite|burp suite/i, reason: "ua-burp", block: true },
  { rx: /\bhttpx\b/i, reason: "ua-httpx", block: true },
  { rx: /zgrab/i, reason: "ua-zgrab", block: true },
  { rx: /gobuster/i, reason: "ua-gobuster", block: true },
  { rx: /dirbuster|dirb\b/i, reason: "ua-dirbuster", block: true },
  { rx: /feroxbuster/i, reason: "ua-feroxbuster", block: true },
  { rx: /\bwfuzz\b/i, reason: "ua-wfuzz", block: true },
  // Flag-only (lower confidence — could be legit research scrapers)
  { rx: /python-requests/i, reason: "ua-python-requests", block: false },
  { rx: /go-http-client/i, reason: "ua-go-http", block: false },
  { rx: /libwww-perl/i, reason: "ua-libwww", block: false },
  { rx: /curl\//i, reason: "ua-curl", block: false },
  { rx: /\bwget\b/i, reason: "ua-wget", block: false },
];

function scoreBot(userAgent: string): { score: number; reason: string | null; block: boolean } {
  if (!userAgent) {
    return { score: 0.4, reason: "ua-empty", block: false };
  }
  for (const entry of BOT_UA_PATTERNS) {
    if (entry.rx.test(userAgent)) {
      return { score: entry.block ? 0.95 : 0.6, reason: entry.reason, block: entry.block };
    }
  }
  return { score: 0, reason: null, block: false };
}

// ---------------------------------------------------------------------------
// Client IP extraction (matches tier1-edge convention)
// ---------------------------------------------------------------------------

function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "0.0.0.0";
}

// ---------------------------------------------------------------------------
// Cross-fire to HQ (fire-and-forget; never throws to caller)
// ---------------------------------------------------------------------------

const HQ_ENDPOINT = "https://gladiuscrm.com/api/hq/defense-events";

function crossFire(verdict: "BLOCK" | "FLAG", reason: string, ip: string): void {
  // Fire-and-forget. Use the global fetch (Edge-safe) and swallow
  // every error path — 404, DNS failure, timeout, abort — silently.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    void fetch(HQ_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        vertical: "gladiusturf",
        verdict,
        reason,
        ip,
        ts: new Date().toISOString(),
      }),
      signal: controller.signal,
      keepalive: true,
    })
      .catch(() => {
        /* silent */
      })
      .finally(() => clearTimeout(timeout));
  } catch {
    /* silent */
  }
}

// ---------------------------------------------------------------------------
// Public verdict shape
// ---------------------------------------------------------------------------

export type DefenseVerdict =
  | { kind: "BLOCK"; reason: string; response: Response }
  | { kind: "FLAG"; reason: string }
  | { kind: "PASS" };

const PASS: DefenseVerdict = { kind: "PASS" };

function makeBlock(reason: string): DefenseVerdict {
  return {
    kind: "BLOCK",
    reason,
    response: new Response("Forbidden", {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-awais-defense": "block",
        "x-awais-reason": reason.slice(0, 200),
      },
    }),
  };
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/**
 * Run the AWAIS defense pipeline against an incoming request.
 *
 * Synchronous, Edge-safe. Returns a verdict the middleware uses to
 * decide whether to 403, set a flag header, or continue unchanged.
 */
export function defenseWire(req: NextRequest, pathname: string): DefenseVerdict {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "";

  // 1. Tier-1 (honeypot, payload regex, IP blocklist, challenge tier)
  const tier1 = runTier1Defense(req, pathname);
  if (tier1.response) {
    const reason = tier1.response.headers.get("x-gladius-defense") ?? "tier1";
    crossFire("BLOCK", reason, ip);
    return {
      kind: "BLOCK",
      reason,
      response: tier1.response,
    };
  }

  // 2. Bot UA scoring
  const bot = scoreBot(userAgent);
  if (bot.block && bot.reason) {
    crossFire("BLOCK", bot.reason, ip);
    return makeBlock(bot.reason);
  }

  // 3. Kill-chain tracking (per-IP path-stage history)
  const now = Date.now();
  const track = getTrack(ip);

  // Evict history older than the kill-chain window
  while (track.timestamps.length > 0 && now - track.timestamps[0] > KILL_CHAIN_WINDOW_MS) {
    track.paths.shift();
    track.timestamps.shift();
  }
  if (track.paths.length >= PATH_HISTORY_PER_IP) {
    track.paths.shift();
    track.timestamps.shift();
  }
  track.paths.push(pathname);
  track.timestamps.push(now);
  track.lastSeen = now;

  const stage = classifyStage(pathname);
  if (stage) {
    track.stages.add(stage);
  }

  // Kill-chain promotion: 3+ stages crossed inside the window → BLOCK
  // 2 stages crossed → FLAG
  if (track.stages.size >= 3) {
    const reason = `kill-chain:${Array.from(track.stages).join("+")}`;
    crossFire("BLOCK", reason, ip);
    return makeBlock(reason);
  }
  if (track.stages.size === 2) {
    const reason = `kill-chain-partial:${Array.from(track.stages).join("+")}`;
    crossFire("FLAG", reason, ip);
    return { kind: "FLAG", reason };
  }

  // 4. Bot-flag (UA matched a low-confidence pattern)
  if (bot.reason && bot.score > 0) {
    crossFire("FLAG", bot.reason, ip);
    return { kind: "FLAG", reason: bot.reason };
  }

  return PASS;
}

/** Test helper — clears in-memory state. Not used in middleware path. */
export function _resetDefenseStateForTests(): void {
  IP_TRACKS.clear();
}
