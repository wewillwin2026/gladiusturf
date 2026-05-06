import { ArrowRight, Plus, Users } from "lucide-react";
import Link from "next/link";
import { CustomersBrowser } from "@/components/app/CustomersBrowser";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { readAppSession } from "@/lib/app/session";
import { demoState } from "@/lib/demo/state";
import { supabaseAdmin } from "@/lib/supabase";
import type { Customer } from "@/lib/shared/types";

export const dynamic = "force-dynamic";

type DbCustomer = {
  id: string;
  display_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  service_address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    lat?: number;
    lng?: number;
  } | null;
  customer_tier: string | null;
  acquired_at: string | null;
  created_at: string;
  notes: string | null;
};

/**
 * Maps a tenant-scoped customers row into the shape <CustomersBrowser/>
 * expects. Many of the Customer fields (routeId, ltvCents, status, etc.)
 * have no equivalent in the v1 multi-tenant schema yet — those degrade to
 * sensible defaults until later phases add jobs / routes / invoices tables
 * for real revenue rollups.
 */
function dbCustomerToUI(c: DbCustomer): Customer {
  const addr = c.service_address ?? {};
  const tierLower = (c.customer_tier ?? "").toLowerCase();
  return {
    id: c.id,
    name: c.display_name,
    email: c.primary_email ?? "",
    phone: c.primary_phone ?? "",
    address: addr.street ?? "",
    city: addr.city ?? "",
    state: addr.state ?? "",
    zip: addr.zip ?? "",
    lat: addr.lat ?? 0,
    lng: addr.lng ?? 0,
    status: "Active",
    tier:
      tierLower === "guardian" || tierLower === "enterprise"
        ? "Enterprise"
        : tierLower === "care" || tierLower === "professional"
          ? "Pro"
          : "Independent",
    ltvCents: 0,
    routeId: "",
    lastVisit: c.acquired_at ?? c.created_at,
    nextVisit: null,
    joinedAt: c.created_at,
    npsScore: null,
    notes: c.notes ?? undefined,
  };
}

export default async function CustomersPage() {
  const session = await readAppSession();

  // Tenant session — query the real customers table.
  if (session.kind === "tenant") {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("customers")
      .select(
        "id, display_name, primary_email, primary_phone, service_address, customer_tier, acquired_at, created_at, notes",
      )
      .eq("tenant_id", session.tenant.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return (
        <div className="flex flex-col gap-6">
          <PageHeader
            eyebrow={session.tenant.display_name}
            title="Customers"
            subtitle="Couldn't load customer rows from Supabase. Re-try in a minute."
          />
          <EmptyState
            icon={Users}
            title="Database error"
            body={error.message}
          />
        </div>
      );
    }

    const rows = (data ?? []) as DbCustomer[];

    if (rows.length === 0) {
      return (
        <div className="flex flex-col gap-6">
          <PageHeader
            eyebrow={session.tenant.display_name}
            title="Customers"
            subtitle="Your customer list lives here. Import a CSV or add your first customer to get started."
            actions={
              <>
                <Link href="/app/import/customers" prefetch>
                  <Button variant="secondary">Import CSV</Button>
                </Link>
                <Link href="/app/customers/new" prefetch>
                  <Button variant="primary">
                    <Plus className="h-3.5 w-3.5" />
                    Add customer
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </>
            }
          />
          <EmptyState
            icon={Users}
            title="No customers yet"
            body="When you add your first customer (or import a CSV from your old tool), they'll appear here. Until then, the rest of the workspace is ready and waiting."
          />
        </div>
      );
    }

    const customers = rows.map(dbCustomerToUI);
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={session.tenant.display_name}
          title="Customers"
          subtitle={`${customers.length} on file · ${session.tenant.bilingual ? "EN + ES" : session.tenant.primary_language.toUpperCase()}`}
          actions={
            <>
              <Link href="/app/import/customers" prefetch>
                <Button variant="secondary">Import CSV</Button>
              </Link>
              <Link href="/app/customers/new" prefetch>
                <Button variant="primary">
                  <Plus className="h-3.5 w-3.5" />
                  New customer
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </>
          }
        />
        <CustomersBrowser
          customers={customers}
          routes={[]}
          mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null}
        />
      </div>
    );
  }

  // Demo session — preserve the existing Cypress Lawn seed for sales calls.
  const state = demoState();
  const routes = Array.from(new Set(state.customers.map((c) => c.routeId))).sort();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cypress Lawn"
        title="Customers"
        subtitle={`${state.customers.filter((c) => c.status === "Active").length} active · ${state.customers.length} total · 6 routes`}
        actions={
          <>
            <Button variant="secondary">Export CSV</Button>
            <Link href="/app/quotes/new" prefetch>
              <Button variant="primary">
                <Plus className="h-3.5 w-3.5" />
                New customer
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </>
        }
      />
      <CustomersBrowser
        customers={state.customers}
        routes={routes}
        mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null}
      />
    </div>
  );
}
