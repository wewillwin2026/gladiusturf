/**
 * Consent-gate covenant test (Buffett 2026-05-06).
 *
 * "No new tenant-facing surface ships until the moat fence has one
 * more board nailed on." This script asserts the pure-function gate
 * decides correctly across the eight cases below. Run via:
 *
 *   npm run test:consent
 *
 * No test framework — single-file zero-dep script. Exits 1 on any
 * failure so CI can pick it up.
 */

import { decideConsent } from "../lib/messaging/consent";

type Case = {
  name: string;
  consent: Parameters<typeof decideConsent>[0]["consent"];
  settings: Parameters<typeof decideConsent>[0]["settings"];
  now: Date;
  expect: { ok: true } | { ok: false; reason: string };
};

// Wednesday May 7 2026, 14:00 UTC = 10:00 EDT — well inside business
// hours for the default America/New_York settings.
const businessHours = new Date(Date.UTC(2026, 4, 7, 14, 0, 0));

// Wednesday May 7 2026, 02:00 UTC = 22:00 EDT prior day — inside the
// 8pm–8am quiet window.
const lateNight = new Date(Date.UTC(2026, 4, 7, 2, 0, 0));

// Sunday May 10 2026, 14:00 UTC = 10:00 EDT — Sunday is weekday=0.
const sunday = new Date(Date.UTC(2026, 4, 10, 14, 0, 0));

const defaultSettings = {
  quiet_hours_start: 20,
  quiet_hours_end: 8,
  blocked_weekdays: "",
  timezone: "America/New_York",
};

const cases: Case[] = [
  {
    name: "no consent row → no_consent",
    consent: null,
    settings: defaultSettings,
    now: businessHours,
    expect: { ok: false, reason: "no_consent" },
  },
  {
    name: "opted_out → opted_out",
    consent: { status: "opted_out", revoked_at: null },
    settings: defaultSettings,
    now: businessHours,
    expect: { ok: false, reason: "opted_out" },
  },
  {
    name: "revoked_at set → opted_out",
    consent: { status: "opted_in", revoked_at: "2026-05-01T12:00:00Z" },
    settings: defaultSettings,
    now: businessHours,
    expect: { ok: false, reason: "opted_out" },
  },
  {
    name: "pending → no_consent",
    consent: { status: "pending", revoked_at: null },
    settings: defaultSettings,
    now: businessHours,
    expect: { ok: false, reason: "no_consent" },
  },
  {
    name: "opted_in + business hours → ok",
    consent: { status: "opted_in", revoked_at: null },
    settings: defaultSettings,
    now: businessHours,
    expect: { ok: true },
  },
  {
    name: "opted_in + quiet hours → quiet_hours",
    consent: { status: "opted_in", revoked_at: null },
    settings: defaultSettings,
    now: lateNight,
    expect: { ok: false, reason: "quiet_hours" },
  },
  {
    name: "opted_in + Sunday with Sunday blocked → blocked_day",
    consent: { status: "opted_in", revoked_at: null },
    settings: { ...defaultSettings, blocked_weekdays: "0" },
    now: sunday,
    expect: { ok: false, reason: "blocked_day" },
  },
  {
    name: "opted_in + Sunday with Sunday NOT blocked → ok",
    consent: { status: "opted_in", revoked_at: null },
    settings: defaultSettings,
    now: sunday,
    expect: { ok: true },
  },
  // DST sanity: November 8 2026, 13:30 UTC = 8:30 EST (winter), inside
  // quiet window because EST 8:30 is inside the 8pm–8am wrap window
  // (window is `hour >= 20 OR hour < 8`, and 8 is not < 8). So actually
  // 8:30 should be OUTSIDE quiet → ok. This catches the old
  // toLocaleString-then-parse bug which mistakenly returned UTC hour.
  {
    name: "DST transition (post fall-back EST 8:30) → ok",
    consent: { status: "opted_in", revoked_at: null },
    settings: defaultSettings,
    now: new Date(Date.UTC(2026, 10, 8, 13, 30, 0)),
    expect: { ok: true },
  },
];

let failures = 0;
for (const c of cases) {
  const got = decideConsent({
    consent: c.consent,
    settings: c.settings,
    now: c.now,
  });
  const okMatches = got.ok === c.expect.ok;
  const reasonMatches =
    got.ok && c.expect.ok
      ? true
      : !got.ok && !c.expect.ok && got.reason === c.expect.reason;
  if (okMatches && reasonMatches) {
    console.log(`  PASS  ${c.name}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${c.name}`);
    console.error(`        expected ${JSON.stringify(c.expect)}`);
    console.error(`        got      ${JSON.stringify(got)}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} consent-gate test(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} consent-gate cases pass.`);
