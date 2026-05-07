/**
 * Rate-limit covenant test — accompanies the consent-gate test under
 * Buffett's "every block adds a board to the moat fence" rule.
 *
 * Run via:
 *   npm run test:rate-limit
 */

import { consume, ipKey } from "../lib/rate-limit/token-bucket";

let failures = 0;
const fail = (name: string, msg: string) => {
  console.error(`  FAIL  ${name}\n        ${msg}`);
  failures += 1;
};
const pass = (name: string) => console.log(`  PASS  ${name}`);

// ---- ipKey ----
{
  const name = "ipKey: empty → anon";
  if (ipKey("") === "anon") pass(name);
  else fail(name, "expected 'anon'");
}
{
  const name = "ipKey: ipv4 → /24";
  if (ipKey("192.168.1.42") === "v4:192.168.1") pass(name);
  else fail(name, "expected v4:192.168.1");
}
{
  const name = "ipKey: ipv4 with comma list → first /24";
  if (ipKey("203.0.113.5, 10.0.0.1") === "v4:203.0.113") pass(name);
  else fail(name, "expected v4:203.0.113");
}
{
  const name = "ipKey: ipv6 → /48";
  if (ipKey("2001:0db8:85a3::8a2e:0370:7334") === "v6:2001:0db8:85a3")
    pass(name);
  else fail(name, "expected v6:2001:0db8:85a3");
}

// ---- consume ----
{
  const name = "first call → allowed, remaining=capacity-1";
  const res = consume("test:fresh:" + Math.random(), {
    capacity: 5,
    refillPerSec: 1,
  });
  if (res.allowed && res.remaining === 4) pass(name);
  else fail(name, `got ${JSON.stringify(res)}`);
}
{
  const name = "burst-then-block: capacity=3 burst, 4th rejected";
  const key = "test:burst:" + Math.random();
  const opts = { capacity: 3, refillPerSec: 0.0001 }; // refill ≈ never
  const r1 = consume(key, opts);
  const r2 = consume(key, opts);
  const r3 = consume(key, opts);
  const r4 = consume(key, opts);
  if (r1.allowed && r2.allowed && r3.allowed && !r4.allowed) pass(name);
  else
    fail(
      name,
      `expected first 3 allowed and 4th blocked, got ${JSON.stringify([r1, r2, r3, r4])}`,
    );
}
{
  const name = "rejected call returns retryAfterMs > 0";
  const key = "test:retry:" + Math.random();
  const opts = { capacity: 1, refillPerSec: 0.001 }; // 1000s for next token
  consume(key, opts); // burn the only token
  const r = consume(key, opts);
  if (!r.allowed && r.retryAfterMs > 0) pass(name);
  else fail(name, `got ${JSON.stringify(r)}`);
}
{
  const name = "different keys are independent";
  const a = consume("test:isolation-a:" + Math.random(), {
    capacity: 1,
    refillPerSec: 0.001,
  });
  const b = consume("test:isolation-b:" + Math.random(), {
    capacity: 1,
    refillPerSec: 0.001,
  });
  if (a.allowed && b.allowed) pass(name);
  else fail(name, `expected both allowed, got ${JSON.stringify([a, b])}`);
}

if (failures > 0) {
  console.error(`\n${failures} rate-limit test(s) failed.`);
  process.exit(1);
}
console.log("\nAll rate-limit cases pass.");
