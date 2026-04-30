import { rng } from "@/lib/shared/prng";
import { SERVICE_RATES } from "@/lib/shared/pricing";
import type { Customer, Job, JobStatus } from "@/lib/shared/types";
import { crewIdForRoute } from "./seed-crews";

const SERVICE_NAMES = SERVICE_RATES.map((s) => s.name);
const STATUS_FOR_PAST: JobStatus[] = ["Complete", "Complete", "Complete", "Complete", "Skipped"];

export function buildJobs(customers: Customer[], yearsBack = 3): Job[] {
  const r = rng(2026);
  const jobs: Job[] = [];
  const activeCustomers = customers.filter((c) => c.status !== "Cancelled");
  const now = Date.now();

  // Past jobs: ~visits/customer over yearsBack years.
  for (const c of activeCustomers) {
    const cadenceDays = c.tier === "Enterprise" ? 7 : c.tier === "Pro" ? 14 : 21;
    const totalVisits = Math.floor((yearsBack * 365) / cadenceDays);
    for (let v = 0; v < totalVisits; v++) {
      const daysAgo = (totalVisits - v) * cadenceDays + r.int(-2, 2);
      const ts = new Date(now - daysAgo * 86400000);
      ts.setHours(r.int(7, 17), r.pick([0, 15, 30, 45]), 0, 0);
      const service = r.pick(SERVICE_NAMES);
      jobs.push({
        id: `jb_${jobs.length + 1}`,
        customerId: c.id,
        scheduledAt: ts.toISOString(),
        durationMin: r.pick([30, 45, 60, 75, 90]),
        crewId: crewIdForRoute(c.routeId),
        status: r.pick(STATUS_FOR_PAST),
        service,
        priceCents: r.int(45, 180) * 100,
      });
    }
  }

  // Upcoming jobs (next 14 days).
  for (let d = 0; d < 14; d++) {
    const day = new Date(now + d * 86400000);
    if (day.getUTCDay() === 0) continue; // skip Sundays
    const slots = r.int(8, 14);
    for (let s = 0; s < slots; s++) {
      const c = r.pick(activeCustomers);
      const ts = new Date(day);
      ts.setHours(r.int(7, 16), r.pick([0, 30]), 0, 0);
      jobs.push({
        id: `jb_${jobs.length + 1}`,
        customerId: c.id,
        scheduledAt: ts.toISOString(),
        durationMin: r.pick([45, 60, 75, 90]),
        crewId: crewIdForRoute(c.routeId),
        status: d === 0 && ts.getTime() < now ? r.pick(["EnRoute", "OnSite", "Complete"]) : "Scheduled",
        service: r.pick(SERVICE_NAMES),
        priceCents: r.int(60, 220) * 100,
      });
    }
  }

  // Sort by scheduledAt asc.
  jobs.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  return jobs;
}
