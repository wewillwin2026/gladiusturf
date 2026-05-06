import { redirect } from "next/navigation";
import {
  CloudLightning,
  Crown,
  Languages,
  MapPin,
  Shield,
  Wind,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { StormActivateButton } from "./_components/StormActivateButton";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Storm Mode · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Storm Mode — productized hurricane / weather-event response. The demo
 * workspace shipped this first (Bright Lights case study); this is the
 * tenant-aware production version that gates on actual customer ZIPs.
 *
 * v1: pre-baked Florida hurricane ZIPs (Helene + Milton 2024 footprint).
 * v2 will pull live NOAA active storms once the integration ships.
 */

// Florida ZIPs that took the brunt of Helene + Milton 2024. Pre-baked so a
// tenant who lives in any of these can see Storm Mode go from theory to
// triggered without an external feed dependency on day one.
const FL_HURRICANE_ZIPS = new Set([
  "33301", "33602", "33701", "33606", "33611", "33612", "33616", "33617",
  "33619", "33625", "33626", "33629", "33647",
  "34102", "34103", "34108", "34110", "34112", "34113", "34114",
  "34201", "34202", "34203", "34205", "34207", "34208", "34209", "34210",
  "34211", "34212", "34215", "34217", "34219", "34221",
  "34228", "34229", "34230", "34231", "34232", "34233", "34234", "34236",
  "34237", "34238", "34239", "34240", "34241", "34242", "34243",
  "33950", "33952", "33953", "33954", "33955", "33980", "33981", "33983",
]);

const RECENT_STORMS = [
  {
    name: "Helene",
    date: "September 2024",
    landfall: "Sept 26, 2024 · Big Bend FL → Sarasota outer bands",
  },
  {
    name: "Milton",
    date: "October 2024",
    landfall: "Oct 9, 2024 · Siesta Key direct hit",
  },
];

type CustomerRow = {
  id: string;
  customer_tier: string | null;
  service_address: { zip?: string } | null;
};

export default async function StormModePage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  const sb = supabaseAdmin();
  const { data: customers, error } = await sb
    .from("customers")
    .select("id, customer_tier, service_address")
    .eq("tenant_id", session.tenant.id);

  if (error) {
    console.warn("Storm Mode customers query failed", error);
  }

  const rows = (customers ?? []) as CustomerRow[];

  if (rows.length === 0) {
    return (
      <TenantEmptyState
        engine="Storm Mode"
        tenant={session.tenant}
        icon={CloudLightning}
        body="Storm Mode activates when a named storm hits your service area — the system queues a bilingual check-in to every customer in the affected ZIPs and prioritizes top-tier maintenance plan members. Add customers first; Storm Mode reads ZIPs from your service-address column."
      />
    );
  }

  const inStormZips = rows.filter((c) => {
    const zip = c.service_address?.zip;
    return zip && FL_HURRICANE_ZIPS.has(zip);
  });
  const guardianCount = rows.filter(
    (c) => (c.customer_tier ?? "").toLowerCase().includes("guardian"),
  ).length;
  const inStormCount = inStormZips.length;
  const inStormGuardian = inStormZips.filter(
    (c) => (c.customer_tier ?? "").toLowerCase().includes("guardian"),
  ).length;
  const inStormZipSet = new Set(
    inStormZips
      .map((c) => c.service_address?.zip)
      .filter((z): z is string => typeof z === "string"),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Reactive revenue`}
        title="Storm Mode — productized hurricane response."
        subtitle="One toggle queues a bilingual check-in to every customer in the affected ZIPs. Top-tier plan members jump the queue."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Customers in storm ZIPs"
          value={String(inStormCount)}
          delta={`${inStormCount} of ${rows.length} total`}
          trend={inStormCount > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Guardian members"
          value={String(guardianCount)}
          delta={
            guardianCount > 0
              ? `${inStormGuardian} in storm ZIPs`
              : "no Guardian tier yet"
          }
          trend={guardianCount > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Affected ZIPs"
          value={String(inStormZipSet.size)}
          delta={`${FL_HURRICANE_ZIPS.size} watched`}
          trend="flat"
        />
        <KPICard
          label="Last activated"
          value="—"
          delta="not yet armed"
          trend="flat"
        />
      </section>

      <section
        className="g-card p-6 flex flex-col gap-4 relative overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(239,68,68,0.16) 0%, rgba(239,68,68,0.04) 50%, transparent 80%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-g-danger/15 text-g-danger border border-g-danger/40">
              <CloudLightning className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-danger">
                Hurricane response
              </span>
              <h2 className="text-[17px] font-medium text-g-text mt-0.5">
                Pre-built · Helene + Milton 2024 footprint
              </h2>
            </div>
          </div>
          <StormActivateButton
            inStormCount={inStormCount}
            guardianCount={inStormGuardian}
          />
        </div>

        <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2">
          {RECENT_STORMS.map((s) => (
            <div
              key={s.name}
              className="rounded-md px-4 py-3 bg-g-surface border border-g-border-subtle"
            >
              <div className="flex items-center gap-2">
                <Wind className="h-3.5 w-3.5 text-g-danger" />
                <span className="text-[11px] uppercase tracking-[0.12em] text-g-danger">
                  Hurricane {s.name}
                </span>
              </div>
              <div className="mt-1.5 text-[13px] text-g-text">{s.date}</div>
              <div className="mt-0.5 text-[11px] text-g-text-faint">
                {s.landfall}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="g-card overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              One-click campaign
            </span>
            <span className="font-geist-mono text-[11px] text-g-text-faint">
              {inStormCount} customers · {inStormZipSet.size} ZIPs
            </span>
          </header>
          <div className="px-5 py-5">
            <p className="text-[13px] leading-[1.55] text-g-text-muted">
              When the National Hurricane Center declares a named storm
              landfall in your service area, Storm Mode queues a pre-built
              campaign. Approve once, and every customer in the affected ZIPs
              gets:
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              <PlaybookStep
                icon={Languages}
                title="Bilingual check-in offer"
                detail="English + Spanish auto-personalized to your brand voice. Replies route back to your inbox."
              />
              <PlaybookStep
                icon={Crown}
                title="Top-tier plan priority queue"
                detail="Customers on your highest maintenance tier jump ahead. 24-hour SLA after named storms is the differentiator that closes the upsell next quarter."
                tone="accent"
              />
              <PlaybookStep
                icon={MapPin}
                title="Geographic targeting"
                detail={`Sends only to customers in affected ZIPs (${FL_HURRICANE_ZIPS.size} watched). No spam to inland customers who didn't see weather.`}
              />
              <PlaybookStep
                icon={Shield}
                title="Photo capture on arrival"
                detail="Every visit logs before/after photos. Insurance documentation. Customer trust. Repeatable."
              />
            </ul>
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <div className="g-card p-4">
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Sample message · EN
            </span>
            <p className="mt-2 text-[12px] leading-[1.55] italic text-g-text">
              Hi {`{{first_name}}`} — checking in after the storm. If your
              lighting system has any damage, reply or click below to book a
              priority repair window. — {session.tenant.display_name}
            </p>
          </div>
          <div className="g-card p-4">
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Mensaje · ES
            </span>
            <p className="mt-2 text-[12px] leading-[1.55] italic text-g-text">
              Hola {`{{first_name}}`} — pasando a saludar después de la
              tormenta. Si su sistema de iluminación tiene algún daño,
              responda o reserve una ventana de reparación prioritaria. —{" "}
              {session.tenant.display_name}
            </p>
          </div>
          <div className="g-card p-4 bg-g-accent-faint/40 border-g-accent/30">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-g-accent" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-accent">
                Why this matters
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-[1.55] text-g-text-muted">
              Helene and Milton in 2024 drove the biggest reactive call-volume
              spike of the year for Florida outdoor-services. Productizing it
              means you stop scrambling at 4 a.m. on a Sunday — the system has
              already booked the route by the time the rain stops.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function PlaybookStep({
  icon: Icon,
  title,
  detail,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  tone?: "accent";
}) {
  const isAccent = tone === "accent";
  return (
    <li className="flex items-start gap-3">
      <span
        className={
          isAccent
            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-g-accent-faint text-g-accent border border-g-accent/40"
            : "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-g-surface-2 text-g-text-muted border border-g-border-subtle"
        }
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-medium text-g-text">{title}</div>
        <p className="mt-0.5 text-[12px] leading-[1.55] text-g-text-muted">
          {detail}
        </p>
      </div>
    </li>
  );
}
