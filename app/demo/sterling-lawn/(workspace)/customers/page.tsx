import Link from "next/link";
import { ArrowRight, CircleAlert, Pause } from "lucide-react";
import { CLUSTERS, CUSTOMERS, colorForCluster } from "@/lib/demo-data/sterling-lawn";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<
  (typeof CUSTOMERS)[number]["status"],
  { label: string; bg: string; color: string; border: string }
> = {
  Active: {
    label: "Active",
    bg: "rgba(127,226,122,0.10)",
    color: "var(--sl-accent)",
    border: "rgba(127,226,122,0.40)",
  },
  "Past due": {
    label: "Past due",
    bg: "rgba(232,95,95,0.12)",
    color: "var(--sl-alert)",
    border: "rgba(232,95,95,0.40)",
  },
  Hold: {
    label: "Hold",
    bg: "rgba(244,184,96,0.14)",
    color: "#f4b860",
    border: "rgba(244,184,96,0.40)",
  },
};

export default function CustomersPage() {
  const active = CUSTOMERS.filter((c) => c.status === "Active").length;
  const past = CUSTOMERS.filter((c) => c.status === "Past due").length;
  const hold = CUSTOMERS.filter((c) => c.status === "Hold").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="sl-eyebrow-muted">Customers</span>
        <h1
          className="sl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          {CUSTOMERS.length} on the books
        </h1>
        <p className="text-[13px]" style={{ color: "var(--sl-text-muted)" }}>
          {active} active · {past} past due · {hold} on hold.{" "}
          <span style={{ color: "var(--sl-text-faint)" }}>
            (Sample of 25 from a 87-customer book.)
          </span>
        </p>
      </header>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span
          className="sl-pill"
          style={{ color: "var(--sl-text-muted)" }}
        >
          All routes
        </span>
        {CLUSTERS.map((c) => (
          <span
            key={c.id}
            className="sl-pill"
            style={{
              color: "var(--sl-text-muted)",
              borderColor: "var(--sl-border)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: colorForCluster(c.id) }}
            />
            {c.weekday} · {c.name.split(" / ")[0]}
          </span>
        ))}
      </div>

      <div
        className="sl-card overflow-hidden"
        style={{ background: "var(--sl-bg)" }}
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--sl-text-faint)",
                borderBottom: "1px solid var(--sl-border)",
              }}
            >
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Monthly</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => {
              const cluster = CLUSTERS.find((cl) => cl.id === c.cluster);
              const statusKey = c.status as keyof typeof STATUS_PILL;
              const pill = STATUS_PILL[statusKey];
              return (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--sl-border)" }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/demo/sterling-lawn/customers/${c.id}`}
                      style={{ color: "var(--sl-text)" }}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                    <div
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--sl-text-muted)" }}
                    >
                      {c.address} · {c.zip}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: colorForCluster(c.cluster) }}
                      />
                      <span style={{ color: "var(--sl-text-muted)" }}>
                        {cluster?.weekday} · {cluster?.name.split(" / ")[0]}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--sl-text-muted)" }}
                  >
                    {c.plan}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="sl-pill"
                      style={{
                        background: pill.bg,
                        color: pill.color,
                        borderColor: pill.border,
                      }}
                    >
                      {c.status === "Past due" && (
                        <CircleAlert className="h-3 w-3" />
                      )}
                      {c.status === "Hold" && <Pause className="h-3 w-3" />}
                      {pill.label}
                    </span>
                  </td>
                  <td
                    className="sl-mono px-4 py-3 text-right tabular-nums"
                    style={{ color: "var(--sl-text)" }}
                  >
                    ${c.monthlyValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/demo/sterling-lawn/customers/${c.id}`}
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--sl-accent)" }}
                    >
                      Open <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
