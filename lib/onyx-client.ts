/**
 * @onyx/client — drop-in Onyx Brain client for sibling Gladius apps.
 *
 * Usage in gladius-crm / GladiusStone / gladiusturf-com / gofetch-t3:
 *
 *   1. Copy this file to your repo: `src/lib/onyx-client.ts`
 *   2. Set ONYX_BRAIN_SECRET env var (same value as ONYX_BRAIN_EXTERNAL_SECRET on gladiusbdc.com)
 *   3. Server-side:
 *        import { onyx } from "@/lib/onyx-client";
 *        const answer = await onyx.ask("what's the rule on BHPH?", { tenant: "crm" });
 *   4. Client-side (optional widget):
 *        import { OnyxLauncher } from "@/lib/onyx-client";
 *        <OnyxLauncher tenant="crm" />
 *
 * The widget POSTs to /api/onyx-proxy in your own app, which forwards
 * to gladiusbdc.com/api/onyx/brain/external with the shared secret.
 * Set up the proxy in your app at /api/onyx-proxy/route.ts:
 *
 *     export async function POST(req: Request) {
 *       return fetch("https://gladiusbdc.com/api/onyx/brain/external", {
 *         method: "POST",
 *         headers: {
 *           "Authorization": `Bearer ${process.env.ONYX_BRAIN_SECRET}`,
 *           "Content-Type":  "application/json",
 *           "x-onyx-tenant": "crm",
 *         },
 *         body: req.body,
 *       });
 *     }
 *
 * Homegrown. No dependency. Just fetch + a tiny React component.
 */

// ──────────────────────────────────────────────────────────────────
// Server-side helper
// ──────────────────────────────────────────────────────────────────

export interface OnyxAskOptions {
  tenant?:        string;
  systemPrompt?:  string;
  conversationId?: string;
  stage?:         string;
}

export interface OnyxAskResponse {
  ok:           boolean;
  text?:        string;
  error?:       string;
  providerId?:  string;
  latencyMs?:   number;
  costUsd?:     number;
  attribution?: { tenant: string; principalId: string };
}

const ONYX_HOST = process.env.NEXT_PUBLIC_ONYX_HOST ?? "https://gladiusbdc.com";

/**
 * Server-side: ask Onyx a question. Returns the brain's answer.
 *
 * Requires ONYX_BRAIN_SECRET on the calling server. Never call from
 * a browser — the secret would leak. Use OnyxLauncher for client-side.
 */
export const onyx = {
  async ask(question: string, opts: OnyxAskOptions = {}): Promise<OnyxAskResponse> {
    const secret = process.env.ONYX_BRAIN_SECRET;
    if (!secret) {
      return { ok: false, error: "ONYX_BRAIN_SECRET env var not set" };
    }
    try {
      const res = await fetch(`${ONYX_HOST}/api/onyx/brain/external`, {
        method:  "POST",
        headers: {
          "Authorization": `Bearer ${secret}`,
          "Content-Type":  "application/json",
          "x-onyx-tenant": opts.tenant ?? "external",
        },
        body: JSON.stringify({
          stage:        opts.stage ?? "THINK",
          systemPrompt: opts.systemPrompt
            ?? `You are Onyx, the founder's operator AI for the Gladius empire. The caller is the ${opts.tenant ?? "external"} app. Answer in 2-3 sentences, ground in OnyxKnowledge when relevant.`,
          messages:     [{ role: "user", content: question }],
          attribution:  {
            conversationId: opts.conversationId,
            source:         opts.tenant ?? "external",
          },
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) {
        return { ok: false, error: `Onyx HTTP ${res.status}` };
      }
      return (await res.json()) as OnyxAskResponse;
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Onyx call failed" };
    }
  },
};
