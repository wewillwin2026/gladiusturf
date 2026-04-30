import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";
import { demoState } from "@/lib/demo/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const session =
    store.get(APP_COOKIE_NAME)?.value ?? store.get(LEGACY_APP_COOKIE_NAME)?.value;
  if (!verifyAppSessionCookieValue(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const state = demoState();
  const customerNameById = new Map(
    state.customers.map((c) => [c.id, c.name] as const),
  );

  return NextResponse.json({
    customers: state.customers
      .filter((c) => c.status === "Active")
      .slice(0, 60)
      .map((c) => ({
        id: c.id,
        name: c.name,
        address: `${c.address}, ${c.city} ${c.zip}`,
      })),
    jobs: state.jobs.slice(-40).map((j) => ({
      id: j.id,
      service: j.service,
      ts: j.scheduledAt,
      customer: customerNameById.get(j.customerId) ?? "Customer",
    })),
    quotes: state.quotes.map((q) => ({
      id: q.id,
      total: q.total,
      stage: q.stage,
      customer: customerNameById.get(q.customerId) ?? "Customer",
    })),
    invoices: state.invoices.slice(0, 20).map((i) => ({
      id: i.id,
      amount: i.amountCents,
      status: i.status,
      customer: customerNameById.get(i.customerId) ?? "Customer",
    })),
  });
}
