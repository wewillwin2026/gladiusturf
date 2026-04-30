import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  APP_COOKIE_NAME,
  LEGACY_APP_COOKIE_NAME,
  verifyAppSessionCookieValue,
} from "@/lib/app-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const session =
    store.get(APP_COOKIE_NAME)?.value ?? store.get(LEGACY_APP_COOKIE_NAME)?.value;
  if (!verifyAppSessionCookieValue(session)) {
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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
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
        console.error("[ai/quote] anthropic error", err);
        controller.enqueue(
          encoder.encode(
            "\n\n[scope-of-work generation failed — falling back to a manual draft]",
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
