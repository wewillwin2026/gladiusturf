// ---------------------------------------------------------------------------
// GladiusDefense — Attacker Archetype Classifier (mechanism #16)
// ---------------------------------------------------------------------------
// Classifies an IP's recent behavior into one of five archetypes:
//
//   script_kiddie        — fast, narrow path set, high-entropy random payloads
//   recon_operator       — slow, very wide path set, lots of 4xx, no auth
//   credential_stuffer   — repeated POST /login or /api/auth/*, many UA
//   application_attacker — focused on /api/* or /admin/*, payloads w/ SQL/XSS
//   apt_simulator        — slow, deliberate, multiple kill-chain stages
//
// Pure rule-based scoring on a 4-dim feature vector:
//   path_diversity     — unique paths / total requests   (recon-leaning)
//   timing_pattern     — coefficient of variation on inter-arrival times
//   payload_complexity — mean length + entropy of POST bodies
//   persistence        — observation window in minutes
//
// Each archetype has a weights vector; we dot it with the feature vector,
// then softmax. Highest score wins. Confidence = winner - runner-up (margin).
//
// Example (paste into REPL to test):
//   const out = runArchetypes({
//     events: [
//       { ip:"1.1.1.1", path:"/", method:"GET", body:null, timestamp:"2026-05-27T10:00:00Z", ... },
//       { ip:"1.1.1.1", path:"/admin", method:"GET", body:null, timestamp:"2026-05-27T10:00:02Z", ... },
//       { ip:"1.1.1.1", path:"/wp-login.php", method:"GET", body:null, timestamp:"2026-05-27T10:00:04Z", ... },
//     ],
//     windowMs: 24*3600*1000,
//   });
//   out.findings[0] → { kind:"archetype", severity, payload: { ip, archetype:"recon_operator", ... } }
// ---------------------------------------------------------------------------

import type { Archetype, DefenseEvent } from "./types";

export interface ArchetypeInput {
  events: DefenseEvent[];
  windowMs: number;
}

export interface ArchetypeFinding {
  kind: "archetype";
  severity: number; // 0..1
  payload: {
    ip: string;
    archetype: Archetype;
    confidence: number; // 0..1 (margin)
    eventCount: number;
    features: {
      pathDiversity: number;
      timingCV: number;
      payloadComplexity: number;
      persistenceMin: number;
    };
    scores: Record<Archetype, number>;
  };
}

export interface ArchetypeOutput {
  findings: ArchetypeFinding[];
  meta: { processedCount: number; durationMs: number };
}

// Weight rows are ordered: [pathDiversity, timingCV, payloadComplexity, persistenceMin]
// Tuned against synthetic + real defense_events traces, conservative.
const ARCHETYPE_WEIGHTS: Record<Archetype, [number, number, number, number]> = {
  script_kiddie:        [0.30, -0.40,  0.20, -0.50],
  recon_operator:       [0.80, -0.10,  0.05,  0.20],
  credential_stuffer:   [-0.30, 0.40,  0.50, -0.10],
  application_attacker: [0.20,  0.10,  0.85,  0.20],
  apt_simulator:        [0.10,  0.60,  0.30,  0.80],
};

// Bias per archetype (intercepts). Recon is the default for noisy edges.
const ARCHETYPE_BIAS: Record<Archetype, number> = {
  script_kiddie: -0.10,
  recon_operator: 0.05,
  credential_stuffer: -0.20,
  application_attacker: -0.10,
  apt_simulator: -0.30,
};

function shannon(s: string): number {
  if (s.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let h = 0;
  for (const c of counts.values()) {
    const p = c / s.length;
    h -= p * Math.log2(p);
  }
  return h;
}

function softmax(scores: number[]): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function computeFeatures(events: DefenseEvent[]): {
  pathDiversity: number;
  timingCV: number;
  payloadComplexity: number;
  persistenceMin: number;
} {
  const paths = new Set(events.map((e) => e.path));
  const pathDiversity = events.length > 0 ? paths.size / events.length : 0;

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(
      new Date(sorted[i].timestamp).getTime() -
        new Date(sorted[i - 1].timestamp).getTime(),
    );
  }
  let timingCV = 0;
  if (gaps.length > 1) {
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    if (mean > 0) {
      const variance =
        gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length;
      timingCV = Math.sqrt(variance) / mean;
    }
  }
  // Normalize timingCV to roughly 0..1
  timingCV = Math.min(1, timingCV / 2);

  // Payload complexity: mean (entropy * length-cap)
  let complexitySum = 0;
  let bodyCount = 0;
  for (const e of events) {
    const body = e.body ?? "";
    if (body.length > 0) {
      const lenScore = Math.min(1, body.length / 512);
      const entScore = shannon(body) / 8; // entropy cap ~8 bits
      complexitySum += (lenScore + entScore) / 2;
      bodyCount++;
    }
  }
  const payloadComplexity = bodyCount > 0 ? complexitySum / bodyCount : 0;

  let persistenceMin = 0;
  if (sorted.length >= 2) {
    const first = new Date(sorted[0].timestamp).getTime();
    const last = new Date(sorted[sorted.length - 1].timestamp).getTime();
    persistenceMin = Math.min(1, (last - first) / (60 * 60 * 1000)); // cap at 1h
  }

  return { pathDiversity, timingCV, payloadComplexity, persistenceMin };
}

/**
 * Classify each IP in the input window into an archetype.
 *
 * Pure function — no I/O. Caller persists findings.
 */
export function runArchetypes(input: ArchetypeInput): ArchetypeOutput {
  const start = Date.now();
  const findings: ArchetypeFinding[] = [];

  // Group by IP
  const byIp = new Map<string, DefenseEvent[]>();
  for (const ev of input.events) {
    if (!ev.ip) continue;
    const list = byIp.get(ev.ip);
    if (list) list.push(ev);
    else byIp.set(ev.ip, [ev]);
  }

  for (const [ip, ipEvents] of byIp) {
    if (ipEvents.length < 3) continue; // need a minimum signal

    const features = computeFeatures(ipEvents);
    const featureVec: [number, number, number, number] = [
      features.pathDiversity,
      features.timingCV,
      features.payloadComplexity,
      features.persistenceMin,
    ];

    const rawScores: Array<{ archetype: Archetype; raw: number }> = [];
    for (const [archetype, weights] of Object.entries(ARCHETYPE_WEIGHTS) as Array<
      [Archetype, [number, number, number, number]]
    >) {
      let dot = ARCHETYPE_BIAS[archetype];
      for (let i = 0; i < 4; i++) dot += weights[i] * featureVec[i];
      rawScores.push({ archetype, raw: dot });
    }

    const probs = softmax(rawScores.map((r) => r.raw));
    const scored = rawScores.map((r, i) => ({
      archetype: r.archetype,
      score: probs[i],
    }));
    scored.sort((a, b) => b.score - a.score);

    const winner = scored[0];
    const runnerUp = scored[1];
    const margin = winner.score - runnerUp.score;
    const scores: Record<Archetype, number> = {
      script_kiddie: 0,
      recon_operator: 0,
      credential_stuffer: 0,
      application_attacker: 0,
      apt_simulator: 0,
    };
    for (const s of scored) scores[s.archetype] = s.score;

    findings.push({
      kind: "archetype",
      severity: winner.score,
      payload: {
        ip,
        archetype: winner.archetype,
        confidence: margin,
        eventCount: ipEvents.length,
        features,
        scores,
      },
    });
  }

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - start,
    },
  };
}
