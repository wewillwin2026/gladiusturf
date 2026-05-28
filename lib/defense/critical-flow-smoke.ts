// ---------------------------------------------------------------------------
// GladiusSentinel — Critical-Flow Smoke Runner (gladiusturf.com)
// ---------------------------------------------------------------------------
// For every LockedPath with a `smokeTest`, run the test against the
// configured base URL and report pass/fail. Each smoke is bounded by a
// 1.5s timeout. The runner is invoked from
// `/api/cron/sentinel-critical-flows`.
//
// Implementation note: the `smokeTest` strings are shell snippets (curl +
// grep). On Vercel the runner has `node:child_process` available (nodejs
// runtime). On Windows local dev, the `sh` binary comes from Git for
// Windows. If `sh` is not on PATH, every smoke records error and the run
// reports failure — never throws.
// ---------------------------------------------------------------------------

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { LOCKED_PATHS, type LockedPath } from "./locked-surface-guard";

const execFileAsync = promisify(execFile);

export interface SmokeResult {
  lock: LockedPath;
  command: string;
  passed: boolean;
  durationMs: number;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export interface SmokeRunReport {
  baseUrl: string;
  startedAt: string;
  totalMs: number;
  totalSmokes: number;
  passedSmokes: number;
  failedSmokes: number;
  results: SmokeResult[];
}

const TIMEOUT_MS = 1_500;

async function runOneSmoke(
  lock: LockedPath & { smokeTest: string },
  baseUrl: string,
): Promise<SmokeResult> {
  const command = lock.smokeTest.replace(/\{base\}/g, baseUrl);
  const t0 = Date.now();
  let passed = false;
  let stdout = "";
  let stderr = "";
  let error: string | undefined;
  try {
    const child = await execFileAsync("sh", ["-c", command], {
      timeout: TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
    });
    stdout = child.stdout?.toString() ?? "";
    stderr = child.stderr?.toString() ?? "";
    passed = true;
  } catch (e) {
    const err = e as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
    };
    stdout = err.stdout?.toString() ?? "";
    stderr = err.stderr?.toString() ?? "";
    error = err.message;
    passed = false;
  }
  return {
    lock,
    command,
    passed,
    durationMs: Date.now() - t0,
    stdout: stdout.slice(0, 500),
    stderr: stderr.slice(0, 500),
    error,
  };
}

/**
 * Run every smokeTest declared on a LockedPath. Returns one result per
 * smoke. Locks WITHOUT a smokeTest are skipped silently. All smokes run
 * in parallel via Promise.all — wall clock = slowest single smoke.
 */
export async function runCriticalFlowSmokes(
  baseUrl: string,
): Promise<SmokeRunReport> {
  const startedAt = new Date();
  const targets = LOCKED_PATHS.filter(
    (l): l is LockedPath & { smokeTest: string } =>
      typeof l.smokeTest === "string" && l.smokeTest.length > 0,
  );

  const results: SmokeResult[] = await Promise.all(
    targets.map((lock) => runOneSmoke(lock, baseUrl)),
  );

  const totalMs = Date.now() - startedAt.getTime();
  const passedSmokes = results.filter((r) => r.passed).length;

  return {
    baseUrl,
    startedAt: startedAt.toISOString(),
    totalMs,
    totalSmokes: results.length,
    passedSmokes,
    failedSmokes: results.length - passedSmokes,
    results,
  };
}
