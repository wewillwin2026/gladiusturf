import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { WORK_ORDERS, customerById } from "@/lib/demo-data/meridian-grounds";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = customerById(id);
  if (!property) notFound();
  const orders = WORK_ORDERS.filter((w) => w.propertyId === property.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/demo/meridian-grounds/properties"
        className="inline-flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--mg-text-muted)" }}
      >
        <ArrowLeft className="h-3 w-3" /> All properties
      </Link>

      <header className="flex flex-col gap-2">
        <span className="mg-eyebrow-muted">Property · {property.id}</span>
        <h1
          className="mg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--mg-text)" }}
        >
          {property.propertyName}
        </h1>
        <p className="text-[13px]" style={{ color: "var(--mg-text-muted)" }}>
          {property.customerName} · {property.address} · {property.zip} ·{" "}
          {property.acreage} ac
        </p>
        {property.coiOnFile && (
          <p
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(157,255,138,0.06)",
              border: "1px solid rgba(157,255,138,0.30)",
              color: "var(--mg-text)",
            }}
          >
            <ShieldCheck
              className="h-3.5 w-3.5"
              style={{ color: "var(--mg-success)" }}
            />
            COI on file · expires {property.coiExpiry}
          </p>
        )}
        {property.notes && (
          <p
            className="rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(107,148,214,0.08)",
              border: "1px solid rgba(107,148,214,0.30)",
              color: "var(--mg-text-muted)",
            }}
          >
            <strong style={{ color: "var(--mg-text)" }}>Note:</strong>{" "}
            {property.notes}
          </p>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Fact label="Contract / mo" value={money(property.contractMonthlyCents)} />
        <Fact label="NTE ceiling" value={money(property.nteCeilingCents)} />
        <Fact label="Scope" value={property.scope} />
      </section>

      <section className="mg-card overflow-hidden">
        <header
          className="border-b px-5 py-3"
          style={{ borderColor: "var(--mg-border)" }}
        >
          <h2 className="mg-eyebrow">Work orders</h2>
        </header>
        {orders.length === 0 ? (
          <p className="px-5 py-6 text-[13px]" style={{ color: "var(--mg-text-muted)" }}>
            No work orders on this property yet.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--mg-border)" }}>
            {orders.map((w) => (
              <li
                key={w.id}
                className="grid grid-cols-1 gap-1 px-5 py-3 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-4"
              >
                <div>
                  <div style={{ color: "var(--mg-text)" }}>{w.description}</div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--mg-text-faint)" }}
                  >
                    {w.approvedAt
                      ? `approved ${w.approvedAt}`
                      : "awaiting approval"}
                    {w.startDate && ` · start ${w.startDate}`}
                  </div>
                </div>
                <span
                  className="mg-pill"
                  style={{
                    color:
                      w.status === "complete"
                        ? "var(--mg-success)"
                        : w.status === "denied"
                          ? "var(--mg-alert)"
                          : w.status === "submitted"
                            ? "var(--mg-warning)"
                            : "var(--mg-accent)",
                    background:
                      w.status === "complete"
                        ? "rgba(157,255,138,0.10)"
                        : w.status === "denied"
                          ? "rgba(232,95,95,0.10)"
                          : w.status === "submitted"
                            ? "rgba(244,184,96,0.10)"
                            : "rgba(107,148,214,0.08)",
                    borderColor:
                      w.status === "complete"
                        ? "rgba(157,255,138,0.40)"
                        : w.status === "denied"
                          ? "rgba(232,95,95,0.40)"
                          : w.status === "submitted"
                            ? "rgba(244,184,96,0.40)"
                            : "rgba(107,148,214,0.30)",
                  }}
                >
                  {w.status.replace("_", " ")}
                </span>
                <span
                  className="mg-mono text-right"
                  style={{ color: "var(--mg-text)" }}
                >
                  {money(w.estimateCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="mg-card flex flex-col gap-1 p-4">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--mg-text-faint)" }}
      >
        {label}
      </span>
      <div
        className="mg-serif text-[15px]"
        style={{ color: "var(--mg-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
