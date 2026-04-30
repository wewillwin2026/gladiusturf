import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { CustomersBrowser } from "@/components/app/CustomersBrowser";
import { demoState } from "@/lib/demo/state";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
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
