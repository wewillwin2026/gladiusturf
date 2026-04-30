"use client";

import * as React from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { create } from "zustand";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Input";
import { type ProductKind } from "./engines";
import { cn } from "@/lib/cn";
import { track } from "@/lib/tracking/client";

type Msg = { role: "user" | "assistant"; content: string };

type ChatStore = {
  messages: Msg[];
  pending: string;
  loading: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  reset: () => void;
  push: (m: Msg) => void;
  appendPending: (s: string) => void;
  setPending: (s: string) => void;
  setLoading: (v: boolean) => void;
};

export const useAskGladius = create<ChatStore>((set) => ({
  messages: [],
  pending: "",
  loading: false,
  open: false,
  setOpen: (v) => set({ open: v }),
  reset: () => set({ messages: [], pending: "" }),
  push: (m) => set((s) => ({ messages: [...s.messages, m] })),
  appendPending: (s) => set((st) => ({ pending: st.pending + s })),
  setPending: (s) => set({ pending: s }),
  setLoading: (v) => set({ loading: v }),
}));

const SUGGESTIONS = [
  "Show me overdue invoices",
  "Which customers are at risk this week?",
  "What's our win rate this month?",
  "Best route by revenue density",
  "Top 5 promoters this month",
];

/**
 * Ask Gladius surface. Used both as the dedicated /app/ask-gladius page (full
 * height) and as a floating panel from FloatingAskGladiusButton.
 */
export function AskGladius({
  variant,
  product,
  onClose,
}: {
  variant: "panel" | "page";
  product: ProductKind;
  onClose?: () => void;
}) {
  const { messages, pending, loading, push, appendPending, setPending, setLoading, reset } =
    useAskGladius();
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    push({ role: "user", content: trimmed });
    setLoading(true);
    setPending("");
    track("ai_chat_message", { product, length: trimmed.length });
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...useAskGladius.getState().messages, { role: "user", content: trimmed }],
        }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        appendPending(chunk);
      }
      push({ role: "assistant", content: acc });
      setPending("");
    } catch (err) {
      push({
        role: "assistant",
        content: "Couldn't reach the model. Try again in a sec.",
      });
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  const isPanel = variant === "panel";

  return (
    <div
      className={cn(
        "flex flex-col bg-g-surface",
        isPanel
          ? "w-[400px] h-[600px] g-card shadow-2xl"
          : "h-[calc(100vh-220px)] min-h-[520px] g-card",
      )}
    >
      <header className="flex items-center justify-between px-4 h-12 border-b border-g-border-subtle">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-g-accent-faint border border-g-accent/40 inline-flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-g-accent" />
          </span>
          <div>
            <div className="text-[13px] font-medium text-g-text">Ask Gladius</div>
            <div className="text-[10px] text-g-text-faint">
              {product === "founders"
                ? "Real Supabase data · Sonnet 4.6"
                : "Cypress Lawn data · Sonnet 4.6"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint hover:text-g-text px-2"
            >
              Reset
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-g-text-faint hover:text-g-text hover:bg-g-surface-2"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.length === 0 && !pending && (
          <div className="flex-1 flex flex-col gap-3 text-center">
            <div className="mt-6">
              <Sparkles className="h-10 w-10 text-g-accent mx-auto" />
              <h2 className="mt-3 text-g-text">Ask anything about your shop</h2>
              <p className="mt-1 text-[13px] text-g-text-muted">
                Pipeline, AR, churn risk, route density, today&rsquo;s schedule —
                Sonnet 4.6 answers from your live ops snapshot.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-[11px] px-2.5 py-1.5 rounded-md border border-g-border-subtle bg-g-surface-2/40 text-g-text-muted hover:text-g-text hover:border-g-accent/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {pending && <Bubble role="assistant" content={pending} streaming />}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-g-border-subtle p-3 flex items-end gap-2"
      >
        <Textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything…"
          rows={2}
          className="text-[13px]"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}

function Bubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <span className="h-7 w-7 shrink-0 rounded-full bg-g-accent-faint border border-g-accent/40 inline-flex items-center justify-center text-g-accent">
          <Bot className="h-3.5 w-3.5" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-3 py-2 text-[13px] whitespace-pre-wrap leading-relaxed",
          isUser
            ? "bg-g-accent text-black rounded-br-sm"
            : "bg-g-surface-2 text-g-text border border-g-border-subtle rounded-bl-sm",
        )}
      >
        {content}
        {streaming && (
          <span className="inline-block w-1 h-3 ml-0.5 bg-g-accent animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

/**
 * Floating bottom-right launcher button. Wired into AppShell so it shows on
 * every authed page in the demo CRM and War Room.
 */
export function FloatingAskGladiusButton({
  product,
}: {
  product: ProductKind;
}) {
  const { open, setOpen } = useAskGladius();
  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            track("ai_chat_open", { product, source: "floating" });
            setOpen(true);
          }}
          aria-label="Open Ask Gladius"
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-g-accent text-black shadow-2xl flex items-center justify-center hover:bg-g-accent-hover transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40">
          <AskGladius variant="panel" product={product} onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
