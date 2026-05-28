// ---------------------------------------------------------------------------
// GladiusDefense — Adversarial Self-Test (mechanism #19)
// ---------------------------------------------------------------------------
// In-memory simulation: replays the top observed playbooks against a snapshot
// of current defense rules and reports which step in the chain gets caught
// (and which doesn't). Surfaces undetected attack chains for hardening.
//
// The simulator is a pure function:
//   - input  : playbooks (path sequences) + rule snapshot
//   - output : per-step coverage map (caught / missed) + recommendations
//
// A "rule" here is the lightweight form used elsewhere in this lib:
//   { id, pattern: RegExp | string, severity }
// We don't need to know the full RuleCondition graph — only whether a
// path matches a known rule.
//
// Example:
//   const out = runSelfTest({
//     playbooks: [["/", "/admin", "/wp-login.php", "/.env"]],
//     ruleSnapshot: [
//       { id:"r1", pattern:/wp-login\.php/, severity:0.6 },
//       { id:"r2", pattern:/\.env/, severity:0.9 },
//     ],
//   });
//   out.findings[0].payload → {
//     playbook, coverage: [false, false, true, true],
//     missedSteps: ["/", "/admin"],
//     coverageRatio: 0.5,
//     recommendation: "Add rule for /admin",
//   }
// ---------------------------------------------------------------------------

import type { DefenseEvent } from "./types";

export interface SelfTestRule {
  id: string;
  pattern: RegExp | string;
  severity: number;
}

export interface SelfTestInput {
  /** A list of attack-step sequences to simulate. */
  playbooks: string[][];
  /** Snapshot of rules to test against. */
  ruleSnapshot: SelfTestRule[];
  /** Optional events context (for derived recommendations). */
  events?: DefenseEvent[];
  windowMs: number;
}

export interface SelfTestFinding {
  kind: "self_test";
  severity: number;
  payload: {
    playbook: string[];
    coverage: boolean[]; // per-step caught?
    missedSteps: string[];
    coverageRatio: number;
    matchedRules: Array<{ step: number; ruleId: string }>;
    recommendation: string;
  };
}

export interface SelfTestOutput {
  findings: SelfTestFinding[];
  meta: {
    processedCount: number;
    durationMs: number;
    overallCoverage: number;
  };
}

function compile(pattern: RegExp | string): RegExp {
  if (pattern instanceof RegExp) return pattern;
  try {
    return new RegExp(pattern);
  } catch {
    // Treat as literal substring
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }
}

function findMatchingRule(
  step: string,
  rules: SelfTestRule[],
): SelfTestRule | null {
  for (const r of rules) {
    if (compile(r.pattern).test(step)) return r;
  }
  return null;
}

function recommend(missed: string[]): string {
  if (missed.length === 0) return "All steps covered — playbook fully defended.";
  if (missed.length === 1) return `Add rule for ${missed[0]} — sole undefended step.`;
  return `Add rules for ${missed.length} undefended steps: ${missed.slice(0, 3).join(", ")}${missed.length > 3 ? "…" : ""}`;
}

/**
 * Replay each playbook against the rule snapshot and report coverage.
 *
 * Pure function — no I/O.
 */
export function runSelfTest(input: SelfTestInput): SelfTestOutput {
  const startedAt = Date.now();
  const findings: SelfTestFinding[] = [];

  let totalSteps = 0;
  let totalCaught = 0;

  for (const playbook of input.playbooks) {
    if (playbook.length === 0) continue;
    const coverage: boolean[] = [];
    const matchedRules: Array<{ step: number; ruleId: string }> = [];
    const missed: string[] = [];
    for (let i = 0; i < playbook.length; i++) {
      const step = playbook[i];
      const rule = findMatchingRule(step, input.ruleSnapshot);
      coverage.push(!!rule);
      if (rule) {
        matchedRules.push({ step: i, ruleId: rule.id });
        totalCaught++;
      } else {
        missed.push(step);
      }
      totalSteps++;
    }
    const coverageRatio = playbook.length > 0 ? matchedRules.length / playbook.length : 0;
    findings.push({
      kind: "self_test",
      severity: 1 - coverageRatio, // gaps are the alert
      payload: {
        playbook,
        coverage,
        missedSteps: missed,
        coverageRatio,
        matchedRules,
        recommendation: recommend(missed),
      },
    });
  }

  return {
    findings,
    meta: {
      processedCount: totalSteps,
      durationMs: Date.now() - startedAt,
      overallCoverage: totalSteps > 0 ? totalCaught / totalSteps : 0,
    },
  };
}
