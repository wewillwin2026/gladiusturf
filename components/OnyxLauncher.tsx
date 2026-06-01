"use client";

/**
 * <OnyxLauncher /> — drop-in chat widget for sibling Gladius apps.
 *
 * Usage:
 *   1. Copy this file to your repo: src/components/OnyxLauncher.tsx
 *   2. Set up /api/onyx-proxy/route.ts (5 lines, see onyx-client.ts header)
 *   3. Render: <OnyxLauncher tenant="crm" />
 *
 * Floating emerald button bottom-right → click to open a chat overlay.
 * Streams responses, shows reasoning trace, founder-only via your
 * existing auth (the widget is just a UI; the proxy enforces founder
 * gating server-side).
 */
import { useEffect, useRef, useState } from "react";

interface Message { role: "user" | "onyx"; text: string; at: Date }

export function OnyxLauncher({ tenant }: { tenant: string }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [busy, setBusy]         = useState(false);
  const convoId                 = useRef<string>(`${tenant}-${Math.random().toString(36).slice(2, 10)}`);
  const scrollRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q, at: new Date() }]);
    setBusy(true);
    try {
      const res = await fetch("/api/onyx-proxy", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          stage:        "THINK",
          systemPrompt: `You are Onyx, the founder's operator AI. You're being asked from the ${tenant} app. Answer concisely.`,
          messages:     [{ role: "user", content: q }],
          attribution:  { conversationId: convoId.current, source: tenant },
        }),
      });
      const data = await res.json() as { ok?: boolean; text?: string; error?: string };
      const answer = data.ok ? (data.text ?? "(no answer)") : `Error: ${data.error}`;
      setMessages((m) => [...m, { role: "onyx", text: answer, at: new Date() }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "onyx", text: `Error: ${err instanceof Error ? err.message : "request failed"}`, at: new Date() }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 text-emerald-950 text-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
          aria-label="Open Onyx"
        >
          ◉
        </button>
      )}

      {/* Chat overlay */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-zinc-950 border border-emerald-700/40 rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">Onyx</div>
              <div className="text-sm text-zinc-100 font-semibold">Ask the brain · {tenant}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-500 hover:text-zinc-200 text-xl leading-none"
              aria-label="Close"
            >×</button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 text-sm pt-8">
                Ask Onyx anything. Grounded in your corpus.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={[
                "rounded-lg p-3 text-sm",
                m.role === "user"
                  ? "bg-zinc-800 text-zinc-100 ml-6"
                  : "bg-emerald-950/30 border border-emerald-700/30 text-emerald-100 mr-6",
              ].join(" ")}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{
                  color: m.role === "user" ? "rgb(161 161 170)" : "rgb(110 231 196)",
                }}>{m.role === "user" ? "you" : "onyx"}</div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}
            {busy && (
              <div className="text-center text-[10px] uppercase tracking-wider text-emerald-400/70 animate-pulse">
                thinking…
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); void send(); }}
            className="p-3 border-t border-zinc-800 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ask anything…"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/60"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="px-4 py-2 rounded-md bg-emerald-500 text-emerald-950 text-sm font-semibold disabled:opacity-50"
            >Send</button>
          </form>
        </div>
      )}
    </>
  );
}

export default OnyxLauncher;
