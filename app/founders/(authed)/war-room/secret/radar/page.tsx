import { Radar } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { LiveRadar } from "@/components/founders/LiveRadar";
import { loadLiveRadar } from "@/lib/tracking/queries";

export const dynamic = "force-dynamic";

/**
 * Live Visitor Radar — the headline founders surface. Who is on
 * gladiusturf.com right now, ranked by heat. Server-renders the first
 * frame for an instant paint, then <LiveRadar> polls /api/founders/radar
 * every 5s. Founder/own traffic is excluded upstream at /api/track, so
 * every blip is a real prospect.
 */
export default async function SecretRadarPage() {
  const initial = await loadLiveRadar();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Live Radar"
        subtitle="Everyone on gladiusturf.com right now, hottest first. Live-polling, hash-anonymized, your own traffic filtered out."
        actions={
          <StatusPill tone="accent">
            <Radar className="h-3 w-3" />
            {initial.blips.length} on radar
          </StatusPill>
        }
      />
      <LiveRadar initial={initial} />
    </div>
  );
}
