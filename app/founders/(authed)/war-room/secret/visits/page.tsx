import { Globe2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { SecretEmptyState } from "@/components/app/SecretEmptyState";
import { loadRecentVisitors } from "@/lib/tracking/queries";
import { relTime } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default async function SecretVisitsPage() {
  const { visitors, schemaMissing } = await loadRecentVisitors(80);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Secret · Visits"
        subtitle="Live table of recent visitors. Hash-anonymized; no PII unless they submit the demo form."
        actions={
          <StatusPill tone="accent">
            <Globe2 className="h-3 w-3" />
            Last {visitors.length}
          </StatusPill>
        }
      />

      {schemaMissing || visitors.length === 0 ? (
        <SecretEmptyState
          schemaMissing={schemaMissing}
          title={
            schemaMissing
              ? "Tracking schema not live yet"
              : "No visits yet — share a link and refresh."
          }
        />
      ) : (
        <section className="g-card overflow-hidden">
          <header className="px-5 py-3 border-b border-g-border-subtle flex items-center justify-between">
            <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
              {visitors.length} visitors · most recent first
            </h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-success">
              Live
            </span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                <tr className="border-b border-g-border-subtle">
                  <th className="text-left px-5 py-2.5">When</th>
                  <th className="text-left px-3 py-2.5">Visitor</th>
                  <th className="text-left px-3 py-2.5">Source</th>
                  <th className="text-left px-3 py-2.5">Campaign</th>
                  <th className="text-left px-3 py-2.5">Geo</th>
                  <th className="text-left px-3 py-2.5">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-g-border-subtle/60 hover:bg-g-surface-2/40"
                  >
                    <td className="px-5 py-2.5 font-mono text-g-text-muted whitespace-nowrap">
                      {relTime(v.lastSeenAt)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-g-text">
                      {v.visitorHash.slice(0, 10)}…
                    </td>
                    <td className="px-3 py-2.5">
                      {v.utmSource ? (
                        <StatusPill tone="info">{v.utmSource}</StatusPill>
                      ) : (
                        <span className="text-g-text-faint">direct</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-g-text-muted truncate max-w-[200px]">
                      {v.utmCampaign || "—"}
                      {v.utmMedium && (
                        <span className="ml-2 text-g-text-faint text-[10px]">
                          / {v.utmMedium}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-g-text-muted whitespace-nowrap">
                      {[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-g-text-faint truncate max-w-[260px] font-mono text-[11px]">
                      {v.referrer || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
