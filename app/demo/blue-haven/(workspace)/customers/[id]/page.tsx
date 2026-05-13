import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Beaker, MapPin } from "lucide-react";
import {
  CHEMISTRY,
  ROUTES,
  colorForRoute,
  customerById,
} from "@/lib/demo-data/blue-haven";

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
  const history = CHEMISTRY.filter((c) => c.customerId === customer.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/demo/blue-haven/customers"
        className="inline-flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--bh-text-muted)" }}
      >
        <ArrowLeft className="h-3 w-3" /> All customers
      </Link>

      <header className="flex flex-col gap-2">
        <span className="bh-eyebrow-muted">Customer · {customer.id}</span>
        <h1
          className="bh-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--bh-text)" }}
        >
          {customer.name}
        </h1>
        <p className="text-[13px]" style={{ color: "var(--bh-text-muted)" }}>
          {customer.address} · {customer.zip}
        </p>
        {customer.notes && (
          <p
            className="rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(124,200,232,0.08)",
              border: "1px solid rgba(124,200,232,0.30)",
              color: "var(--bh-text-muted)",
            }}
          >
            <strong style={{ color: "var(--bh-text)" }}>Note:</strong>{" "}
            {customer.notes}
          </p>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Fact
          icon={MapPin}
          label="Service route"
          value={`${route?.weekday} · ${route?.techName}`}
          tone={colorForRoute(customer.route)}
        />
        <Fact label="Pool" value={`${customer.pool} · ${customer.gallons.toLocaleString()} gal`} />
        <Fact label="Monthly value" value={`$${customer.monthlyValue}`} />
      </section>

      <section className="bh-card overflow-hidden">
        <header className="border-b px-5 py-3" style={{ borderColor: "var(--bh-border)" }}>
          <div className="flex items-center gap-2">
            <Beaker className="h-4 w-4" style={{ color: "var(--bh-accent)" }} />
            <h2 className="bh-eyebrow">Chemistry history on this pool</h2>
          </div>
        </header>
        {history.length === 0 ? (
          <p className="px-5 py-6 text-[13px]" style={{ color: "var(--bh-text-muted)" }}>
            No chemistry readings recorded yet.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--bh-border)" }}>
            {history.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-1 gap-1 px-5 py-3 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center md:gap-3"
              >
                <span
                  className="bh-mono text-[12px]"
                  style={{ color: "var(--bh-text-faint)" }}
                >
                  {r.date}
                </span>
                <div className="min-w-0 text-[12px]" style={{ color: "var(--bh-text-muted)" }}>
                  FC {r.free_cl_ppm} · pH {r.ph} · TA {r.total_alkalinity_ppm}
                  {r.cyanuric_acid_ppm != null && ` · CYA ${r.cyanuric_acid_ppm}`}
                  {r.dosed && ` · dosed: ${r.dosed}`}
                </div>
                <span
                  className="bh-pill"
                  style={{
                    background: r.result === "balanced"
                      ? "rgba(157,255,138,0.10)"
                      : "rgba(244,184,96,0.10)",
                    color: r.result === "balanced"
                      ? "var(--bh-success)"
                      : "#f4b860",
                    borderColor: r.result === "balanced"
                      ? "rgba(157,255,138,0.30)"
                      : "rgba(244,184,96,0.30)",
                  }}
                >
                  {r.result.replace("_", " ")}
                </span>
                <span
                  className="text-[11px] text-right"
                  style={{ color: "var(--bh-text-faint)" }}
                >
                  {r.techName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type LucideLikeIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

function Fact({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon?: LucideLikeIcon;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="bh-card flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            className="h-3.5 w-3.5"
            style={{ color: tone ?? "var(--bh-accent)" }}
          />
        )}
        <span
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "var(--bh-text-faint)" }}
        >
          {label}
        </span>
      </div>
      <div className="bh-serif text-[16px]" style={{ color: "var(--bh-text)" }}>
        {value}
      </div>
    </div>
  );
}
