import { redirect } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/app/ui/Button";
import { PrintButton } from "./_components/PrintButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Print labels · GladiusTurf",
  robots: { index: false, follow: false },
};

type LabelRow = {
  unitId: string;
  qrCode: string;
  qrPng: string;
  sku: string;
  name: string;
  receivedAt: string;
};

async function loadLabels(
  tenantId: string,
  ids: string[] | null,
): Promise<LabelRow[]> {
  const sb = supabaseAdmin();
  let query = sb
    .from("inventory_units")
    .select(
      "id, qr_code, received_at, item:inventory_items!inner(sku, name, tenant_id)",
    )
    .eq("tenant_id", tenantId)
    .eq("status", "in_stock")
    .order("received_at", { ascending: false });
  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  } else {
    query = query.limit(60);
  }
  const { data, error } = await query;
  if (error) {
    console.warn("loadLabels error", error);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    qr_code: string;
    received_at: string;
    item:
      | { sku: string; name: string }
      | { sku: string; name: string }[];
  }>;

  // Generate all QR PNGs in parallel.
  const labels = await Promise.all(
    rows.map(async (r) => {
      const item = Array.isArray(r.item) ? r.item[0] : r.item;
      const png = await QRCode.toDataURL(r.qr_code, {
        margin: 0,
        width: 220,
        color: { dark: "#0a0a0a", light: "#ffffff" },
      });
      return {
        unitId: r.id,
        qrCode: r.qr_code,
        qrPng: png,
        sku: item?.sku ?? "—",
        name: item?.name ?? "Unknown",
        receivedAt: r.received_at,
      } satisfies LabelRow;
    }),
  );
  return labels;
}

export default async function LabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  const sp = await searchParams;
  const ids = sp.ids
    ? sp.ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const labels = await loadLabels(session.tenant.id, ids);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/app/inventory" prefetch>
            <Button variant="ghost" size="sm" type="button">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to inventory
            </Button>
          </Link>
          <h1 className="text-[18px] font-medium text-g-text">
            Print labels
            <span className="ml-2 text-[12px] text-g-text-muted">
              {labels.length} unit{labels.length === 1 ? "" : "s"}
              {ids ? " · filtered" : " · most recent in stock"}
            </span>
          </h1>
        </div>
        <PrintButton />
      </div>

      {labels.length === 0 ? (
        <div className="g-card p-10 text-center text-[13px] text-g-text-muted print:hidden">
          Nothing to print.{" "}
          {ids ? "None of those unit IDs match your inventory." : "Receive units first."}
        </div>
      ) : (
        <div
          className="grid grid-cols-3 gap-2 print:gap-0"
          style={{
            // 30-up Avery 5160: 3 cols × 10 rows on letter paper.
            // The grid below works on screen and ports cleanly to print.
            gridAutoRows: "minmax(96px, auto)",
          }}
        >
          {labels.map((l) => (
            <div
              key={l.unitId}
              className="g-card flex items-center gap-3 px-3 py-2 print:border print:border-black print:rounded-none print:bg-white print:break-inside-avoid"
              style={{ minHeight: "1in" }}
            >
              <img
                src={l.qrPng}
                alt={l.qrCode}
                width={72}
                height={72}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-geist-mono text-[11px] text-g-text print:text-black truncate">
                  {l.qrCode}
                </div>
                <div className="text-[12px] font-medium text-g-text print:text-black truncate">
                  {l.sku}
                </div>
                <div className="text-[11px] text-g-text-muted print:text-black/70 truncate">
                  {l.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
