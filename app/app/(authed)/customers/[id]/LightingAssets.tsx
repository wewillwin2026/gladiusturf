"use client";

import * as React from "react";
import {
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Zap,
  AlertCircle,
  Archive,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import {
  createFixture,
  updateFixture,
  deleteFixture,
  restoreFixture,
  purgeFixture,
  createTransformer,
  updateTransformer,
  deleteTransformer,
  restoreTransformer,
  purgeTransformer,
  createWarrantyClaim,
  updateWarrantyClaim,
  deleteWarrantyClaim,
} from "./actions";

const BRANDS = ["Cast", "Unique", "FX", "VOLT", "Coastal", "Kichler", "Other"] as const;
const WARRANTY_STATUSES = [
  { value: "", label: "—" },
  { value: "active", label: "Active" },
  { value: "expiring", label: "Expiring" },
  { value: "expired", label: "Expired" },
  { value: "lifetime", label: "Lifetime" },
] as const;
const CLAIM_STATUSES = [
  { value: "open", label: "Open" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
  { value: "closed", label: "Closed" },
] as const;

export type FixtureRow = {
  id: string;
  external_id: string | null;
  fixture_type: string;
  brand: string;
  model: string | null;
  wattage_text: string | null;
  install_date: string | null;
  warranty_status: string | null;
  warranty_end: string | null;
  notes: string | null;
};

export type TransformerRow = {
  id: string;
  external_id: string | null;
  brand: string | null;
  model: string | null;
  watts_capacity: number | null;
  watts_loaded: number | null;
  zones: number | null;
  install_date: string | null;
  location_note: string | null;
};

export type WarrantyClaimRow = {
  id: string;
  fixture_id: string | null;
  external_id: string | null;
  claim_date: string;
  status: string;
  manufacturer: string | null;
  rma_number: string | null;
  resolution: string | null;
  notes: string | null;
};

type Props = {
  customerId: string;
  fixtures: FixtureRow[];
  transformers: TransformerRow[];
  claims: WarrantyClaimRow[];
  archivedFixtures: FixtureRow[];
  archivedTransformers: TransformerRow[];
};

type DialogState =
  | { kind: "none" }
  | { kind: "fixture"; row: FixtureRow | null }
  | { kind: "transformer"; row: TransformerRow | null }
  | { kind: "claim"; row: WarrantyClaimRow | null };

export function LightingAssets({
  customerId,
  fixtures,
  transformers,
  claims,
  archivedFixtures,
  archivedTransformers,
}: Props) {
  const [dialog, setDialog] = React.useState<DialogState>({ kind: "none" });
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [archivedFixturesOpen, setArchivedFixturesOpen] = React.useState(false);
  const [archivedTransformersOpen, setArchivedTransformersOpen] = React.useState(false);

  function close() {
    setDialog({ kind: "none" });
    setError(null);
  }

  async function runAction(label: string, fn: () => Promise<{ ok: true } | { error: string }>) {
    setBusy(label);
    setError(null);
    const res = await fn();
    setBusy(null);
    if ("error" in res) {
      setError(res.error);
      return false;
    }
    close();
    return true;
  }

  // Inline banner for non-dialog errors (archive / restore / purge).
  // Dialog errors stay inside DialogShell; row-level action errors land
  // here so the user sees them after a confirm() rejection or RPC fault.
  const showBannerError = error && dialog.kind === "none";

  return (
    <div className="space-y-6">
      {showBannerError && (
        <div className="flex items-start gap-2 rounded-md border border-g-warn/40 bg-g-warn/10 p-2 text-[12px] text-g-warn">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-g-warn/70 hover:text-g-warn"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      {/* Fixtures */}
      <section className="g-card p-5">
        <SectionHeader
          icon={<Lightbulb className="h-4 w-4 text-g-accent" />}
          title="Fixtures"
          count={fixtures.length}
          unit="on this property"
          onAdd={() => setDialog({ kind: "fixture", row: null })}
        />

        {fixtures.length === 0 ? (
          <EmptyHint
            primary="No fixtures logged for this property yet."
            secondary="Add the first fixture to start per-fixture warranty tracking."
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[12px] min-w-[700px]">
              <thead>
                <tr className="text-left border-b border-g-border-subtle text-g-text-faint">
                  <Th>ID</Th>
                  <Th>Type</Th>
                  <Th>Brand · Model</Th>
                  <Th align="right">Watt</Th>
                  <Th>Installed</Th>
                  <Th>Warranty</Th>
                  <Th align="right">&nbsp;</Th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map((f) => (
                  <tr key={f.id} className="border-b border-g-border-subtle/50 last:border-b-0">
                    <td className="py-2 pr-3 font-geist-mono text-g-text-faint">
                      {f.external_id ?? f.id.slice(0, 8)}
                    </td>
                    <td className="py-2 pr-3 text-g-text">{f.fixture_type}</td>
                    <td className="py-2 pr-3 text-g-text-muted">
                      <span className="text-g-text">{f.brand}</span>
                      {f.model && <span className="text-g-text-faint"> · {f.model}</span>}
                    </td>
                    <td className="py-2 pr-3 font-geist-mono text-right text-g-text-muted">
                      {f.wattage_text ?? "—"}
                    </td>
                    <td className="py-2 pr-3 font-geist-mono text-g-text-muted">
                      {f.install_date ? shortDate(f.install_date) : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      <WarrantyPill status={f.warranty_status} end={f.warranty_end} />
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      <RowActions
                        onEdit={() => setDialog({ kind: "fixture", row: f })}
                        onDelete={async () => {
                          if (!confirm("Archive this fixture? Warranty claims that reference it will retain their link.")) return;
                          await runAction(`del-fix-${f.id}`, () =>
                            wrapForm({ id: f.id, customer_id: customerId }, deleteFixture),
                          );
                        }}
                        busyKey={`del-fix-${f.id}`}
                        currentBusy={busy}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Archived fixtures */}
        {archivedFixtures.length > 0 && (
          <ArchivedSection
            label={`Archived fixtures (${archivedFixtures.length})`}
            open={archivedFixturesOpen}
            onToggle={() => setArchivedFixturesOpen((v) => !v)}
          >
            <ul className="mt-3 divide-y divide-g-border-subtle/50">
              {archivedFixtures.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3 py-2 text-[12px]"
                >
                  <div className="min-w-0">
                    <span className="font-geist-mono text-g-text-faint">
                      {f.external_id ?? f.id.slice(0, 8)}
                    </span>
                    <span className="ml-2 text-g-text">{f.fixture_type}</span>
                    <span className="ml-2 text-g-text-muted">
                      {f.brand}
                      {f.model && <span className="text-g-text-faint"> · {f.model}</span>}
                    </span>
                  </div>
                  <ArchivedRowActions
                    onRestore={async () => {
                      await runAction(`restore-fix-${f.id}`, () =>
                        wrapForm({ id: f.id, customer_id: customerId }, restoreFixture),
                      );
                    }}
                    onPurge={async () => {
                      if (!confirm("Permanently delete this fixture? This cannot be undone.")) return;
                      await runAction(`purge-fix-${f.id}`, () =>
                        wrapForm({ id: f.id, customer_id: customerId }, purgeFixture),
                      );
                    }}
                    restoreBusyKey={`restore-fix-${f.id}`}
                    purgeBusyKey={`purge-fix-${f.id}`}
                    currentBusy={busy}
                  />
                </li>
              ))}
            </ul>
          </ArchivedSection>
        )}
      </section>

      {/* Transformers */}
      <section className="g-card p-5">
        <SectionHeader
          icon={<Zap className="h-4 w-4 text-g-accent" />}
          title="Transformers"
          count={transformers.length}
          unit="powering fixtures"
          onAdd={() => setDialog({ kind: "transformer", row: null })}
        />

        {transformers.length === 0 ? (
          <EmptyHint
            primary="No transformers logged."
            secondary="Add capacity + zone counts so loads can be tracked."
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[12px] min-w-[700px]">
              <thead>
                <tr className="text-left border-b border-g-border-subtle text-g-text-faint">
                  <Th>ID</Th>
                  <Th>Brand · Model</Th>
                  <Th align="right">Capacity</Th>
                  <Th align="right">Loaded</Th>
                  <Th align="right">Zones</Th>
                  <Th>Location</Th>
                  <Th align="right">&nbsp;</Th>
                </tr>
              </thead>
              <tbody>
                {transformers.map((t) => (
                  <tr key={t.id} className="border-b border-g-border-subtle/50 last:border-b-0">
                    <td className="py-2 pr-3 font-geist-mono text-g-text-faint">
                      {t.external_id ?? t.id.slice(0, 8)}
                    </td>
                    <td className="py-2 pr-3 text-g-text-muted">
                      {t.brand ? <span className="text-g-text">{t.brand}</span> : <span>—</span>}
                      {t.model && <span className="text-g-text-faint"> · {t.model}</span>}
                    </td>
                    <td className="py-2 pr-3 font-geist-mono text-right text-g-text-muted">
                      {t.watts_capacity != null ? `${t.watts_capacity}W` : "—"}
                    </td>
                    <td className="py-2 pr-3 font-geist-mono text-right text-g-text-muted">
                      {t.watts_loaded != null ? `${t.watts_loaded}W` : "—"}
                    </td>
                    <td className="py-2 pr-3 font-geist-mono text-right text-g-text-muted">
                      {t.zones != null ? t.zones : "—"}
                    </td>
                    <td className="py-2 pr-3 text-g-text-muted">{t.location_note ?? "—"}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      <RowActions
                        onEdit={() => setDialog({ kind: "transformer", row: t })}
                        onDelete={async () => {
                          if (!confirm("Archive this transformer?")) return;
                          await runAction(`del-tx-${t.id}`, () =>
                            wrapForm({ id: t.id, customer_id: customerId }, deleteTransformer),
                          );
                        }}
                        busyKey={`del-tx-${t.id}`}
                        currentBusy={busy}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Archived transformers */}
        {archivedTransformers.length > 0 && (
          <ArchivedSection
            label={`Archived transformers (${archivedTransformers.length})`}
            open={archivedTransformersOpen}
            onToggle={() => setArchivedTransformersOpen((v) => !v)}
          >
            <ul className="mt-3 divide-y divide-g-border-subtle/50">
              {archivedTransformers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-2 text-[12px]"
                >
                  <div className="min-w-0">
                    <span className="font-geist-mono text-g-text-faint">
                      {t.external_id ?? t.id.slice(0, 8)}
                    </span>
                    <span className="ml-2 text-g-text-muted">
                      {t.brand ?? "—"}
                      {t.model && <span className="text-g-text-faint"> · {t.model}</span>}
                    </span>
                    {t.watts_capacity != null && (
                      <span className="ml-2 font-geist-mono text-g-text-faint">
                        {t.watts_capacity}W
                      </span>
                    )}
                  </div>
                  <ArchivedRowActions
                    onRestore={async () => {
                      await runAction(`restore-tx-${t.id}`, () =>
                        wrapForm({ id: t.id, customer_id: customerId }, restoreTransformer),
                      );
                    }}
                    onPurge={async () => {
                      if (!confirm("Permanently delete this transformer? This cannot be undone.")) return;
                      await runAction(`purge-tx-${t.id}`, () =>
                        wrapForm({ id: t.id, customer_id: customerId }, purgeTransformer),
                      );
                    }}
                    restoreBusyKey={`restore-tx-${t.id}`}
                    purgeBusyKey={`purge-tx-${t.id}`}
                    currentBusy={busy}
                  />
                </li>
              ))}
            </ul>
          </ArchivedSection>
        )}
      </section>

      {/* Warranty claims */}
      <section className="g-card p-5">
        <SectionHeader
          icon={<ShieldAlert className="h-4 w-4 text-g-accent" />}
          title="Warranty claims"
          count={claims.length}
          unit={claims.length === 1 ? "filed" : "filed"}
          onAdd={() => setDialog({ kind: "claim", row: null })}
        />

        {claims.length === 0 ? (
          <EmptyHint
            primary="No warranty claims on file."
            secondary="File a claim when a manufacturer-covered fixture fails."
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[12px] min-w-[700px]">
              <thead>
                <tr className="text-left border-b border-g-border-subtle text-g-text-faint">
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Mfr</Th>
                  <Th>RMA</Th>
                  <Th>Resolution</Th>
                  <Th align="right">&nbsp;</Th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-g-border-subtle/50 last:border-b-0">
                    <td className="py-2 pr-3 font-geist-mono text-g-text-muted">
                      {shortDate(c.claim_date)}
                    </td>
                    <td className="py-2 pr-3">
                      <ClaimStatusPill status={c.status} />
                    </td>
                    <td className="py-2 pr-3 text-g-text-muted">{c.manufacturer ?? "—"}</td>
                    <td className="py-2 pr-3 font-geist-mono text-g-text-muted">
                      {c.rma_number ?? "—"}
                    </td>
                    <td className="py-2 pr-3 text-g-text-muted">{c.resolution ?? "—"}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      <RowActions
                        onEdit={() => setDialog({ kind: "claim", row: c })}
                        onDelete={async () => {
                          if (!confirm("Delete this warranty claim?")) return;
                          await runAction(`del-claim-${c.id}`, () =>
                            wrapForm({ id: c.id, customer_id: customerId }, deleteWarrantyClaim),
                          );
                        }}
                        busyKey={`del-claim-${c.id}`}
                        currentBusy={busy}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Dialog */}
      {dialog.kind === "fixture" && (
        <FixtureDialog
          customerId={customerId}
          row={dialog.row}
          onClose={close}
          onSubmit={async (fd) =>
            runAction("fixture-submit", async () =>
              dialog.row ? updateFixture(fd) : createFixture(fd),
            )
          }
          busy={busy === "fixture-submit"}
          error={error}
        />
      )}
      {dialog.kind === "transformer" && (
        <TransformerDialog
          customerId={customerId}
          row={dialog.row}
          onClose={close}
          onSubmit={async (fd) =>
            runAction("transformer-submit", async () =>
              dialog.row ? updateTransformer(fd) : createTransformer(fd),
            )
          }
          busy={busy === "transformer-submit"}
          error={error}
        />
      )}
      {dialog.kind === "claim" && (
        <WarrantyClaimDialog
          customerId={customerId}
          row={dialog.row}
          fixtures={fixtures}
          onClose={close}
          onSubmit={async (fd) =>
            runAction("claim-submit", async () =>
              dialog.row ? updateWarrantyClaim(fd) : createWarrantyClaim(fd),
            )
          }
          busy={busy === "claim-submit"}
          error={error}
        />
      )}
    </div>
  );
}

// ---- Section bits ----

function SectionHeader({
  icon,
  title,
  count,
  unit,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  unit: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="inline-flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
          {count} {unit}
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-md border border-g-border bg-g-surface-2 px-2.5 py-1 text-[12px] font-medium text-g-text hover:bg-g-surface-3"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>
    </div>
  );
}

function EmptyHint({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="mt-5 rounded-md border border-dashed border-g-border-subtle bg-g-surface-2 p-6 text-center">
      <p className="text-[13px] text-g-text-muted">{primary}</p>
      <p className="mt-2 text-[12px] text-g-text-faint">{secondary}</p>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`py-2 font-medium uppercase tracking-[0.14em] text-[10px] ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function RowActions({
  onEdit,
  onDelete,
  busyKey,
  currentBusy,
}: {
  onEdit: () => void;
  onDelete: () => void;
  busyKey: string;
  currentBusy: string | null;
}) {
  const isDeleting = currentBusy === busyKey;
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        disabled={isDeleting}
        title="Edit"
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-g-text-muted hover:bg-g-surface-3 hover:text-g-text"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        title="Delete"
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-g-text-muted hover:bg-g-surface-3 hover:text-g-text disabled:opacity-50"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </span>
  );
}

function ArchivedSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-g-border-subtle/60 pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-g-text-faint hover:text-g-text-muted"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <Archive className="h-3 w-3" />
        {label}
      </button>
      {open && children}
    </div>
  );
}

function ArchivedRowActions({
  onRestore,
  onPurge,
  restoreBusyKey,
  purgeBusyKey,
  currentBusy,
}: {
  onRestore: () => void;
  onPurge: () => void;
  restoreBusyKey: string;
  purgeBusyKey: string;
  currentBusy: string | null;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const restoring = currentBusy === restoreBusyKey;
  const purging = currentBusy === purgeBusyKey;
  const anyBusy = restoring || purging;
  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={onRestore}
        disabled={anyBusy}
        title="Restore"
        className="inline-flex items-center gap-1 rounded-md border border-g-border bg-g-surface-2 px-2 py-1 text-[11px] text-g-text-muted hover:bg-g-surface-3 hover:text-g-text disabled:opacity-50"
      >
        <RotateCcw className="h-3 w-3" />
        {restoring ? "Restoring…" : "Restore"}
      </button>
      <span className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          disabled={anyBusy}
          title="More"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-g-text-muted hover:bg-g-surface-3 hover:text-g-text disabled:opacity-50"
        >
          <MoreHorizontal className="h-3 w-3" />
        </button>
        {menuOpen && (
          <span
            role="menu"
            className="absolute right-0 top-full z-10 mt-1 w-44 rounded-md border border-g-border bg-g-surface-1 py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onPurge();
              }}
              disabled={purging}
              className="block w-full px-3 py-1.5 text-left text-[12px] text-g-warn hover:bg-g-surface-2 disabled:opacity-50"
            >
              {purging ? "Purging…" : "Purge permanently"}
            </button>
          </span>
        )}
      </span>
    </span>
  );
}

function WarrantyPill({ status, end }: { status: string | null; end: string | null }) {
  if (!status) return <span className="text-g-text-faint">—</span>;
  const tone =
    status === "active" || status === "lifetime"
      ? "bg-g-success/15 text-g-success"
      : status === "expired"
        ? "bg-g-warn/15 text-g-warn"
        : "bg-g-surface-3 text-g-text-muted";
  const label =
    status === "lifetime" ? (
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Lifetime
      </span>
    ) : status === "active" ? (
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Active
      </span>
    ) : status === "expired" ? (
      <span className="inline-flex items-center gap-1">
        <ShieldAlert className="h-3 w-3" />
        Expired
      </span>
    ) : (
      status
    );
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${tone}`}
      title={end ? `Through ${shortDate(end)}` : undefined}
    >
      {label}
    </span>
  );
}

function ClaimStatusPill({ status }: { status: string }) {
  const tone =
    status === "approved"
      ? "bg-g-success/15 text-g-success"
      : status === "denied"
        ? "bg-g-warn/15 text-g-warn"
        : status === "closed"
          ? "bg-g-surface-3 text-g-text-muted"
          : "bg-g-accent/15 text-g-accent";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${tone}`}
    >
      {status}
    </span>
  );
}

// ---- Dialogs ----

function DialogShell({
  title,
  children,
  onClose,
  busy,
  error,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-g-border bg-g-surface-1 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-g-text">{title}</h3>
          <button type="button" onClick={onClose} className="text-g-text-faint hover:text-g-text">
            ✕
          </button>
        </div>
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-g-warn/40 bg-g-warn/10 p-2 text-[12px] text-g-warn">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <fieldset disabled={busy} className="space-y-3">
          {children}
        </fieldset>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-g-text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-g-text-faint">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text placeholder:text-g-text-faint focus:border-g-accent focus:outline-none";

function FixtureDialog({
  customerId,
  row,
  onClose,
  onSubmit,
  busy,
  error,
}: {
  customerId: string;
  row: FixtureRow | null;
  onClose: () => void;
  onSubmit: (fd: FormData) => Promise<boolean>;
  busy: boolean;
  error: string | null;
}) {
  return (
    <DialogShell title={row ? "Edit fixture" : "Add fixture"} onClose={onClose} busy={busy} error={error}>
      <form
        action={async (fd) => {
          await onSubmit(fd);
        }}
        className="space-y-3"
      >
        <input type="hidden" name="customer_id" value={customerId} />
        {row && <input type="hidden" name="id" value={row.id} />}

        <div className="grid grid-cols-2 gap-3">
          <Field label="External ID">
            <input
              name="external_id"
              defaultValue={row?.external_id ?? ""}
              className={inputCls}
              placeholder="BL-MJ-001"
            />
          </Field>
          <Field label="Type *">
            <input
              name="fixture_type"
              defaultValue={row?.fixture_type ?? ""}
              required
              className={inputCls}
              placeholder="Path Light"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand *">
            <select name="brand" required defaultValue={row?.brand ?? ""} className={inputCls}>
              <option value="" disabled>
                Choose…
              </option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Model">
            <input name="model" defaultValue={row?.model ?? ""} className={inputCls} placeholder="CPL11" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wattage">
            <input
              name="wattage_text"
              defaultValue={row?.wattage_text ?? ""}
              className={inputCls}
              placeholder="3W"
            />
          </Field>
          <Field label="Install date">
            <input
              type="date"
              name="install_date"
              defaultValue={row?.install_date ?? ""}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Warranty status">
            <select
              name="warranty_status"
              defaultValue={row?.warranty_status ?? ""}
              className={inputCls}
            >
              {WARRANTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Warranty end">
            <input
              type="date"
              name="warranty_end"
              defaultValue={row?.warranty_end ?? ""}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            name="notes"
            defaultValue={row?.notes ?? ""}
            className={inputCls}
            rows={2}
          />
        </Field>

        <DialogActions onClose={onClose} busy={busy} editing={!!row} />
      </form>
    </DialogShell>
  );
}

function TransformerDialog({
  customerId,
  row,
  onClose,
  onSubmit,
  busy,
  error,
}: {
  customerId: string;
  row: TransformerRow | null;
  onClose: () => void;
  onSubmit: (fd: FormData) => Promise<boolean>;
  busy: boolean;
  error: string | null;
}) {
  return (
    <DialogShell
      title={row ? "Edit transformer" : "Add transformer"}
      onClose={onClose}
      busy={busy}
      error={error}
    >
      <form
        action={async (fd) => {
          await onSubmit(fd);
        }}
        className="space-y-3"
      >
        <input type="hidden" name="customer_id" value={customerId} />
        {row && <input type="hidden" name="id" value={row.id} />}

        <div className="grid grid-cols-2 gap-3">
          <Field label="External ID">
            <input
              name="external_id"
              defaultValue={row?.external_id ?? ""}
              className={inputCls}
              placeholder="TX-001"
            />
          </Field>
          <Field label="Brand">
            <input name="brand" defaultValue={row?.brand ?? ""} className={inputCls} placeholder="VOLT" />
          </Field>
        </div>
        <Field label="Model">
          <input name="model" defaultValue={row?.model ?? ""} className={inputCls} placeholder="X300" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Capacity (W)">
            <input
              type="number"
              min={0}
              name="watts_capacity"
              defaultValue={row?.watts_capacity ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Loaded (W)">
            <input
              type="number"
              min={0}
              name="watts_loaded"
              defaultValue={row?.watts_loaded ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Zones">
            <input
              type="number"
              min={0}
              name="zones"
              defaultValue={row?.zones ?? ""}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Install date">
          <input
            type="date"
            name="install_date"
            defaultValue={row?.install_date ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Location note">
          <input
            name="location_note"
            defaultValue={row?.location_note ?? ""}
            className={inputCls}
            placeholder="Garage exterior, behind hose bib"
          />
        </Field>

        <DialogActions onClose={onClose} busy={busy} editing={!!row} />
      </form>
    </DialogShell>
  );
}

function WarrantyClaimDialog({
  customerId,
  row,
  fixtures,
  onClose,
  onSubmit,
  busy,
  error,
}: {
  customerId: string;
  row: WarrantyClaimRow | null;
  fixtures: FixtureRow[];
  onClose: () => void;
  onSubmit: (fd: FormData) => Promise<boolean>;
  busy: boolean;
  error: string | null;
}) {
  return (
    <DialogShell
      title={row ? "Edit warranty claim" : "File warranty claim"}
      onClose={onClose}
      busy={busy}
      error={error}
    >
      <form
        action={async (fd) => {
          await onSubmit(fd);
        }}
        className="space-y-3"
      >
        <input type="hidden" name="customer_id" value={customerId} />
        {row && <input type="hidden" name="id" value={row.id} />}

        <Field label="Fixture (optional)">
          <select name="fixture_id" defaultValue={row?.fixture_id ?? ""} className={inputCls}>
            <option value="">— none —</option>
            {fixtures.map((f) => (
              <option key={f.id} value={f.id}>
                {f.external_id ?? f.id.slice(0, 8)} · {f.fixture_type} ({f.brand})
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Claim date">
            <input
              type="date"
              name="claim_date"
              defaultValue={row?.claim_date ?? new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={row?.status ?? "open"} className={inputCls}>
              {CLAIM_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Manufacturer">
            <input
              name="manufacturer"
              defaultValue={row?.manufacturer ?? ""}
              className={inputCls}
              placeholder="Cast Lighting"
            />
          </Field>
          <Field label="RMA #">
            <input
              name="rma_number"
              defaultValue={row?.rma_number ?? ""}
              className={inputCls}
              placeholder="RMA-2026-001"
            />
          </Field>
        </div>
        <Field label="Resolution">
          <input
            name="resolution"
            defaultValue={row?.resolution ?? ""}
            className={inputCls}
            placeholder="Replacement shipped 2026-05-10"
          />
        </Field>
        <Field label="Notes">
          <textarea name="notes" defaultValue={row?.notes ?? ""} className={inputCls} rows={2} />
        </Field>

        <DialogActions onClose={onClose} busy={busy} editing={!!row} />
      </form>
    </DialogShell>
  );
}

function DialogActions({
  onClose,
  busy,
  editing,
}: {
  onClose: () => void;
  busy: boolean;
  editing: boolean;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-g-border-subtle">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md border border-g-border bg-transparent px-3 py-1.5 text-[13px] text-g-text-muted hover:bg-g-surface-3"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-g-accent px-3 py-1.5 text-[13px] font-medium text-g-text-invert disabled:opacity-60"
      >
        {busy ? "Saving…" : editing ? "Save changes" : "Add"}
      </button>
    </div>
  );
}

// ---- Helpers ----

function shortDate(s: string): string {
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function wrapForm(
  fields: Record<string, string>,
  fn: (fd: FormData) => Promise<{ ok: true } | { error: string }>,
) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fn(fd);
}
