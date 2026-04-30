import { DollarSign } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { SecretEmptyState } from "@/components/app/SecretEmptyState";
import { loadAttribution } from "@/lib/tracking/queries";
import { money, num } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default async function SecretAttributionPage() {
  const { rows, schemaMissing } = await loadAttribution();
  const total = rows.reduce(
    (s, r) => ({
      visitors: s.visitors + r.visitors,
      bookings: s.bookings + r.demoBookings,
      signed: s.signed + r.signedDeals,
      revenue: s.revenue + r.revenueCents,
    }),
    { visitors: 0, bookings: 0, signed: 0, revenue: 0 },
  );

  const maxRev = Math.max(1, ...rows.map((r) => r.revenueCents));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Founders Only"
        title="Secret · Attribution"
        subtitle="UTM source → demo bookings → signed deals → revenue. Joined to demo_requests."
        actions={
          <StatusPill tone="success">
            <DollarSign className="h-3 w-3" />
            {money(total.revenue)} attributed
          </StatusPill>
        }
      />

      {schemaMissing || rows.length === 0 ? (
        <SecretEmptyState
          schemaMissing={schemaMissing}
          title={
            schemaMissing
              ? "Tracking schema not live yet"
              : "No attributable visits yet."
          }
        />
      ) : (
        <section className="g-card overflow-hidden">
          <header className="px-5 py-3 border-b border-g-border-subtle">
            <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
              By UTM source · all time
            </h2>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                <tr className="border-b border-g-border-subtle">
                  <th className="text-left px-5 py-2.5">Source</th>
                  <th className="text-right px-3 py-2.5">Visitors</th>
                  <th className="text-right px-3 py-2.5">Bookings</th>
                  <th className="text-right px-3 py-2.5">Signed</th>
                  <th className="text-right px-3 py-2.5">Conv.</th>
                  <th className="text-right px-3 py-2.5">Revenue</th>
                  <th className="text-right px-5 py-2.5">Share</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const conv =
                    r.visitors > 0 ? (r.signedDeals / r.visitors) * 100 : 0;
                  const sharePct = (r.revenueCents / maxRev) * 100;
                  return (
                    <tr
                      key={r.source}
                      className="border-b border-g-border-subtle/60 hover:bg-g-surface-2/40"
                    >
                      <td className="px-5 py-2.5 text-g-text">
                        <StatusPill
                          tone={r.source === "direct" ? "neutral" : "info"}
                        >
                          {r.source}
                        </StatusPill>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-g-text-muted text-right">
                        {num(r.visitors)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-g-text-muted text-right">
                        {num(r.demoBookings)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-g-text text-right">
                        {num(r.signedDeals)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-g-info text-right">
                        {conv.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5 font-mono text-g-accent text-right">
                        {money(r.revenueCents)}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="h-1.5 rounded-full bg-g-surface-2 overflow-hidden">
                          <div
                            className="h-full bg-g-accent"
                            style={{ width: `${sharePct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-g-border-subtle text-g-text">
                  <td className="px-5 py-3 font-medium">Total</td>
                  <td className="px-3 py-3 font-mono text-right">
                    {num(total.visitors)}
                  </td>
                  <td className="px-3 py-3 font-mono text-right">
                    {num(total.bookings)}
                  </td>
                  <td className="px-3 py-3 font-mono text-right">
                    {num(total.signed)}
                  </td>
                  <td className="px-3 py-3"></td>
                  <td className="px-3 py-3 font-mono text-g-accent text-right">
                    {money(total.revenue)}
                  </td>
                  <td className="px-5 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
