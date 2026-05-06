import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";
import { readAppSession } from "@/lib/app/session";
import { logAiRun, type AiSessionKind } from "@/lib/ai/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROMPT_VERSION = "quote-drafter@v1";

/**
 * POST /api/ai/quote
 *  body: { address, measurements: { turfSqft, drivewaySqft, bedsSqft, trees },
 *          services: string[] }
 *  → text/event-stream of Claude Sonnet 4.6 tokens
 *
 * The system prompt tells Claude to write a 5-7 sentence scope-of-work
 * paragraph for a residential lawn-care quote in Tampa. We stream because
 * the textarea fills token-by-token in the UI — the demo wow moment.
 */
export async function POST(req: Request) {
  const store = await cookies();
  const cookieRaw =
    store.get(APP_COOKIE_NAME)?.value ?? store.get(LEGACY_APP_COOKIE_NAME)?.value;
  if (!verifyAppSessionCookieValue(cookieRaw)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful degradation: write a plausible fixed scope so the demo still
    // works if the env var hasn't been set. Streamed character-by-character
    // so the UI behavior matches the real path.
    return streamFallback(req);
  }

  let body: {
    address?: string;
    measurements?: {
      turfSqft?: number;
      drivewaySqft?: number;
      bedsSqft?: number;
      trees?: number;
    };
    services?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const address = String(body.address || "").trim();
  const m = body.measurements ?? {};
  const services = (body.services ?? []).filter(Boolean);

  const userPrompt = [
    `Address: ${address || "(not provided)"}`,
    `Turf: ${m.turfSqft ?? 0} sqft`,
    `Driveway: ${m.drivewaySqft ?? 0} sqft`,
    `Beds / mulch areas: ${m.bedsSqft ?? 0} sqft`,
    `Trees: ${m.trees ?? 0}`,
    `Selected services: ${services.length ? services.join(", ") : "(none yet)"}`,
    ``,
    `Write the scope-of-work paragraph.`,
  ].join("\n");

  const systemPrompt = [
    "You are an estimator at Cypress Lawn & Landscape, a high-end residential",
    "and small-commercial landscaping company in Tampa, FL. You write the",
    "scope-of-work paragraph that goes inside a customer-facing quote.",
    "",
    "Style:",
    "- 5-7 sentences, conversational but precise.",
    "- Reference the actual measurements (sqft, # trees) when relevant.",
    "- Mention any included follow-ups (e.g., 14-day post-aeration check-in).",
    "- Sign off with a single line: 'Crew availability: Tuesday or Thursday this week.'",
    "- Never invent a price. Never include bullet lists.",
    "- Don't use markdown. Plain text only.",
  ].join("\n");

  const client = new Anthropic({ apiKey });
  const session = await readAppSession();
  const sessionKind: AiSessionKind =
    session.kind === "tenant"
      ? "tenant"
      : session.kind === "demo"
        ? "demo"
        : "unknown";
  const tenantId =
    session.kind === "tenant" ? session.tenant.id : null;
  const model = "claude-sonnet-4-6";

  const encoder = new TextEncoder();
  let collectedOutput = "";
  let usage: {
    input_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
    output_tokens?: number;
  } = {};
  const startedAt = Date.now();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model,
          max_tokens: 600,
          // Same prompt-cache pattern as Ask Gladius — system block is
          // stable across requests, so caching shaves input cost.
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: userPrompt }],
          stream: true,
        });
        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            collectedOutput += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          } else if (event.type === "message_start") {
            usage = {
              input_tokens: event.message?.usage?.input_tokens,
              cache_read_input_tokens:
                event.message?.usage?.cache_read_input_tokens ?? undefined,
              cache_creation_input_tokens:
                event.message?.usage?.cache_creation_input_tokens ?? undefined,
            };
          } else if (event.type === "message_delta") {
            const out = event.usage?.output_tokens;
            if (typeof out === "number") {
              usage = { ...usage, output_tokens: out };
            }
          }
        }
        controller.close();
      } catch (err) {
        console.error("[ai/quote] anthropic error", err);
        controller.enqueue(
          encoder.encode(
            "\n\n[scope-of-work generation failed — falling back to a manual draft]",
          ),
        );
        controller.close();
      } finally {
        const cachedInput =
          (usage.cache_read_input_tokens ?? 0) +
          (usage.cache_creation_input_tokens ?? 0);
        void logAiRun({
          tenantId,
          sessionKind,
          surface: "quote-drafter",
          model,
          systemPrompt,
          promptVersion: PROMPT_VERSION,
          inputTokens: usage.input_tokens ?? null,
          cachedInputTokens: cachedInput || null,
          outputTokens: usage.output_tokens ?? null,
          output: collectedOutput,
          meta: {
            latency_ms: Date.now() - startedAt,
            address,
            services,
          },
        });
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

function streamFallback(_req: Request): Response {
  const text =
    "Service window covers a full residential maintenance pass with crew arriving between 8 and 10 AM. We'll mow the turf, edge along driveway and walkway lines, blow off all hardscape, and bag clippings unless a mulch return is requested. The fertilization and weed-control application is scheduled as a separate visit 7 days after the first mow so the turf is short enough for direct contact with the granular blend. We'll inspect the bed lines while we're on site and flag any drainage or grub-damage concerns directly with the homeowner. The trees on the property will get a quick visual health check; any storm-damaged limbs will be reported same day. All work is photo-documented and uploaded to the customer portal within an hour of completion.\n\nCrew availability: Tuesday or Thursday this week.";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const tokens = text.split(/(\s+)/);
      for (const t of tokens) {
        controller.enqueue(encoder.encode(t));
        await new Promise((r) => setTimeout(r, 24));
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
