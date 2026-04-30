"use client";

import * as React from "react";
import { Phone, X, Check, Loader2 } from "lucide-react";

type State = "idle" | "form" | "submitting" | "countdown" | "delivered" | "error";

export function BDCCallbackButton() {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<State>("idle");
  const [name, setName] = React.useState("");
  const [shop, setShop] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [seconds, setSeconds] = React.useState(60);

  function reset() {
    setOpen(false);
    setTimeout(() => {
      setState("idle");
      setName("");
      setShop("");
      setPhone("");
      setTopic("");
      setSeconds(60);
    }, 240);
  }

  React.useEffect(() => {
    if (state !== "countdown") return;
    if (seconds <= 0) {
      setState("delivered");
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [state, seconds]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    if (phone.replace(/\D/g, "").length < 10) return;
    setState("submitting");
    try {
      const res = await fetch("/api/bdc/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shop, phone, topic }),
      });
      if (!res.ok) throw new Error("submit failed");
      setSeconds(60);
      setState("countdown");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setState("form");
        }}
        className="group inline-flex items-center gap-3 rounded-full border border-moss-bright/40 bg-moss-bright/10 px-5 py-3 text-[13px] font-semibold text-moss-bright transition-colors hover:border-moss-bright hover:bg-moss-bright/20"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-moss-bright/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss-bright" />
        </span>
        <Phone className="h-4 w-4" aria-hidden />
        Get a callback in 60 seconds — live AI BDC
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
          style={{ background: "rgba(8, 10, 9, 0.78)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) reset();
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-bone/15 bg-pitch p-6 shadow-2xl">
            <button
              type="button"
              onClick={reset}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1 text-bone/50 transition-colors hover:bg-bone/10 hover:text-bone"
            >
              <X className="h-4 w-4" />
            </button>

            {state === "form" && (
              <>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss-bright">
                  GladiusBDC · Live AI callback
                </div>
                <h2 className="mt-2 font-serif text-2xl text-bone">
                  We&rsquo;ll call you back inside 60 seconds.
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-bone/60">
                  This is the same engine that handles your inbound call volume
                  for $499/mo. Drop your number, we ring within a minute. No
                  voicemail, no SDR. A founder picks up.
                </p>

                <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
                  <Field
                    label="Your name"
                    value={name}
                    onChange={setName}
                    placeholder="Marcus Cypress"
                    required
                  />
                  <Field
                    label="Shop name"
                    value={shop}
                    onChange={setShop}
                    placeholder="Cypress Lawn & Landscape"
                    required
                  />
                  <Field
                    label="Phone"
                    value={phone}
                    onChange={setPhone}
                    placeholder="(813) 555-0117"
                    type="tel"
                    required
                  />
                  <Field
                    label="What do you want us to know?"
                    value={topic}
                    onChange={setTopic}
                    placeholder="Currently on RealGreen, 6 crews, ~$1.4M ARR"
                    multiline
                  />

                  <button
                    type="submit"
                    disabled={!phone || !name || !shop}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-moss-bright px-5 py-3 text-[13px] font-semibold text-obsidian transition-colors hover:bg-moss-bright/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Ring me in 60 seconds
                  </button>
                  <p className="text-center text-[11px] text-bone/40">
                    By submitting, you agree we may call the number you provide
                    once. No marketing list.
                  </p>
                </form>
              </>
            )}

            {state === "submitting" && (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-moss-bright" />
                <div className="mt-4 text-[13px] text-bone/70">
                  Routing to a founder…
                </div>
              </div>
            )}

            {state === "countdown" && (
              <div className="py-8 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss-bright">
                  Routing live
                </div>
                <div className="mt-4 font-serif text-7xl tabular-nums text-bone">
                  {String(seconds).padStart(2, "0")}
                  <span className="text-3xl text-bone/40">s</span>
                </div>
                <div className="mt-3 text-[13px] text-bone/60">
                  We&rsquo;ll call <span className="text-bone">{phone}</span>{" "}
                  in under a minute.
                </div>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-moss-bright/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-bright" />
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-bone/40">
                    Centurions notified · {founderInitials()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-8 text-[12px] text-bone/40 hover:text-bone"
                >
                  Cancel
                </button>
              </div>
            )}

            {state === "delivered" && (
              <div className="py-10 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-moss-bright/15 text-moss-bright">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-serif text-2xl text-bone">
                  Hang tight — you&rsquo;re on the line.
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-bone/60">
                  A founder will call <span className="text-bone">{phone}</span>{" "}
                  any moment now. If you somehow miss us, we&rsquo;ll text and
                  try again in 4 minutes.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 rounded-full border border-bone/15 px-5 py-2 text-[12px] text-bone/70 hover:border-bone/40 hover:text-bone"
                >
                  Close
                </button>
              </div>
            )}

            {state === "error" && (
              <div className="py-10 text-center">
                <h3 className="font-serif text-xl text-bone">
                  Couldn&rsquo;t deliver the request.
                </h3>
                <p className="mt-2 text-[13px] text-bone/60">
                  Try again, or text us directly at (813) 442-0253.
                </p>
                <button
                  type="button"
                  onClick={() => setState("form")}
                  className="mt-5 rounded-full bg-moss-bright px-5 py-2 text-[12px] font-semibold text-obsidian"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
  required,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-md border border-bone/15 bg-bone/[0.03] px-3 py-2 text-[13px] text-bone placeholder:text-bone/30 focus:border-moss-bright/60 focus:outline-none focus:ring-1 focus:ring-moss-bright/40";
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/40">
        {label}
        {required && <span className="ml-1 text-moss-bright">*</span>}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type={type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cls}
        />
      )}
    </label>
  );
}

function founderInitials(): string {
  return "RG · JY";
}
