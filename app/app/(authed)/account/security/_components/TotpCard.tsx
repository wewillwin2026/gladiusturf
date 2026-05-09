"use client";

import * as React from "react";
import QRCode from "qrcode";
import { ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import {
  confirmTotpEnrollmentAction,
  disableTotpAction,
  regenerateRecoveryCodesAction,
  startTotpEnrollmentAction,
} from "../actions";

type Stage =
  | { kind: "idle" }
  | { kind: "enrolling"; secret: string; otpauthUri: string; qrDataUrl: string }
  | { kind: "showing_codes"; codes: string[] };

export function TotpCard({
  enrolled,
  enrolledAt,
}: {
  enrolled: boolean;
  enrolledAt: string | null;
}) {
  const [stage, setStage] = React.useState<Stage>({ kind: "idle" });
  const [pending, startTransition] = React.useTransition();

  function startEnroll() {
    startTransition(async () => {
      const result = await startTotpEnrollmentAction();
      if (!("ok" in result)) {
        toast.error(`Couldn't start enrollment: ${result.error}`);
        return;
      }
      try {
        const qrDataUrl = await QRCode.toDataURL(result.otpauthUri, {
          margin: 1,
          width: 256,
        });
        setStage({
          kind: "enrolling",
          secret: result.secret,
          otpauthUri: result.otpauthUri,
          qrDataUrl,
        });
      } catch {
        toast.error("Couldn't render QR code");
      }
    });
  }

  if (stage.kind === "showing_codes") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-g-accent" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-g-accent">
            Two-factor enabled — save your recovery codes
          </span>
        </div>
        <p className="text-[12px] text-g-text-muted leading-relaxed">
          Save these somewhere safe (a password manager works). Each code can
          be used <strong>once</strong> if you lose your authenticator. We will
          NOT show them again.
        </p>
        <div className="rounded-md border border-g-border-subtle bg-g-surface-2 p-4">
          <ul className="grid grid-cols-2 gap-2 font-geist-mono text-[12px] text-g-text">
            {stage.codes.map((c) => (
              <li key={c} className="rounded bg-g-bg/60 px-2 py-1">
                {c}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setStage({ kind: "idle" })}
          className="self-start rounded-md border border-g-border-subtle px-3 py-1.5 text-[12px] text-g-text-muted hover:text-g-text"
        >
          I saved them — close
        </button>
      </div>
    );
  }

  if (stage.kind === "enrolling") {
    return (
      <form
        action={(fd) =>
          startTransition(async () => {
            fd.set("secret", stage.secret);
            const result = await confirmTotpEnrollmentAction(fd);
            if (!("ok" in result)) {
              if (result.error === "invalid_code") {
                toast.error("Code didn't match — try the next 30-sec code");
              } else {
                toast.error(`Couldn't enroll: ${result.error}`);
              }
              return;
            }
            toast.success("Two-factor enabled");
            setStage({ kind: "showing_codes", codes: result.recoveryCodes });
          })
        }
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-g-accent" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Enroll authenticator
          </span>
        </div>
        <p className="text-[12px] text-g-text-muted leading-relaxed">
          Open your authenticator app (Google Authenticator, 1Password, Authy)
          and scan this QR code. Then enter the 6-digit code it shows.
        </p>
        <div className="self-center rounded-md border border-g-border-subtle bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stage.qrDataUrl}
            alt="TOTP QR code"
            className="h-48 w-48"
          />
        </div>
        <details className="text-[11px] text-g-text-faint">
          <summary className="cursor-pointer hover:text-g-text-muted">
            Can&apos;t scan? Use the secret directly
          </summary>
          <code className="mt-1 block break-all rounded bg-g-surface-2 p-2 font-geist-mono text-[11px] text-g-text-muted">
            {stage.secret}
          </code>
        </details>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] text-g-text-muted">6-digit code</span>
          <input
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="123456"
            className="rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text focus:border-g-accent focus:outline-none"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-g-accent px-4 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Verifying…" : "Confirm and enable"}
          </button>
          <button
            type="button"
            onClick={() => setStage({ kind: "idle" })}
            className="rounded-md border border-g-border-subtle px-3 py-2 text-[12px] text-g-text-muted hover:text-g-text"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // idle — show "enroll" or "disable"
  if (!enrolled) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-g-accent" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Two-factor authentication
          </span>
        </div>
        <p className="text-[12px] text-g-text-muted leading-relaxed">
          Add a 6-digit code from an authenticator app to your sign-in. Strongly
          recommended.
        </p>
        <button
          type="button"
          onClick={startEnroll}
          disabled={pending}
          className="self-start rounded-md bg-g-accent px-4 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Loading…" : "Enable two-factor"}
        </button>
      </div>
    );
  }

  // enrolled — disable + regenerate codes
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-g-accent" />
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-accent">
          Two-factor enabled
          {enrolledAt && (
            <span className="ml-2 normal-case tracking-normal text-g-text-faint">
              · since {new Date(enrolledAt).toLocaleDateString()}
            </span>
          )}
        </span>
      </div>

      <form
        action={(fd) =>
          startTransition(async () => {
            const result = await regenerateRecoveryCodesAction(fd);
            if (!("ok" in result)) {
              toast.error(
                result.error === "password_wrong"
                  ? "Password didn't match"
                  : `Couldn't regenerate: ${result.error}`,
              );
              return;
            }
            toast.success("New recovery codes generated");
            setStage({ kind: "showing_codes", codes: result.recoveryCodes });
          })
        }
        className="flex flex-col gap-2 rounded-md border border-g-border-subtle p-3"
      >
        <span className="text-[12px] text-g-text-muted">
          Regenerate recovery codes (invalidates the old set):
        </span>
        <div className="flex gap-2">
          <input
            type="password"
            name="password"
            placeholder="Confirm with password"
            autoComplete="current-password"
            required
            className="flex-1 rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text focus:border-g-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-g-border-subtle px-3 py-2 text-[12px] text-g-text-muted hover:text-g-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Regenerate
          </button>
        </div>
      </form>

      <form
        action={(fd) =>
          startTransition(async () => {
            const result = await disableTotpAction(fd);
            if (!("ok" in result)) {
              toast.error(
                result.error === "password_wrong"
                  ? "Password didn't match"
                  : `Couldn't disable: ${result.error}`,
              );
              return;
            }
            toast.success("Two-factor disabled");
            setStage({ kind: "idle" });
          })
        }
        className="flex flex-col gap-2 rounded-md border border-g-danger/30 bg-g-danger/5 p-3"
      >
        <div className="flex items-center gap-2 text-[12px] text-g-danger">
          <ShieldX className="h-3.5 w-3.5" />
          <span>Disable two-factor (sign-in becomes password-only):</span>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            name="password"
            placeholder="Confirm with password"
            autoComplete="current-password"
            required
            className="flex-1 rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text focus:border-g-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-g-danger/30 px-3 py-2 text-[12px] text-g-danger hover:bg-g-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Disable
          </button>
        </div>
      </form>
    </div>
  );
}
