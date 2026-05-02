import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Languages,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import {
  CUSTOMERS,
  MIKE_JACKSON_FIXTURES,
  MIKE_JACKSON_HISTORY,
  customerById,
} from "@/lib/demo-data/bright-lights";
import { FloridaMap } from "../../../FloridaMap";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customerById(id);
  if (!customer) notFound();

  // Only Mike Jackson has the full fixture + history detail loaded for v1.
  const isMike = customer.id === "BL-MJ";
  const fixtures = isMike ? MIKE_JACKSON_FIXTURES : [];
  const history = isMike ? MIKE_JACKSON_HISTORY : [];
  const expiredCount = fixtures.filter((f) => f.warrantyStatus === "expired").length;
  const lifetimeCount = fixtures.filter((f) => f.warrantyStatus === "lifetime").length;
  const activeCount = fixtures.filter((f) => f.warrantyStatus === "active").length;

  const otherCustomers = CUSTOMERS.filter((c) => c.id !== customer.id).slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="flex min-w-0 flex-col gap-5">
        {/* Back + header */}
        <Link
          href="/demo/bright-lights-encina/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Today
        </Link>

        <header className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <span className="bl-eyebrow-muted">Customer · since {customer.installYear}</span>
              <h1
                className="bl-serif mt-1 text-[28px] leading-[1.05]"
                style={{ color: "var(--bl-text)" }}
              >
                {customer.name}
              </h1>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="bl-pill bl-pill-amber">
                <Languages className="h-3 w-3" />
                {customer.language === "en" ? "English" : "Español"}
              </span>
              {customer.referralSource && (
                <span
                  className="bl-pill"
                  title="Referral source"
                >
                  <Users className="h-3 w-3" /> via {customer.referralSource}
                </span>
              )}
            </div>
          </div>
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px]"
            style={{ color: "var(--bl-text-muted)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {customer.address}, {customer.city}, FL {customer.zip}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              [demo phone]
            </span>
            <span className="bl-mono">
              {customer.fixtures}+ fixtures · {customer.brand}
            </span>
          </div>
        </header>

        {/* Warranty banner */}
        {isMike && (
          <div
            className="flex items-start gap-3 rounded-md px-4 py-3"
            style={{
              background: "rgba(232,95,95,0.08)",
              border: "1px solid rgba(232,95,95,0.4)",
            }}
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "var(--bl-alert)" }}
            />
            <div className="text-[13px] leading-[1.5]">
              <span
                className="block font-medium"
                style={{ color: "var(--bl-alert)" }}
              >
                {expiredCount} fixtures out of warranty since April 2025.
              </span>
              <span style={{ color: "var(--bl-text-muted)" }}>
                Upsell opportunity: full retrofit, extended coverage plan, or auto-enroll
                in <strong>Bright Guardian</strong> ($589/yr) for free warranty repairs.
              </span>
            </div>
          </div>
        )}

        {/* Fixture inventory */}
        {isMike && (
          <section className="bl-card overflow-hidden">
            <header
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--bl-border)" }}
            >
              <span className="bl-eyebrow">Fixture inventory</span>
              <div className="flex items-center gap-3 text-[11px]">
                <LegendDot color="var(--bl-success)" label={`${activeCount + lifetimeCount} active`} />
                <LegendDot color="var(--bl-alert)" label={`${expiredCount} expired`} />
              </div>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.18)" }}>
                    <Th>ID</Th>
                    <Th>Type</Th>
                    <Th>Brand</Th>
                    <Th>Model</Th>
                    <Th align="right">Watt</Th>
                    <Th>Installed</Th>
                    <Th>Warranty</Th>
                  </tr>
                </thead>
                <tbody>
                  {fixtures.map((f, i) => (
                    <tr
                      key={f.id}
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid var(--bl-border)",
                      }}
                    >
                      <Td mono>{f.id}</Td>
                      <Td>{f.type}</Td>
                      <Td>{f.brand}</Td>
                      <Td mono>{f.model}</Td>
                      <Td mono align="right">{f.wattage}</Td>
                      <Td mono>{f.installDate}</Td>
                      <Td>
                        <WarrantyBadge status={f.warrantyStatus} end={f.warrantyEnd} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Service history timeline */}
        {isMike && (
          <section className="bl-card">
            <header
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--bl-border)" }}
            >
              <span className="bl-eyebrow">Service history</span>
              <span
                className="text-[11px]"
                style={{ color: "var(--bl-text-faint)" }}
              >
                {history.length} entries · {customer.installYear}–present
              </span>
            </header>
            <ol className="relative px-5 py-4">
              <span
                className="absolute bottom-3 left-[26px] top-3 w-px"
                style={{ background: "var(--bl-border-strong)" }}
              />
              {history.map((h) => (
                <li key={h.date} className="relative pl-9 pb-5 last:pb-0">
                  <span
                    className="absolute left-[20px] top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                    style={{
                      background: h.invoiced
                        ? "var(--bl-success)"
                        : "var(--bl-accent)",
                      boxShadow: "0 0 0 3px rgba(0,0,0,0.55)",
                    }}
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className="bl-mono text-[11px]"
                      style={{ color: "var(--bl-text-faint)" }}
                    >
                      {h.date}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em]"
                      style={{
                        color: h.invoiced ? "var(--bl-success)" : "var(--bl-accent)",
                      }}
                    >
                      {h.invoiced ? "Invoiced" : "No charge"}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[13px]"
                    style={{ color: "var(--bl-text)" }}
                  >
                    {h.title}
                  </p>
                  <p
                    className="mt-0.5 text-[12px] leading-[1.5]"
                    style={{ color: "var(--bl-text-muted)" }}
                  >
                    {h.detail}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {!isMike && (
          <section className="bl-card px-4 py-6 text-center">
            <p style={{ color: "var(--bl-text-muted)" }}>
              Full fixture and service history loaded for {customer.name} on
              import.
            </p>
            <Link
              href="/demo/bright-lights-encina/customers/BL-MJ"
              className="bl-btn-primary mt-4"
            >
              See Mike Jackson&rsquo;s full record →
            </Link>
          </section>
        )}

        {/* Notes */}
        <section className="bl-card px-4 py-4">
          <span className="bl-eyebrow">Notes</span>
          <p
            className="mt-2 text-[13px] leading-[1.6]"
            style={{ color: "var(--bl-text)" }}
          >
            {customer.notes}
          </p>
        </section>
      </div>

      {/* Right rail — property + customer list */}
      <aside className="flex flex-col gap-4">
        <div className="bl-card overflow-hidden">
          <FloridaMap
            customers={CUSTOMERS.map((c) => ({
              id: c.id,
              name: c.name,
              lat: c.lat,
              lng: c.lng,
              color: c.id === customer.id ? "var(--bl-accent)" : "rgba(245,239,230,0.32)",
            }))}
            highlightId={customer.id}
            height={220}
          />
        </div>
        <div className="bl-card">
          <header
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <span className="bl-eyebrow">Other customers</span>
          </header>
          <ul>
            {otherCustomers.map((c, i) => (
              <li
                key={c.id}
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--bl-border)",
                }}
              >
                <Link
                  href={`/demo/bright-lights-encina/customers/${c.id}`}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 text-[12px] transition-colors hover:bg-black/20"
                >
                  <span style={{ color: "var(--bl-text)" }}>{c.name}</span>
                  <span
                    className="bl-mono text-[10px]"
                    style={{ color: "var(--bl-text-faint)" }}
                  >
                    {c.cluster}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/demo/bright-lights-encina/plans"
          className="bl-card flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/20"
        >
          <Sparkles className="h-4 w-4" style={{ color: "var(--bl-accent)" }} />
          <div>
            <div
              className="text-[12px]"
              style={{ color: "var(--bl-text)" }}
            >
              Auto-enroll in Bright Guardian
            </div>
            <div
              className="text-[11px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              Free warranty repairs · 24-hr storm SLA
            </div>
          </div>
        </Link>
      </aside>
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className="bl-eyebrow-muted px-3 py-2"
      style={{
        textAlign: align ?? "left",
        fontSize: 10,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  align,
}: {
  children: React.ReactNode;
  mono?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={mono ? "bl-mono" : ""}
      style={{
        padding: "8px 12px",
        textAlign: align ?? "left",
        color: "var(--bl-text)",
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ color: "var(--bl-text-faint)" }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function WarrantyBadge({
  status,
  end,
}: {
  status: "active" | "expiring" | "expired" | "lifetime";
  end: string | null;
}) {
  if (status === "lifetime") {
    return <span className="bl-pill bl-pill-success">✦ Lifetime</span>;
  }
  if (status === "active") {
    return <span className="bl-pill bl-pill-success">Active{end ? ` to ${end}` : ""}</span>;
  }
  if (status === "expiring") {
    return <span className="bl-pill bl-pill-amber">Expiring</span>;
  }
  return <span className="bl-pill bl-pill-warn">Expired{end ? ` ${end}` : ""}</span>;
}
