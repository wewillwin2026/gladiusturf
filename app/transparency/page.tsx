import type { Metadata } from "next";
import Link from "next/link";
import { Hash, Lock, ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";

export const metadata: Metadata = {
  title: "Transparency — Cryptographic audit roots, recomputable by anyone.",
  description:
    "Every day we publish the SHA-256 Merkle root over the GladiusTurf audit chain — AI runs, tenant audit events, founder cross-tenant reads, consent records. If we mutated an old row, the date's root would no longer match.",
  alternates: { canonical: "/transparency" },
  robots: { index: true, follow: true },
};

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-28">
        <Eyebrow tone="champagne">Trust</Eyebrow>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-6xl">
          Cryptographic transparency.
        </h1>
        <div className="mt-6">
          <Pill tone="champagne">Recomputable by anyone</Pill>
        </div>

        <p className="mt-10 text-lg leading-relaxed text-bone/70 md:text-xl">
          Every day, we hash a deterministic Merkle root over the audit
          chain that mattered — every AI call, every tenant-side action,
          every founder cross-tenant read, every messaging-consent record.
          The root is a fingerprint of what existed in our system on that
          UTC day. If we silently mutated an old row, the root would no
          longer match — and any auditor who saved yesterday&apos;s value
          would notice.
        </p>

        <section className="mt-12 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-champagne-bright" />
            <span className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
              How to verify
            </span>
          </div>
          <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-bone/75 list-decimal list-inside">
            <li>
              Read the four audit tables for the UTC day you want to check:{" "}
              <code className="font-mono text-[12px] text-bone">ai_run</code>,{" "}
              <code className="font-mono text-[12px] text-bone">audit_log</code>,{" "}
              <code className="font-mono text-[12px] text-bone">
                cross_tenant_access_log
              </code>
              ,{" "}
              <code className="font-mono text-[12px] text-bone">
                customer_messaging_consent
              </code>
              .
            </li>
            <li>
              For each row, build a canonical pipe-joined string{" "}
              <code className="font-mono text-[12px] text-bone">
                key=&quot;value&quot;|key=&quot;value&quot;...
              </code>{" "}
              with keys sorted alphabetically. Prefix with the table name.
              SHA-256 → leaf.
            </li>
            <li>
              Sort the combined leaf array lexicographically. Build a
              standard binary Merkle tree (duplicate the last leaf on
              odd-count layers; concatenate left + right hex bytes for the
              parent hash). The root is the final 64-character hex string.
            </li>
            <li>
              Compare to ours. If you have a tenant session at GladiusTurf,
              GET{" "}
              <code className="font-mono text-[12px] text-bone">
                /api/transparency/root/YYYY-MM-DD
              </code>{" "}
              returns your tenant-scoped root.
            </li>
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-bone/50">
            The implementation lives at{" "}
            <code className="font-mono text-[11px] text-bone/70">
              lib/audit/merkle.ts
            </code>{" "}
            in our public source. Roughly 100 lines. No exotic crypto — a
            well-understood Merkle construction over a deterministic
            row-canonicalization scheme.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-moss/30 bg-moss/[0.05] p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-moss-bright" />
            <span className="text-xs font-semibold uppercase tracking-crest text-moss-bright">
              What this proves — and what it doesn&apos;t
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-bone/75">
            <strong className="text-bone">Proves:</strong> a row that
            existed on day X cannot be silently changed on day X+1 without
            invalidating that day&apos;s published root.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-bone/75">
            <strong className="text-bone">Does not prove:</strong> that we
            published the root truthfully (we could compute and post a
            wrong hash). Daily public-notary timestamping ships next so the
            chain of roots itself is verifiable independently of us. v2.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-champagne/30 bg-champagne/[0.05] p-6">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-champagne-bright" />
            <span className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
              Tenant access
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-bone/75">
            Tenants can see their own daily roots inside the workspace at
            the Trust Console (Pulse → Trust Console). Each AI call
            additionally generates a public per-call receipt at{" "}
            <code className="font-mono text-[12px] text-bone">
              /receipt/[id]
            </code>
            . Drop a receipt URL into any AI-drafted message you send —
            recipients can verify what the AI was given.
          </p>
        </section>

        <p className="mt-12 text-sm text-bone/50">
          Questions: email{" "}
          <a
            href="mailto:legal@gladiusturf.com"
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            legal@gladiusturf.com
          </a>
          . Read the{" "}
          <Link
            href="/legal/dpa"
            prefetch
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            DPA
          </Link>{" "}
          for the full sub-processor list and{" "}
          <Link
            href="/legal/privacy"
            prefetch
            className="text-champagne-bright underline-offset-4 hover:underline"
          >
            privacy policy
          </Link>{" "}
          for retention.
        </p>
      </main>
      <Footer />
    </div>
  );
}
