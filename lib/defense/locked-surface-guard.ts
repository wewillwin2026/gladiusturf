// ---------------------------------------------------------------------------
// GladiusSentinel — Locked-Surface Guardrail (gladiusturf.com)
// ---------------------------------------------------------------------------
// Why this exists:
//
//   The Detail outage in gladius-crm on 2026-05-22 burned the founder. The
//   Sentinel module that catches that class of regression — frozen surfaces
//   getting modified without an explicit unlock token in the commit body —
//   needs to live on every vertical, not just gladius-crm. This is the
//   gladiusturf.com instance of that registry.
//
//   The mechanics are identical to the gladius-crm version: a glob registry
//   of locked paths, a glob matcher, a commit scanner that diffs a git sha
//   and reports which locked paths it modified.
//
// Locks here cover the surfaces gladiusturf has frozen so far:
//   * Marketing landing pages (feedback_landing_locked_gladiusturf_2026_05_13)
//   * /app tenant CRM (project_gladiusturf_hybrid.md)
//   * /preview (legacy, still LOCKED)
//   * /pricing/cfo (project_gladiusturf_pricing_followup.md)
//   * Founders war-room (project_gladiusturf_rbac)
//   * Bright Lights demo (Sunday-demo workspace)
//   * Cross-vertical liveness checks (5 verticals)
// ---------------------------------------------------------------------------

import { execSync } from "node:child_process";

export interface LockedPath {
  /** Glob describing the locked files. Supports `**` (any depth), `*` (one segment), and literals. */
  glob: string;
  /** Short commit sha the lock was applied at. Informational; not enforced. */
  lockedAt: string;
  /** Sentinel string that must appear in the commit body to indicate an explicit founder unlock. */
  unlockToken: string;
  /** Memory filename documenting the lock. */
  memoryRef: string;
  /** Optional smoke command. `{base}` is replaced with the deploy base URL. */
  smokeTest?: string;
  /** Human-readable name for banners + alerts. */
  label: string;
  /** Optional category tag for downstream UI filtering. */
  category?: "vertical-health";
  /** Optional vertical key for grouping. */
  vertical?:
    | "gladiuscrm"
    | "gladiusbdc"
    | "gladiusturf"
    | "gladiusstone"
    | "gofetchauto";
}

/**
 * THE REGISTRY. Append rows here — never edit existing rows without
 * founder approval; the `unlockToken` is the founder's contract.
 */
export const LOCKED_PATHS: LockedPath[] = [
  // ─── Marketing landing (gladiusturf.com homepage + vertical pages) ───────
  {
    label: "Marketing landing (homepage + vertical pages)",
    glob: "app/(marketing)/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-TURF",
    memoryRef: "feedback_landing_locked_gladiusturf_2026_05_13.md",
    smokeTest:
      'curl -s "{base}/" | grep -q "GladiusTurf\\|Gladius Turf"',
  },
  {
    label: "Marketing root page.tsx",
    glob: "app/page.tsx",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-TURF",
    memoryRef: "feedback_landing_locked_gladiusturf_2026_05_13.md",
  },
  {
    label: "Vertical landing pages (lighting, lawn-care, irrigation, etc.)",
    glob: "app/{lighting,lawn-care,landscaping,landscape,irrigation,commercial,storm}/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-TURF",
    memoryRef: "feedback_landing_locked_gladiusturf_2026_05_13.md",
  },
  {
    label: "Pricing pages",
    glob: "app/pricing/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-TURF",
    memoryRef: "project_gladiusturf_pricing_followup.md",
    smokeTest:
      'curl -s -o /dev/null -w "%{http_code}" "{base}/pricing" | grep -q "^200$"',
  },
  // ─── /app tenant CRM (the multi-tenant product surface) ──────────────────
  {
    label: "Tenant CRM /app surface",
    glob: "app/(app-and-founders)/app/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-APP",
    memoryRef: "project_gladiusturf_hybrid.md",
    smokeTest:
      'curl -s -o /dev/null -w "%{http_code}" "{base}/app/login" | grep -q "^200$"',
  },
  {
    label: "Tenant CRM API",
    glob: "app/api/app/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-APP",
    memoryRef: "project_gladiusturf_hybrid.md",
  },
  // ─── Founders war-room (high-signal sentinel + radar) ────────────────────
  {
    label: "Founders war-room",
    glob: "app/founders/(authed)/war-room/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-FOUNDERS",
    memoryRef: "project_gladiusturf_rbac.md",
  },
  {
    label: "Founders war-room API",
    glob: "app/api/founders/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-FOUNDERS",
    memoryRef: "project_gladiusturf_rbac.md",
  },
  // ─── Bright Lights demo workspace (live with paying client) ──────────────
  {
    label: "Bright Lights demo workspace",
    glob: "app/demo/bright-lights-encina/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-BRIGHT-LIGHTS",
    memoryRef: "project_bright_lights_demo.md",
  },
  // ─── Tracking + marketing analytics (canonical = founders/war-room/...) ──
  {
    label: "Tracking pipeline",
    glob: "lib/tracking/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-TURF",
    memoryRef: "feedback_landing_locked_2026_05_12.md",
  },
  // ─── Defense + Sentinel libraries (this whole module is meta-locked) ─────
  {
    label: "Defense + Sentinel libraries",
    glob: "lib/defense/**",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-SENTINEL",
    memoryRef: "project_gladius_sentinel_defense_category.md",
  },
  // ─── Cross-vertical liveness (mirrors gladius-crm) ───────────────────────
  {
    label: "Vertical liveness: gladiuscrm.com homepage",
    glob: "external/gladiuscrm/homepage",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-VERTICAL-HEALTH",
    memoryRef: "project_gladius_sentinel_defense_category.md",
    category: "vertical-health",
    vertical: "gladiuscrm",
    smokeTest:
      'curl -s -o /dev/null -w "%{http_code}" "https://gladiuscrm.com/" | grep -q "^200$"',
  },
  {
    label: "Vertical liveness: gladiusbdc.com homepage",
    glob: "external/gladiusbdc/homepage",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-VERTICAL-HEALTH",
    memoryRef: "project_gladius_sentinel_defense_category.md",
    category: "vertical-health",
    vertical: "gladiusbdc",
    smokeTest:
      'curl -s -o /dev/null -w "%{http_code}" "https://gladiusbdc.com/" | grep -q "^200$"',
  },
  {
    label: "Vertical liveness: gladiusturf.com homepage (self)",
    glob: "external/gladiusturf/homepage",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-VERTICAL-HEALTH",
    memoryRef: "project_gladius_sentinel_defense_category.md",
    category: "vertical-health",
    vertical: "gladiusturf",
    smokeTest:
      'curl -s -o /dev/null -w "%{http_code}" "https://gladiusturf.com/" | grep -q "^200$"',
  },
  {
    label: "Vertical liveness: gladiusstone.com homepage",
    glob: "external/gladiusstone/homepage",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-VERTICAL-HEALTH",
    memoryRef: "project_gladius_sentinel_defense_category.md",
    category: "vertical-health",
    vertical: "gladiusstone",
    smokeTest:
      'curl -s -o /dev/null -w "%{http_code}" "https://gladiusstone.com/" | grep -q "^200$"',
  },
  {
    label: "Vertical liveness: gofetchauto.com homepage",
    glob: "external/gofetchauto/homepage",
    lockedAt: "0000000",
    unlockToken: "UNLOCK-VERTICAL-HEALTH",
    memoryRef: "project_gladius_sentinel_defense_category.md",
    category: "vertical-health",
    vertical: "gofetchauto",
    smokeTest:
      'curl -s -o /dev/null -w "%{http_code}" "https://gofetchauto.com/" | grep -q "^200$"',
  },
];

// ---------------------------------------------------------------------------
// Glob matcher
// ---------------------------------------------------------------------------

function globToRegExp(glob: string): RegExp {
  let i = 0;
  let out = "^";
  while (i < glob.length) {
    const c = glob[i]!;
    if (c === "*") {
      if (glob[i + 1] === "*") {
        if (glob[i + 2] === "/") {
          out += "(?:.*/)?";
          i += 3;
        } else {
          out += ".*";
          i += 2;
        }
      } else {
        out += "[^/]*";
        i += 1;
      }
    } else if (c === "{") {
      const end = glob.indexOf("}", i);
      if (end === -1) {
        out += "\\{";
        i += 1;
      } else {
        const parts = glob.slice(i + 1, end).split(",");
        out += "(?:" + parts.map(escapeRegex).join("|") + ")";
        i = end + 1;
      }
    } else if (/[.+^$()|\\]/.test(c)) {
      out += "\\" + c;
      i += 1;
    } else {
      out += c;
      i += 1;
    }
  }
  out += "$";
  return new RegExp(out);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Returns the LockedPath whose glob matches `filePath`, or null. */
export function pathIsLocked(filePath: string): LockedPath | null {
  const normalized = filePath.replace(/\\/g, "/");
  for (const lock of LOCKED_PATHS) {
    if (globToRegExp(lock.glob).test(normalized)) return lock;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Commit scanner
// ---------------------------------------------------------------------------

export interface LockViolation {
  file: string;
  lock: LockedPath;
}

export interface CommitLockReport {
  sha: string;
  shortSha: string;
  subject: string;
  unlockTokenPresent: boolean;
  allViolatedLocksUnlocked: boolean;
  unlockedLocks: LockedPath[];
  violations: LockViolation[];
}

/**
 * Diff the commit, classify each touched file, and check the commit
 * body for unlock tokens. Never throws — Sentinel must never crash a
 * deploy because of its own tooling.
 */
export async function checkCommitForLockViolation(
  sha: string,
): Promise<CommitLockReport> {
  let resolvedSha = sha;
  let subject = "";
  let body = "";
  let touchedFiles: string[] = [];

  try {
    resolvedSha = execSync(`git rev-parse ${sha}`, { encoding: "utf8" })
      .toString()
      .trim();
  } catch {
    return {
      sha,
      shortSha: sha,
      subject: "",
      unlockTokenPresent: false,
      allViolatedLocksUnlocked: false,
      unlockedLocks: [],
      violations: [],
    };
  }

  try {
    subject = execSync(`git log -1 --format=%s ${resolvedSha}`, {
      encoding: "utf8",
    })
      .toString()
      .trim();
  } catch {
    /* ignore */
  }

  try {
    body = execSync(`git log -1 --format=%B ${resolvedSha}`, {
      encoding: "utf8",
    }).toString();
  } catch {
    /* ignore */
  }

  try {
    const raw = execSync(
      `git diff-tree --no-commit-id --name-only -r ${resolvedSha}`,
      { encoding: "utf8" },
    ).toString();
    touchedFiles = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  } catch {
    /* ignore */
  }

  const violations: LockViolation[] = [];
  for (const file of touchedFiles) {
    const lock = pathIsLocked(file);
    if (lock) violations.push({ file, lock });
  }

  const tokensInBody = new Set<string>();
  for (const lock of LOCKED_PATHS) {
    if (body.includes(lock.unlockToken)) tokensInBody.add(lock.unlockToken);
  }
  const unlockedLocks = LOCKED_PATHS.filter((l) =>
    tokensInBody.has(l.unlockToken),
  );

  const violatedTokens = new Set(violations.map((v) => v.lock.unlockToken));
  const allViolatedLocksUnlocked =
    violatedTokens.size > 0 &&
    [...violatedTokens].every((t) => tokensInBody.has(t));

  return {
    sha: resolvedSha,
    shortSha: resolvedSha.slice(0, 7),
    subject,
    unlockTokenPresent: tokensInBody.size > 0,
    allViolatedLocksUnlocked,
    unlockedLocks,
    violations,
  };
}

/** Format a violation report as a banner suitable for CI logs + alerts. */
export function formatViolationBanner(report: CommitLockReport): string {
  if (report.violations.length === 0) {
    return `Sentinel: commit ${report.shortSha} — no locked-surface violations.`;
  }
  const lines: string[] = [];
  lines.push("┌─────────────────────────────────────────────────────────────");
  lines.push("│  GLADIUSTURF SENTINEL — LOCKED-SURFACE VIOLATION DETECTED");
  lines.push("├─────────────────────────────────────────────────────────────");
  lines.push(`│  Commit: ${report.shortSha}  ${report.subject}`);
  lines.push(`│  Violations: ${report.violations.length} file(s) under locked paths`);
  lines.push("├─────────────────────────────────────────────────────────────");
  const byLock = new Map<string, LockViolation[]>();
  for (const v of report.violations) {
    const k = v.lock.label;
    const arr = byLock.get(k) ?? [];
    arr.push(v);
    byLock.set(k, arr);
  }
  for (const [label, vs] of byLock) {
    lines.push(`│  · ${label}`);
    lines.push(`│      lock: ${vs[0]!.lock.glob}`);
    lines.push(`│      memo: ${vs[0]!.lock.memoryRef}`);
    lines.push(`│      unlock token required: ${vs[0]!.lock.unlockToken}`);
    for (const v of vs.slice(0, 5)) {
      lines.push(`│      ✗ ${v.file}`);
    }
    if (vs.length > 5) {
      lines.push(`│      … and ${vs.length - 5} more`);
    }
  }
  lines.push("├─────────────────────────────────────────────────────────────");
  if (report.allViolatedLocksUnlocked) {
    lines.push("│  STATUS: founder unlock tokens present — proceed.");
  } else {
    lines.push("│  STATUS: NO unlock tokens present in commit body.");
    lines.push("│  REQUIRED: add the unlock token(s) above to the commit body");
    lines.push("│            OR revert the file(s) before deploy.");
  }
  lines.push("└─────────────────────────────────────────────────────────────");
  return lines.join("\n");
}
