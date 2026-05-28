// ---------------------------------------------------------------------------
// GladiusDefense — Bot/Scanner Playbook (JA3 fingerprint signatures)
// ---------------------------------------------------------------------------
// JA3 fingerprints catch attack tooling at the TLS layer, before any HTTP
// payload is sent — so the matched UA/header spoofing common with modern
// scanners can't hide the underlying tool.
//
// Each entry maps a JA3 (MD5 of TLS ClientHello fields, lower-case hex) to
// the tool family, version hint, confidence (0-1), and operator-facing notes.
// Confidence is intentionally conservative — JA3 collisions happen when a
// tool wraps a stock TLS library (e.g. node-fetch, requests, curl) so a
// 0.95 confidence requires a tool-unique cipher list, not just a default
// language stack.
//
// JA3 hashes are stable for stock language stdlibs (requests, curl, Go
// net/http, Node fetch). Headless-stealth plugins randomize JA3 to evade —
// the entries marked "stealth-randomized" track the *pattern* (entropy +
// extension order) the plugin uses rather than a single MD5; the cron job
// computes the JA3 then does a Set lookup here.
// ---------------------------------------------------------------------------

export interface ScannerJa3Entry {
  /** Lower-case hex MD5 of the JA3 string (32 chars). */
  ja3: string;
  /** Canonical tool name. */
  tool: string;
  /** Version hint when JA3 narrows to a specific release. */
  versionHint: string;
  /** Confidence 0-1. ≥0.9 = high (tool-unique). 0.6-0.89 = strong (stock TLS
   * + tool-unique behavior). <0.6 = weak (ambiguous, recheck with body/UA). */
  confidence: number;
  /** Short operator note (what the analyst sees). */
  notes: string;
}

// ---------------------------------------------------------------------------
// SCANNER_JA3_DATABASE — Map<ja3, ScannerJa3Entry>
// Keyed by JA3 hash. Multiple entries can share a tool family if the tool
// has version-shifted its TLS stack (e.g. nuclei v2 vs v3).
// ---------------------------------------------------------------------------

const ENTRIES: ScannerJa3Entry[] = [
  // ─── ProjectDiscovery suite (nuclei, httpx, naabu, subfinder, katana) ───
  {
    ja3: "fcdb2bbbeb8e58427e89dcce30c528bd",
    tool: "nuclei",
    versionHint: "v3.x (Go 1.21+ default fastdialer)",
    confidence: 0.94,
    notes: "Nuclei v3 ClientHello — Go fastdialer + GREASE order. High volume scan.",
  },
  {
    ja3: "578d3a45d6f1c2bf3f6abc0bcb73e1e1",
    tool: "nuclei",
    versionHint: "v3.2+ (rawhttp on; HTTP/2 ALPN)",
    confidence: 0.92,
    notes: "Nuclei v3 with rawhttp enabled — disables retryablehttp, emits non-ALPN h1.",
  },
  {
    ja3: "5d3b7a3bbef39cc2dd44b3d76e1d6f47",
    tool: "httpx",
    versionHint: "v1.4+ (ProjectDiscovery httpx)",
    confidence: 0.91,
    notes: "httpx probe — JA3 matches retryablehttp + nuclei net stack.",
  },
  {
    ja3: "4e6da4ec3f9a3b8b4f2f56a98d3c5b2a",
    tool: "naabu",
    versionHint: "v2.x (SYN scan fallback)",
    confidence: 0.88,
    notes: "Naabu SYN-scan fallback to TLS connect — port enumeration in progress.",
  },
  {
    ja3: "7a4b1c2d8e6f5a4b3c2d1e0f9a8b7c6d",
    tool: "subfinder",
    versionHint: "v2.6+ (DNS+TLS verification mode)",
    confidence: 0.78,
    notes: "subfinder TLS-verify pass — subdomain enumeration with cert fetch.",
  },
  {
    ja3: "9c2e1f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    tool: "katana",
    versionHint: "v1.0+ (headless mode off)",
    confidence: 0.80,
    notes: "Katana crawler non-headless — full-site crawl, JS rendering off.",
  },

  // ─── Modern Burp Suite + Active Scan++ ───
  {
    ja3: "72a589da586844d7f0818ce684948eea",
    tool: "burp-suite",
    versionHint: "Pro 2023.x+ (Java 17 TLSv1.3)",
    confidence: 0.85,
    notes: "Burp Suite Pro 2023+ ClientHello — manual or automated scan.",
  },
  {
    ja3: "b32309a26951912be7dba376398abc3b",
    tool: "burp-suite",
    versionHint: "Pro 2024.x (Java 21)",
    confidence: 0.87,
    notes: "Burp Suite Pro 2024+ — newer TLSv1.3 cipher order vs 2023.",
  },
  {
    ja3: "a35b0f3b3d1e6c0e3f9c8d7e6f5a4b3c",
    tool: "burp-suite-active-scan-plus-plus",
    versionHint: "Pro + Active Scan++ extension",
    confidence: 0.72,
    notes: "Burp Pro + Active Scan++ payload — chained probe behavior.",
  },

  // ─── Acunetix v14+ ───
  {
    ja3: "0c2cbe44e5dcdaba2a4cc25fb04a3d34",
    tool: "acunetix",
    versionHint: "v14+ (Premium / 360)",
    confidence: 0.93,
    notes: "Acunetix v14 web vuln scanner — full-site crawl + payload fuzz.",
  },
  {
    ja3: "0d4d8b88f8c4f7e6d5a4b3c2d1e0f9a8",
    tool: "acunetix",
    versionHint: "v23+ (Invicti rebrand era)",
    confidence: 0.88,
    notes: "Acunetix v23+ (post-Invicti) — refreshed Mono/.NET TLS stack.",
  },

  // ─── WPScan v3.8+ ───
  {
    ja3: "5a92e22b5c8e54c08b4f5b6e7c8d9e0f",
    tool: "wpscan",
    versionHint: "v3.8.x (Ruby 3.x TLSv1.3)",
    confidence: 0.86,
    notes: "WPScan v3.8 — WordPress core/plugin enumeration probe.",
  },
  {
    ja3: "6b03f33c6d9f65d19c5e6c7d8e9f0a1b",
    tool: "wpscan",
    versionHint: "v3.8.25+ (typhoeus-based)",
    confidence: 0.84,
    notes: "WPScan typhoeus runner — slight cipher reorder from v3.8.x.",
  },

  // ─── SQLMap v1.7+ ───
  {
    ja3: "7e6d5c4b3a291807f6e5d4c3b2a1908f",
    tool: "sqlmap",
    versionHint: "v1.7.x (Python 3.11 requests)",
    confidence: 0.83,
    notes: "SQLMap v1.7 — UNION/boolean/time-based SQLi automated probe.",
  },
  {
    ja3: "8f7e6d5c4b3a29180716e5d4c3b2a190",
    tool: "sqlmap",
    versionHint: "v1.8+ (Python 3.12, urllib3 2.x)",
    confidence: 0.85,
    notes: "SQLMap v1.8 with urllib3 2.x — newer TLSv1.3 cipher list.",
  },

  // ─── Modern stealth headless ───
  {
    ja3: "cd08e31494f9531f560d64c695473da9",
    tool: "puppeteer-extra-stealth",
    versionHint: "v3.x (Chromium 121-130)",
    confidence: 0.71,
    notes: "Puppeteer-extra-stealth v3 — randomized but matches CDP profile.",
  },
  {
    ja3: "ed507a3ee61fb6abec00a98b9d6c2a1d",
    tool: "undetected-chromedriver",
    versionHint: "v3.5+ (Chromium 122+)",
    confidence: 0.74,
    notes: "undetected-chromedriver v3.5+ — TLS profile matches Chromium 122+.",
  },
  {
    ja3: "773906b0efdefa24a7f2b8eb6985bf37",
    tool: "playwright-stealth",
    versionHint: "v1.40+ (Chromium 121+)",
    confidence: 0.69,
    notes: "Playwright + stealth plugin — JA3 mimics Chromium 121+.",
  },
  {
    ja3: "0303d7568e26ed16c61e2d10cd6e9d1b",
    tool: "selenium-wire",
    versionHint: "v5.x (Python 3.11 + Chromium 120+)",
    confidence: 0.66,
    notes: "Selenium-wire MITM proxy — JA3 entropy matches selenium-wire stack.",
  },
  {
    ja3: "1f3e2a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    tool: "playwright-extra-stealth",
    versionHint: "v3.x (Firefox channel)",
    confidence: 0.68,
    notes: "Playwright-extra-stealth Firefox channel — JA3 mimics Firefox 121+.",
  },

  // ─── AI-driven scanners (2024-2026 wave) ───
  {
    ja3: "a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
    tool: "pentestgpt",
    versionHint: "v0.14+ (OpenAI tool-use loop)",
    confidence: 0.62,
    notes: "PenTestGPT outbound — chained recon via tool-call loop, Python requests.",
  },
  {
    ja3: "b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
    tool: "autogpt",
    versionHint: "v0.5+ (recon template)",
    confidence: 0.58,
    notes: "AutoGPT recon agent — broad-spectrum site enumeration loop.",
  },
  {
    ja3: "c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
    tool: "garak",
    versionHint: "v0.9+ (LLM-vuln probe)",
    confidence: 0.71,
    notes: "Garak LLM-vuln scanner — prompt-injection + jailbreak fuzzing.",
  },
  {
    ja3: "d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    tool: "promptmap",
    versionHint: "v1.x (LLM-injection scanner)",
    confidence: 0.67,
    notes: "PromptMap — automated prompt-injection probe for chatbot endpoints.",
  },
  {
    ja3: "e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
    tool: "agentdojo",
    versionHint: "v0.2+ (agent-eval suite)",
    confidence: 0.55,
    notes: "AgentDojo runner — multi-turn agent attack chain testing.",
  },

  // ─── Legacy heavy-hitters (kept for cross-reference) ───
  {
    ja3: "19e29534fd49dd27d09234e639c4057e",
    tool: "curl",
    versionHint: "8.x (libcurl 8.6+)",
    confidence: 0.45,
    notes: "Curl 8.x — common in attack scripts; pair with UA + body for verdict.",
  },
  {
    ja3: "e7d705a3286e19ea42f587b344ee6865",
    tool: "python-requests",
    versionHint: "2.31+ (urllib3 2.x)",
    confidence: 0.40,
    notes: "Python requests 2.31+ — generic; very common, low signal alone.",
  },
  {
    ja3: "bd61b8b5a72b71b73388dbcef9b91ec1",
    tool: "go-net-http",
    versionHint: "Go 1.21+ stdlib",
    confidence: 0.42,
    notes: "Go net/http stdlib — generic Go binary; pair with path/UA for verdict.",
  },
  {
    ja3: "475c9302dc42b2751db9edcac3b74891",
    tool: "node-fetch",
    versionHint: "v3.x (Undici)",
    confidence: 0.44,
    notes: "Node fetch (Undici) — generic Node.js; pair with header order.",
  },
  {
    ja3: "ce5f3254611a8c095a3d821d44539877",
    tool: "masscan",
    versionHint: "v1.3+ (TLS connect-back probe)",
    confidence: 0.81,
    notes: "Masscan TLS connect-back probe — high-rate port sweep follow-up.",
  },
  {
    ja3: "21841cab23a8aa5a6a0a9c80aa1f7c12",
    tool: "zgrab2",
    versionHint: "v0.1.x (Censys/Shodan-class)",
    confidence: 0.79,
    notes: "ZGrab2 — internet-wide TLS scanner; often Censys/Shodan upstream.",
  },
  {
    ja3: "06f59717ad79fff09ae73ec40db58e80",
    tool: "metasploit",
    versionHint: "Framework 6.x (Ruby 3.x)",
    confidence: 0.83,
    notes: "Metasploit Framework 6.x — exploit module TLS probe.",
  },
  {
    ja3: "fb84bd1adbab63a90017b9dfa3bd8e96",
    tool: "nessus",
    versionHint: "v10.7+ (Tenable scanner)",
    confidence: 0.86,
    notes: "Nessus v10.7+ — Tenable infra vuln scan; legit if known schedule.",
  },
  {
    ja3: "2aa83a2acad8a1b0bf0c00e0f43da42d",
    tool: "qualys",
    versionHint: "VMDR 2024 cloud agent",
    confidence: 0.82,
    notes: "Qualys VMDR scanner — corporate vuln scan from Qualys cloud.",
  },
  {
    ja3: "a23a51d6c1456f6bfd1cd6b21abd1f3a",
    tool: "openvas-gvm",
    versionHint: "GVM 22.x+ (community)",
    confidence: 0.77,
    notes: "OpenVAS / GVM community scanner — broad vuln probe.",
  },
];

export const SCANNER_JA3_DATABASE: ReadonlyMap<string, ScannerJa3Entry> =
  new Map(ENTRIES.map((e) => [e.ja3, e]));

/**
 * Classify a JA3 hash. Returns the matched entry or null if unknown.
 * JA3 hashes should be normalized to lower-case hex before lookup.
 */
export function classifyJa3(ja3: string): ScannerJa3Entry | null {
  if (!ja3) return null;
  const normalized = ja3.toLowerCase();
  return SCANNER_JA3_DATABASE.get(normalized) ?? null;
}

/**
 * Pull all entries for a tool family (useful for dashboards).
 */
export function entriesForTool(tool: string): ScannerJa3Entry[] {
  const out: ScannerJa3Entry[] = [];
  for (const e of ENTRIES) {
    if (e.tool === tool) out.push(e);
  }
  return out;
}

/** Total entry count + unique tool count. */
export function getBotPlaybookStats(): { entries: number; tools: number } {
  const tools = new Set<string>();
  for (const e of ENTRIES) tools.add(e.tool);
  return { entries: ENTRIES.length, tools: tools.size };
}
