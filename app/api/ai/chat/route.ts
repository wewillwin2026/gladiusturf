import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";
import { demoState } from "@/lib/demo/state";
import { money } from "@/lib/shared/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/chat
 *  body: { messages: { role: "user"|"assistant", content: string }[] }
 *  → text/event-stream of Claude Sonnet 4.6 tokens
 *
 * The system prompt embeds a JSON snapshot of the seeded Cypress Lawn data
 * (KPIs, top customers, open quotes, overdue invoices, recent activity), so
 * questions like "show me overdue invoices" or "which customers are at risk"
 * get answered with real numbers — not generic LLM platitudes.
 */
export async function POST(req: Request) {
  const store = await cookies();
  const session =
    store.get(APP_COOKIE_NAME)?.value ?? store.get(LEGACY_APP_COOKIE_NAME)?.value;
  if (!verifyAppSessionCookieValue(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    messages?: { role: "user" | "assistant"; content: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (m) =>
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  );
  if (messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return streamFallback(messages[messages.length - 1]!.content);
  }

  const snapshot = buildDataSnapshot();

  const systemPrompt = [
    "You are Gladius, the operations co-pilot for Cypress Lawn & Landscape — a high-end residential and small-commercial landscaping company in Tampa, FL with 6 crews and 247 customers.",
    "",
    "Answer ops questions in 1-3 short paragraphs. Reference REAL numbers from the JSON snapshot below. Cite specific customer names, dollar amounts, and routes when relevant.",
    "",
    "Rules:",
    "- Never invent numbers. If the snapshot doesn't contain the answer, say so and suggest where to look.",
    "- Use plain text. No markdown, no bullet points unless absolutely necessary, no headers.",
    "- Keep answers tight: 60-180 words is the sweet spot.",
    "- Sound like an operator, not a chatbot. Drop hedging language.",
    "- When listing customers, format as 'Customer Name ($X)' inline.",
    "",
    "Operational snapshot (current data):",
    JSON.stringify(snapshot, null, 2),
  ].join("\n");

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        });
        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("[ai/chat] anthropic error", err);
        controller.enqueue(
          encoder.encode(
            "\n\n[chat unavailable — check ANTHROPIC_API_KEY in Vercel env]",
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

function buildDataSnapshot() {
  const state = demoState();
  const now = Date.now();

  const overdueInvoices = state.invoices
    .filter((i) => i.status === "Overdue")
    .slice(0, 12)
    .map((i) => ({
      id: i.id,
      customer: state.customers.find((c) => c.id === i.customerId)?.name,
      amount: money(i.amountCents),
      dueAt: i.dueAt.slice(0, 10),
    }));

  const topCustomers = [...state.customers]
    .sort((a, b) => b.ltvCents - a.ltvCents)
    .slice(0, 8)
    .map((c) => ({
      name: c.name,
      tier: c.tier,
      ltv: money(c.ltvCents),
      route: c.routeId,
      status: c.status,
      lastVisit: c.lastVisit.slice(0, 10),
    }));

  const atRiskCustomers = state.customers
    .filter((c) => c.status === "Lapsed")
    .slice(0, 6)
    .map((c) => ({
      name: c.name,
      tier: c.tier,
      ltv: money(c.ltvCents),
      lastVisit: c.lastVisit.slice(0, 10),
    }));

  const openQuotes = state.quotes
    .filter((q) => q.stage === "Sent" || q.stage === "Viewed")
    .map((q) => ({
      id: q.id,
      customer: state.customers.find((c) => c.id === q.customerId)?.name,
      total: money(q.total),
      stage: q.stage,
    }));

  const wonQuotes = state.quotes.filter((q) => q.stage === "Won").length;
  const lostQuotes = state.quotes.filter((q) => q.stage === "Lost").length;

  const today = state.jobs.filter((j) => {
    const t = new Date(j.scheduledAt);
    const n = new Date();
    return (
      t.getFullYear() === n.getFullYear() &&
      t.getMonth() === n.getMonth() &&
      t.getDate() === n.getDate()
    );
  });

  const recentActivity = state.activity.slice(0, 10).map((e) => ({
    when: relativeAge(e.ts, now),
    text: e.text,
    amount: e.amountCents != null ? money(e.amountCents) : null,
  }));

  return {
    company: state.company,
    summary: {
      activeCustomers: state.customers.filter((c) => c.status === "Active").length,
      lapsedCustomers: state.customers.filter((c) => c.status === "Lapsed").length,
      crewsActive: state.crews.length,
      visitsToday: today.length,
      openQuotes: openQuotes.length,
      wonQuotes,
      lostQuotes,
      winRatePct: Math.round((wonQuotes / Math.max(1, wonQuotes + lostQuotes)) * 100),
      overdueInvoiceCount: overdueInvoices.length,
      arOver30Days: money(
        overdueInvoices.reduce(
          (s, _i) =>
            s +
            (state.invoices.find((x) => x.id === _i.id)?.amountCents ?? 0),
          0,
        ),
      ),
    },
    topCustomers,
    atRiskCustomers,
    openQuotes,
    overdueInvoices,
    recentActivity,
    crews: state.crews.map((c) => ({
      name: c.name,
      vehicle: c.vehiclePlate,
      members: c.members.length,
    })),
  };
}

function relativeAge(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.round(diff / 3600_000)}h ago`;
  return `${Math.round(diff / 86400_000)}d ago`;
}

function streamFallback(question: string): Response {
  const text =
    `Live AI chat needs ANTHROPIC_API_KEY in Vercel env. Once set, this surface answers ops questions like "${question.slice(0, 60)}" with real numbers from the seeded data — overdue invoices, at-risk customers, route revenue, quote pipeline. The stream you're seeing now is the offline fallback so the UI behavior is identical to the real path.`;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const tokens = text.split(/(\s+)/);
      for (const t of tokens) {
        controller.enqueue(encoder.encode(t));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
