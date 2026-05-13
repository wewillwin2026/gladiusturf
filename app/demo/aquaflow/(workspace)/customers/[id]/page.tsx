import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import {
  BACKFLOWS,
  ROUTES,
  customerById,
} from "@/lib/demo-data/aquaflow";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customerById(id);
  if (!customer) notFound();
  const route = ROUTES.find((r) => r.id === customer.route);
  const backflows = BACKFLOWS.filter((b) => b.customerId === customer.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/demo/aquaflow/customers"
        className="inline-flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--af-text-muted)" }}
      >
        <ArrowLeft className="h-3 w-3" /> All customers
      </Link>

      <header className="flex flex-col gap-2">
        <span className="af-eyebrow-muted">Customer · {customer.id}</span>
        <h1
          className="af-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--af-text)" }}
        >
          {customer.name}
        </h1>
        <p className="text-[13px]" style={{ color: "var(--af-text-muted)" }}>
          {customer.address} · {customer.zip}
        </p>
        {customer.notes && (
          <p
            className="rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(77,196,178,0.08)",
              border: "1px solid rgba(77,196,178,0.30)",
              color: "var(--af-text-muted)",
            }}
          >
            <strong style={{ color: "var(--af-text)" }}>Note:</strong>{" "}
            {customer.notes}
          </p>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Fact label="Service route" value={`${route?.weekday} · ${route?.techName}`} />
        <Fact label="System" value={`${customer.zones} zones · ${customer.controller}`} />
        <Fact label="Monthly value" value={`$${customer.monthlyValue}`} />
      </section>

      <section className="af-card overflow-hidden">
        <header className="border-b px-5 py-3" style={{ borderColor: "var(--af-border)" }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--af-accent)" }} />
            <h2 className="af-eyebrow">Backflow filings on this property</h2>
          </div>
        </header>
        {backflows.length === 0 ? (
          <p className="px-5 py-6 text-[13px]" style={{ color: "var(--af-text-muted)" }}>
            No backflow assembly on file.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--af-border)" }}>
            {backflows.map((b) => (
              <li
                key={b.id}
                className="grid grid-cols-1 gap-1 px-5 py-3 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-3"
              >
                <div>
                  <div style={{ color: "var(--af-text)" }}>{b.assemblyType}</div>
                  <div className="text-[11px]" style={{ color: "var(--af-text-faint)" }}>
                    SN {b.serialNo} · files to {b.utilityPortal} · cert {b.technicianCertNo}
                  </div>
                </div>
                <span
                  className="af-pill"
                  style={{
                    background:
                      b.status === "current"
                        ? "rgba(157,255,138,0.10)"
                        : b.status === "due_soon"
                          ? "rgba(244,184,96,0.10)"
                          : "rgba(232,95,95,0.10)",
                    color:
                      b.status === "current"
                        ? "var(--af-success)"
                        : b.status === "due_soon"
                          ? "var(--af-warning)"
                          : "var(--af-alert)",
                    borderColor:
                      b.status === "current"
                        ? "rgba(157,255,138,0.30)"
                        : b.status === "due_soon"
                          ? "rgba(244,184,96,0.30)"
                          : "rgba(232,95,95,0.30)",
                  }}
                >
                  {b.status.replace("_", " ")}
                </span>
                <span className="text-[11px]" style={{ color: "var(--af-text-faint)" }}>
                  due {b.nextDueDate}
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
    <div className="af-card flex flex-col gap-1 p-4">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--af-text-faint)" }}
      >
        {label}
      </span>
      <div className="af-serif text-[16px]" style={{ color: "var(--af-text)" }}>
        {value}
      </div>
    </div>
  );
}
