import { redirect } from "next/navigation";
import { UserPlus, Phone, Mail, MapPin, Wrench, Globe, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { relTime } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
  address: string | null;
  notes: string | null;
  source_endpoint: string;
  page_url: string | null;
  utm_source: string | null;
  customer_id: string | null;
  created_at: string;
};

const DEMO_LEADS: Lead[] = [
  {
    id: "demo-1",
    name: "Marcus Hernandez",
    email: "marcus.h@gmail.com",
    phone: "+18139001234",
    service: "Holiday lighting install",
    address: "1420 Bayshore Dr, Tampa FL",
    notes: "Wants full roofline + tree wraps. Asked about color options.",
    source_endpoint: "website",
    page_url: "/contact",
    utm_source: "google",
    customer_id: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    name: "Jennifer Okafor",
    email: "jen.okafor@outlook.com",
    phone: "+18139885577",
    service: "Landscape lighting design",
    address: "9310 Palma Ceia Way, Tampa FL",
    notes: null,
    source_endpoint: "website",
    page_url: "/services",
    utm_source: null,
    customer_id: "demo-cust-1",
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    name: "Robert Castillo",
    email: null,
    phone: "+18131234567",
    service: "Outdoor string lights – patio",
    address: "5544 Riviera Dr, Sarasota FL",
    notes: "Needs quote ASAP for a party next weekend.",
    source_endpoint: "website",
    page_url: "/",
    utm_source: "facebook",
    customer_id: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function LeadsPage() {
  const session = await readAppSession();
  if (session.kind === "unauthenticated") redirect("/app/login");

  let leads: Lead[] = [];
  let isDemo = false;

  if (session.kind === "tenant") {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from("tenant_inbound_leads")
      .select(
        "id, name, email, phone, service, address, notes, source_endpoint, page_url, utm_source, customer_id, created_at",
      )
      .eq("tenant_id", session.tenant.id)
      .order("created_at", { ascending: false })
      .limit(200);
    leads = (data ?? []) as Lead[];
  } else {
    leads = DEMO_LEADS;
    isDemo = true;
  }

  const newCount = leads.filter((l) => !l.customer_id).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Customers"
        title="Leads"
        subtitle={
          leads.length === 0
            ? "No leads yet — add the snippet to your website to start capturing"
            : `${leads.length} total · ${newCount} new`
        }
      />

      {isDemo && (
        <div className="rounded-lg border border-g-border bg-g-surface-2 px-4 py-3 text-[12px] text-g-text-muted">
          Demo mode — showing sample data. Real leads appear here once your website is wired up.
        </div>
      )}

      {leads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No leads yet"
          body="Add the snippet from your Settings → Integrations page to your website. Every form submission will appear here instantly."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="g-card flex flex-col gap-3 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium text-g-text">
                      {lead.name ?? "Unknown"}
                    </span>
                    <StatusPill tone={lead.customer_id ? "success" : "accent"}>
                      {lead.customer_id ? "Customer" : "New"}
                    </StatusPill>
                    {lead.utm_source && (
                      <StatusPill tone="info">{lead.utm_source}</StatusPill>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    {lead.phone && (
                      <span className="flex items-center gap-1 text-[12px] text-g-text-muted">
                        <Phone className="h-3 w-3 shrink-0" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.email && (
                      <span className="flex items-center gap-1 text-[12px] text-g-text-muted">
                        <Mail className="h-3 w-3 shrink-0" />
                        {lead.email}
                      </span>
                    )}
                    {lead.address && (
                      <span className="flex items-center gap-1 text-[12px] text-g-text-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {lead.address}
                      </span>
                    )}
                    {lead.service && (
                      <span className="flex items-center gap-1 text-[12px] text-g-text-muted">
                        <Wrench className="h-3 w-3 shrink-0" />
                        {lead.service}
                      </span>
                    )}
                  </div>

                  {lead.notes && (
                    <p className="mt-1.5 text-[12px] text-g-text-muted leading-[1.5] max-w-prose">
                      {lead.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="flex items-center gap-1 text-[11px] text-g-text-faint">
                    <Clock className="h-3 w-3" />
                    {relTime(lead.created_at)}
                  </span>
                  {lead.page_url && (
                    <span className="flex items-center gap-1 text-[11px] text-g-text-faint">
                      <Globe className="h-3 w-3" />
                      {lead.page_url}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
