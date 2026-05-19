"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input } from "@/components/app/ui/Input";
import { ROLE_PRESETS } from "@/lib/app/access";
import type { TenantRole } from "@/lib/app/tenant-auth";
import { addTeamMember } from "../actions";

const MIN_PW = 12;

function generateStrongPassword(): string {
  // 18 chars from a friendly set (no delimiter-conflicting characters,
  // no lookalike 0/O/l/1). Matches the founders portal style.
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint8Array(18);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i += 1) arr[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < arr.length; i += 1) out += alphabet[arr[i] % alphabet.length];
  return out;
}

export function AddUserForm() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [role, setRole] = React.useState<TenantRole>("operator");

  const selectedPreset = ROLE_PRESETS.find((p) => p.role === role);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (password.length < MIN_PW) {
      toast.error(`Password must be at least ${MIN_PW} characters.`);
      return;
    }
    setBusy(true);
    try {
      const res = await addTeamMember({
        email: email.trim().toLowerCase(),
        password,
        title: title.trim() || null,
        role,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`Added ${res.email}. Share the password with them directly.`);
      router.push("/app/settings");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      {/* 1. Email */}
      <div className="g-card p-5 flex flex-col gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            1 · Email *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@brightlightslandscape.com"
            autoComplete="off"
            autoFocus
            required
            className="mt-1.5"
          />
          <p className="mt-1 text-[11px] text-g-text-faint">
            They sign in at gladiusturf.com/app/login with this email.
          </p>
        </div>

        {/* 2. Password */}
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            2 · Password *
          </label>
          <div className="mt-1.5 flex items-stretch gap-2">
            <div className="relative flex-1">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`At least ${MIN_PW} characters`}
                autoComplete="new-password"
                required
                minLength={MIN_PW}
                className="pr-10 font-geist-mono"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-g-text-faint hover:text-g-text"
              >
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setPassword(generateStrongPassword());
                setShowPw(true);
              }}
              disabled={busy}
            >
              Generate
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-g-text-faint">
            Share the password with them directly (text/call) — we never email
            it. They can change it from Account → Security after signing in.
          </p>
        </div>
      </div>

      {/* 3. Title */}
      <div className="g-card p-5">
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          3 · Title (optional)
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Office Manager, Lead Installer, South Team Lead"
          className="mt-1.5"
        />
        <p className="mt-1 text-[11px] text-g-text-faint">
          Shows next to their name in the roster. Purely descriptive.
        </p>
      </div>

      {/* 4. User access */}
      <div className="g-card p-5">
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          4 · User access *
        </label>
        <div className="mt-2 grid gap-2">
          {ROLE_PRESETS.map((p) => {
            const active = p.role === role;
            return (
              <button
                key={p.role}
                type="button"
                onClick={() => setRole(p.role)}
                className={
                  "text-left rounded-md border p-3 transition-colors " +
                  (active
                    ? "border-g-accent bg-g-accent-faint/30"
                    : "border-g-border bg-g-surface hover:bg-g-surface-2")
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-g-text">
                    {p.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-g-text-faint">
                    {p.persona}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-g-text-muted">{p.blurb}</p>
              </button>
            );
          })}
        </div>
        {selectedPreset && (
          <p className="mt-3 text-[11px] text-g-text-faint">
            You can change their role later from the team roster.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app/settings")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={busy || !email.trim() || password.length < MIN_PW}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Add user
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
