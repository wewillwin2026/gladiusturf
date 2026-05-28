// ---------------------------------------------------------------------------
// GladiusSentinel — Autonomous Remediation Engine (gladiusturf.com)
// ---------------------------------------------------------------------------
// Same five-action model as the gladius-crm version:
//
//   LOCKED_SURFACE_VIOLATION → AUTO_REVERT_FILES (best-effort git checkout)
//   CRITICAL_FLOW_FAILED     → AUTO_ROLLBACK_DEPLOY (env-gated, OFF default)
//   SCHEMA_DRIFT_DETECTED    → AUTO_DRAFT_MIGRATION (writes draft SQL)
//   TENANT_ISOLATION_BREACH  → AUTO_QUARANTINE_ROUTE (in-memory list)
//   <fallback>               → ESCALATE_FOUNDER
//
// Persistence: writes one row per remediation into the `sentinel_events`
// table with kind = `REMEDIATION_<action>`. The founders page reads the
// last 50 to render a timeline.
// ---------------------------------------------------------------------------

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathIsLocked } from "./locked-surface-guard";
import { insertSentinelEvent } from "./store";

const execFileAsync = promisify(execFile);

const SUBPROC_TIMEOUT_MS = 30_000;

export type ViolationKind =
  | "LOCKED_SURFACE_VIOLATION"
  | "CRITICAL_FLOW_FAILED"
  | "SCHEMA_DRIFT_DETECTED"
  | "TENANT_ISOLATION_BREACH";

export type RemediationAction =
  | "AUTO_REVERT_FILES"
  | "AUTO_QUARANTINE_ROUTE"
  | "AUTO_ROLLBACK_DEPLOY"
  | "AUTO_DRAFT_MIGRATION"
  | "ESCALATE_FOUNDER";

export interface RemediationContext {
  violationKind: ViolationKind;
  evidence: unknown;
  lockedPath?: string | string[];
  failingSmoke?: string;
  driftedField?: string;
  driftedTable?: string;
  routePath?: string;
  routeReason?: string;
  commitSha?: string;
}

export interface RemediationResult {
  action: RemediationAction;
  durationMs: number;
  succeeded: boolean;
  message: string;
  artifacts: Record<string, string>;
  enabledByEnv: boolean;
}

// In-memory quarantine list used by handlers that opt in via
// `isQuarantined(routePath)`. Persists for the lifetime of the worker.
const QUARANTINED_ROUTES = new Set<string>();

export function isQuarantined(routePath: string): boolean {
  return QUARANTINED_ROUTES.has(routePath);
}

export function listQuarantined(): string[] {
  return [...QUARANTINED_ROUTES];
}

export function liftQuarantine(routePath: string): boolean {
  return QUARANTINED_ROUTES.delete(routePath);
}

export async function remediate(
  ctx: RemediationContext,
): Promise<RemediationResult> {
  const startedAt = Date.now();
  const action = pickAction(ctx);

  let succeeded = false;
  let message = "";
  let artifacts: Record<string, string> = {};
  let enabledByEnv = false;

  try {
    switch (action) {
      case "AUTO_REVERT_FILES": {
        const r = await autoRevertFiles(ctx);
        succeeded = r.succeeded;
        message = r.message;
        artifacts = r.artifacts;
        enabledByEnv = true;
        break;
      }
      case "AUTO_ROLLBACK_DEPLOY": {
        const r = await autoRollbackDeploy(ctx);
        succeeded = r.succeeded;
        message = r.message;
        artifacts = r.artifacts;
        enabledByEnv = r.enabledByEnv;
        break;
      }
      case "AUTO_DRAFT_MIGRATION": {
        const r = await autoDraftMigration(ctx);
        succeeded = r.succeeded;
        message = r.message;
        artifacts = r.artifacts;
        enabledByEnv = true;
        break;
      }
      case "AUTO_QUARANTINE_ROUTE": {
        const r = autoQuarantineRoute(ctx);
        succeeded = r.succeeded;
        message = r.message;
        artifacts = r.artifacts;
        enabledByEnv = true;
        break;
      }
      case "ESCALATE_FOUNDER": {
        succeeded = true;
        message = `Escalated to founder — no auto-action applies to ${ctx.violationKind}.`;
        artifacts = {
          kind: ctx.violationKind,
          commitSha: ctx.commitSha ?? "",
        };
        enabledByEnv = true;
        break;
      }
    }
  } catch (err) {
    succeeded = false;
    message = `Remediation crashed: ${err instanceof Error ? err.message : String(err)}`;
  }

  const durationMs = Date.now() - startedAt;
  await insertSentinelEvent({
    kind: `REMEDIATION_${action}`,
    severity: succeeded ? "INFO" : "WARN",
    payload: {
      violationKind: ctx.violationKind,
      action,
      succeeded,
      message: message.slice(0, 2000),
      artifacts,
      enabledByEnv,
      durationMs,
      commitSha: ctx.commitSha ?? null,
      routePath: ctx.routePath ?? null,
      lockedPath: ctx.lockedPath ?? null,
      failingSmoke: ctx.failingSmoke ?? null,
      driftedField: ctx.driftedField ?? null,
      driftedTable: ctx.driftedTable ?? null,
      evidence: safeJson(ctx.evidence),
    },
  });

  return { action, durationMs, succeeded, message, artifacts, enabledByEnv };
}

function pickAction(ctx: RemediationContext): RemediationAction {
  switch (ctx.violationKind) {
    case "LOCKED_SURFACE_VIOLATION":
      return "AUTO_REVERT_FILES";
    case "CRITICAL_FLOW_FAILED":
      return "AUTO_ROLLBACK_DEPLOY";
    case "SCHEMA_DRIFT_DETECTED":
      return "AUTO_DRAFT_MIGRATION";
    case "TENANT_ISOLATION_BREACH":
      return "AUTO_QUARANTINE_ROUTE";
    default:
      return "ESCALATE_FOUNDER";
  }
}

interface InternalResult {
  succeeded: boolean;
  message: string;
  artifacts: Record<string, string>;
  enabledByEnv: boolean;
}

async function autoRevertFiles(
  ctx: RemediationContext,
): Promise<InternalResult> {
  const files = Array.isArray(ctx.lockedPath)
    ? ctx.lockedPath
    : ctx.lockedPath
      ? [ctx.lockedPath]
      : [];
  if (files.length === 0) {
    return ok(
      "AUTO_REVERT_FILES skipped — no lockedPath provided",
      {},
      false,
    );
  }
  const byAnchor = new Map<string, string[]>();
  for (const file of files) {
    const lock = pathIsLocked(file);
    if (!lock) continue;
    const arr = byAnchor.get(lock.lockedAt) ?? [];
    arr.push(file);
    byAnchor.set(lock.lockedAt, arr);
  }
  if (byAnchor.size === 0) {
    return ok(
      `AUTO_REVERT_FILES skipped — no files matched any lock anchor (files: ${files.length})`,
      { fileCount: String(files.length) },
      false,
    );
  }
  if (!(await isGitAvailable())) {
    return ok(
      "AUTO_REVERT_FILES skipped — git not available in runtime (cron context)",
      { runtime: "serverless-or-no-git" },
      false,
    );
  }
  const restored: string[] = [];
  const errors: string[] = [];
  for (const [anchor, group] of byAnchor) {
    if (anchor === "0000000") {
      // Placeholder anchor — cannot revert. Surface to founder.
      errors.push(`anchor ${anchor}: placeholder, no real lock commit`);
      continue;
    }
    try {
      await execFileAsync(
        "git",
        ["checkout", anchor, "--", ...group],
        { timeout: SUBPROC_TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      );
      restored.push(...group.map((f) => `${anchor}:${f}`));
    } catch (err) {
      errors.push(
        `anchor ${anchor}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  const succeeded = restored.length > 0 && errors.length === 0;
  const summary = succeeded
    ? `Reverted ${restored.length} file(s) from anchor commit(s) into working tree — founder must review + commit + push.`
    : `Partial revert — restored ${restored.length}, ${errors.length} error(s).`;
  return {
    succeeded,
    message: summary,
    artifacts: {
      restoredCount: String(restored.length),
      restored: restored.slice(0, 20).join("\n"),
      errors: errors.join("\n"),
    },
    enabledByEnv: true,
  };
}

async function autoRollbackDeploy(
  ctx: RemediationContext,
): Promise<InternalResult> {
  const enabled = process.env.SENTINEL_AUTO_ROLLBACK_ENABLED === "1";
  if (!enabled) {
    return {
      succeeded: true,
      message:
        "AUTO_ROLLBACK_DEPLOY gated OFF (SENTINEL_AUTO_ROLLBACK_ENABLED!=1) — detection-only.",
      artifacts: {
        gate: "SENTINEL_AUTO_ROLLBACK_ENABLED",
        gateValue: process.env.SENTINEL_AUTO_ROLLBACK_ENABLED ?? "",
        failingSmoke: ctx.failingSmoke ?? "",
      },
      enabledByEnv: false,
    };
  }
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return fail(
      "AUTO_ROLLBACK_DEPLOY skipped — VERCEL_TOKEN not configured.",
      { reason: "missing-vercel-token" },
    );
  }
  return fail(
    "AUTO_ROLLBACK_DEPLOY: no last-known-good deploy recorded yet — first run will seed.",
    { reason: "no-last-known-good" },
  );
}

async function autoDraftMigration(
  ctx: RemediationContext,
): Promise<InternalResult> {
  const field = ctx.driftedField ?? "unknown_field";
  const table = ctx.driftedTable ?? "unknown_table";
  const ts = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "");
  const slug = `${ts}_${sanitizeSlug(table)}_${sanitizeSlug(field)}`;
  const draftDir = path.join(process.cwd(), "supabase", "migrations");
  const filePath = path.join(draftDir, `draft_${slug}.sql`);

  const sql = [
    `-- GladiusSentinel auto-drafted migration stub`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Reason: SCHEMA_DRIFT_DETECTED on table "${table}", column "${field}"`,
    `--`,
    `-- This stub is NOT a real migration. Founder review required:`,
    `--   * If the code is correct and the schema is missing the column,`,
    `--     rename this file to a real <ts>_xxx.sql migration.`,
    `--   * If the schema is correct and the code is stale, delete this`,
    `--     stub and remove the field references from code instead.`,
    ``,
    `-- alter table ${table} add column if not exists ${field} text;`,
    `-- create index if not exists ${table}_${field}_idx on ${table} (${field});`,
    ``,
  ].join("\n");

  try {
    await mkdir(draftDir, { recursive: true });
    await writeFile(filePath, sql, "utf8");
    return {
      succeeded: true,
      message: `Drafted migration stub at supabase/migrations/draft_${slug}.sql — founder review required.`,
      artifacts: { draftPath: filePath, table, field },
      enabledByEnv: true,
    };
  } catch (err) {
    // Read-only fs (Vercel) — fall back to /tmp.
    try {
      const tmp = path.join("/tmp", `gladius-sentinel-draft-${slug}.sql`);
      await writeFile(tmp, sql, "utf8");
      return {
        succeeded: true,
        message: `Drafted migration stub at /tmp (repo filesystem read-only). Founder must copy into supabase/migrations.`,
        artifacts: {
          draftPath: tmp,
          table,
          field,
          fallbackReason: err instanceof Error ? err.message : String(err),
        },
        enabledByEnv: true,
      };
    } catch (err2) {
      return fail(
        `Failed to draft migration: ${err2 instanceof Error ? err2.message : String(err2)}`,
        { table, field },
      );
    }
  }
}

function autoQuarantineRoute(ctx: RemediationContext): InternalResult {
  const route = ctx.routePath;
  if (!route) {
    return fail("AUTO_QUARANTINE_ROUTE skipped — no routePath provided.", {});
  }
  const added = !QUARANTINED_ROUTES.has(route);
  QUARANTINED_ROUTES.add(route);
  return {
    succeeded: true,
    message: added
      ? `Route ${route} quarantined — handlers that check isQuarantined() will return 503.`
      : `Route ${route} already quarantined — no change.`,
    artifacts: {
      route,
      reason: ctx.routeReason ?? "Tenant-isolation breach detected by Sentinel.",
      duplicate: added ? "false" : "true",
    },
    enabledByEnv: true,
  };
}

function ok(
  message: string,
  artifacts: Record<string, string>,
  enabledByEnv: boolean,
): InternalResult {
  return { succeeded: true, message, artifacts, enabledByEnv };
}

function fail(
  message: string,
  artifacts: Record<string, string>,
): InternalResult {
  return { succeeded: false, message, artifacts, enabledByEnv: true };
}

async function isGitAvailable(): Promise<boolean> {
  try {
    await execFileAsync("git", ["rev-parse", "HEAD"], {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });
    return true;
  } catch {
    return false;
  }
}

function sanitizeSlug(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function safeJson(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}
