// ---------------------------------------------------------------------------
// GladiusDefense -- Core Type Definitions
// ---------------------------------------------------------------------------
// Ported from the legacy ecosystem-hq repo for the AWAIS cold-path Pulse job.

/** Challenge escalation tier (0 = allow, 4 = hard block). */
export type ChallengeTier = 0 | 1 | 2 | 3 | 4;

/** Broad threat classification. */
export type ThreatLevel = "low" | "elevated" | "high" | "critical";

/** Actions the defense system can take. */
export type DefenseAction =
  | "flag"
  | "block"
  | "tarpit"
  | "honeypot_redirect"
  | "challenge"
  | "phantom_redirect"
  | "observe";

/** Attacker archetype determined by behavioral clustering. */
export type Archetype =
  | "script_kiddie"
  | "recon_operator"
  | "credential_stuffer"
  | "application_attacker"
  | "apt_simulator";

// ---------------------------------------------------------------------------
// Core event / entity shapes
// ---------------------------------------------------------------------------

export interface DefenseEvent {
  id: string;
  timestamp: string; // ISO-8601
  ip: string;
  path: string;
  method: string;
  userAgent: string;
  headers: Record<string, string>;
  body: string | null;
  queryParams: Record<string, string>;
  statusCode: number;
  responseTimeMs: number;
  threatScore: number;
  threatLevel: ThreatLevel;
  action: DefenseAction;
  ruleMatches: string[];
  fingerprint: string;
  archetype: Archetype | null;
  sessionId: string | null;
  country: string | null;
  asn: number | null;
  metadata: Record<string, unknown>;
}

export interface IPReputation {
  ip: string;
  score: number;
  firstSeen: string;
  lastSeen: string;
  requestCount: number;
  blockedCount: number;
  pathsAccessed: string[];
  archetype: Archetype | null;
  challengeTier: ChallengeTier;
  tags: string[];
  geoCountry: string | null;
  geoCity: string | null;
  asn: number | null;
  asnOrg: string | null;
  isTor: boolean;
  isProxy: boolean;
  isHosting: boolean;
}

export interface DefenseRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  action: DefenseAction;
  confidence: number;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  matchCount: number;
  falsePositiveCount: number;
  tags: string[];
}

export interface RuleCondition {
  type:
    | "path_match"
    | "header_match"
    | "rate_limit"
    | "payload_match"
    | "composite"
    | "user_agent_match"
    | "status_code"
    | "geo_match"
    | "entropy_threshold"
    | "sequence_match";
  value?: string;
  threshold?: number;
  windowSeconds?: number;
  operator?: "AND" | "OR";
  children?: RuleCondition[];
  negate?: boolean;
}

export interface Baseline {
  key: string;
  mean: number;
  m2: number;
  count: number;
  variance: number;
  stddev: number;
  emaValue: number;
  alpha: number;
  lastUpdated: string;
}

export interface AttackChain {
  id: string;
  ip: string;
  startTime: string;
  endTime: string | null;
  events: string[];
  archetype: Archetype;
  confidence: number;
  killChainStage:
    | "reconnaissance"
    | "weaponization"
    | "delivery"
    | "exploitation"
    | "installation"
    | "command_control"
    | "actions";
  tactics: string[];
  isConcluded: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string | null;
  ips: string[];
  fingerprints: string[];
  archetype: Archetype;
  confidence: number;
  eventCount: number;
  isActive: boolean;
  tags: string[];
}
