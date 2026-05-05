import { Building2, Database, Users2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { Button } from "@/components/app/ui/Button";
import { supabaseAdmin } from "@/lib/supabase";
import { relTime } from "@/lib/shared/format";
import { InviteForm } from "./InviteForm";
import { revokeInvitation } from "./actions";

async function revokeInvitationVoid(formData: FormData): Promise<void> {
  "use server";
  await revokeInvitation(formData);
}

export const dynamic = "force-dynamic";

type Tenant = {
  id: string;
  slug: string;
  display_name: string;
  vertical: string;
  plan_tier: string;
  brand_primary_hex: string | null;
  brand_accent_hex: string | null;
  service_area_zips: string[] | null;
  primary_language: string;
  bilingual: boolean;
  active: boolean;
  created_at: string;
};

type Invitation = {
  email: string;
  tenant_id: string;
  role: string;
  status: string;
  invited_by: string | null;
  notes: string | null;
  created_at: string;
};

type Member = {
  tenant_id: string;
  user_id: string;
  role: string;
  display_name: string | null;
  created_at: string;
};

export default async function TenantsPage() {
  let tenants: Tenant[] = [];
  let invitations: Invitation[] = [];
  let members: Member[] = [];
  let error: string | null = null;

  try {
    const sb = supabaseAdmin();
    const [tRes, iRes, mRes] = await Promise.all([
      sb
        .from("tenants")
        .select(
          "id, slug, display_name, vertical, plan_tier, brand_primary_hex, brand_accent_hex, service_area_zips, primary_language, bilingual, active, created_at",
        )
        .order("created_at", { ascending: false }),
      sb
        .from("tenant_invitations")
        .select(
          "email, tenant_id, role, status, invited_by, notes, created_at",
        )
        .eq("status", "active"),
      sb
        .from("tenant_members")
        .select("tenant_id, user_id, role, display_name, created_at"),
    ]);
    if (tRes.error) throw tRes.error;
    if (iRes.error) throw iRes.error;
    if (mRes.error) throw mRes.error;
    tenants = (tRes.data ?? []) as Tenant[];
    invitations = (iRes.data ?? []) as Invitation[];
    members = (mRes.data ?? []) as Member[];
  } catch (err) {
    error = err instanceof Error ? err.message : "supabase_offline";
  }

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.active).length;
  const totalInvites = invitations.length;
  const totalMembers = members.length;

  // Group invitations + members by tenant for fast per-card lookup.
  const invitesByTenant = new Map<string, Invitation[]>();
  for (const inv of invitations) {
    const list = invitesByTenant.get(inv.tenant_id) ?? [];
    list.push(inv);
    invitesByTenant.set(inv.tenant_id, list);
  }
  const membersByTenant = new Map<string, Member[]>();
  for (const m of members) {
    const list = membersByTenant.get(m.tenant_id) ?? [];
    list.push(m);
    membersByTenant.set(m.tenant_id, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Platform"
        title="Tenants"
        subtitle={`${totalTenants} tenants · ${totalInvites} active invitations · ${totalMembers} members`}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total tenants"
          value={String(totalTenants)}
          delta={totalTenants ? "all time" : "—"}
          trend={totalTenants ? "up" : "flat"}
        />
        <KPICard
          label="Active tenants"
          value={String(activeTenants)}
          delta={
            totalTenants
              ? `${Math.round((activeTenants / totalTenants) * 100)}% live`
              : "—"
          }
          trend={activeTenants > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Active invitations"
          value={String(totalInvites)}
          delta={totalInvites ? "pending magic-link" : "—"}
          trend={totalInvites > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Members signed in"
          value={String(totalMembers)}
          delta={totalMembers ? "tenant_members" : "—"}
          trend={totalMembers > 0 ? "up" : "flat"}
        />
      </section>

      {error ? (
        <EmptyState
          icon={Database}
          title="Supabase unreachable"
          body="Couldn't load tenants. Check NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel."
        />
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No tenants yet"
          body="Add a row to the tenants table to provision the first pilot. Then drop an invitation here and the operator can request a magic link at /app/login."
        />
      ) : (
        <section className="flex flex-col gap-4">
          {tenants.map((t) => {
            const invs = invitesByTenant.get(t.id) ?? [];
            const mems = membersByTenant.get(t.id) ?? [];
            return (
              <article
                key={t.id}
                className="g-card flex flex-col gap-4 p-5"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[15px] font-medium text-g-text">
                        {t.display_name}
                      </h2>
                      <span className="font-geist-mono text-[11px] text-g-text-faint">
                        {t.slug}
                      </span>
                      <StatusPill tone={t.active ? "success" : "neutral"}>
                        {t.active ? "active" : "paused"}
                      </StatusPill>
                      <StatusPill tone="info">{t.vertical}</StatusPill>
                      <StatusPill tone="accent">{t.plan_tier}</StatusPill>
                      {t.bilingual && (
                        <StatusPill tone="warning">
                          {t.primary_language} · bilingual
                        </StatusPill>
                      )}
                    </div>
                    <p className="mt-1.5 text-[12px] text-g-text-muted">
                      Created {relTime(t.created_at)}
                      {t.service_area_zips && t.service_area_zips.length > 0 && (
                        <>
                          {" · "}
                          {t.service_area_zips.length} ZIP
                          {t.service_area_zips.length === 1 ? "" : "s"}
                        </>
                      )}
                      {" · "}
                      <Users2 className="inline h-3 w-3 -mt-0.5" /> {mems.length}{" "}
                      member{mems.length === 1 ? "" : "s"}
                      {" · "}
                      {invs.length} invitation
                      {invs.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.brand_primary_hex && (
                      <span
                        title={`primary ${t.brand_primary_hex}`}
                        aria-label={`Brand primary ${t.brand_primary_hex}`}
                        className="h-6 w-6 rounded-md border border-g-border"
                        style={{ backgroundColor: t.brand_primary_hex }}
                      />
                    )}
                    {t.brand_accent_hex && (
                      <span
                        title={`accent ${t.brand_accent_hex}`}
                        aria-label={`Brand accent ${t.brand_accent_hex}`}
                        className="h-6 w-6 rounded-md border border-g-border"
                        style={{ backgroundColor: t.brand_accent_hex }}
                      />
                    )}
                  </div>
                </header>

                <div className="rounded-md border border-g-border bg-g-surface-2 p-3">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
                    Invite operator
                  </div>
                  <InviteForm tenantId={t.id} />
                </div>

                {invs.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
                      Active invitations
                    </div>
                    <ul className="flex flex-col divide-y divide-g-border rounded-md border border-g-border bg-g-surface">
                      {invs.map((inv) => (
                        <li
                          key={`${inv.tenant_id}|${inv.email}`}
                          className="flex flex-wrap items-center justify-between gap-2 p-2.5"
                        >
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <span className="text-[13px] text-g-text">
                              {inv.email}
                            </span>
                            <StatusPill tone={roleTone(inv.role)}>
                              {inv.role}
                            </StatusPill>
                            <span className="font-geist-mono text-[11px] text-g-text-faint">
                              {relTime(inv.created_at)}
                            </span>
                            {inv.invited_by && (
                              <span className="text-[11px] text-g-text-faint">
                                by {inv.invited_by}
                              </span>
                            )}
                          </div>
                          <form action={revokeInvitationVoid}>
                            <input
                              type="hidden"
                              name="tenant_id"
                              value={inv.tenant_id}
                            />
                            <input
                              type="hidden"
                              name="email"
                              value={inv.email}
                            />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                            >
                              Revoke
                            </Button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function roleTone(role: string): Tone {
  switch (role) {
    case "owner":
      return "accent";
    case "admin":
      return "info";
    case "operator":
      return "success";
    case "viewer":
      return "neutral";
    default:
      return "neutral";
  }
}
