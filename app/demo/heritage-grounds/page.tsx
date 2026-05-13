import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Flower2 } from "lucide-react";
import { verifyToken, HG_COOKIE_NAME } from "@/lib/heritage-grounds/auth";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function HeritageGroundsGatePage() {
  const jar = await cookies();
  const token = jar.get(HG_COOKIE_NAME)?.value;
  if (verifyToken(token)) {
    redirect("/demo/heritage-grounds/dashboard");
  }
  return (
    <main className="hg-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="hg-card-elevated hg-fade-in flex w-full max-w-md flex-col items-center px-8 py-10"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(217,131,106,0.14)",
            border: "1px solid rgba(217,131,106,0.45)",
          }}
        >
          <Flower2
            className="h-7 w-7"
            style={{ color: "var(--hg-accent)" }}
            aria-hidden
          />
        </div>
        <p className="hg-eyebrow">Heritage Grounds · Studio</p>
        <h1
          className="hg-serif mt-3 text-center text-[28px] leading-[1.1]"
          style={{ color: "var(--hg-text)" }}
        >
          See it on landscape data.
        </h1>
        <p
          className="mt-3 text-center text-[13px] leading-[1.55]"
          style={{ color: "var(--hg-text-muted)" }}
        >
          A preview of what your design-build studio looks like inside Gladius.
          9 active projects, project-stage board, contracted-vs-budget P&amp;L.
        </p>
        <div className="mt-8 w-full">
          <UnlockForm />
        </div>
        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--hg-text-faint)" }}
        >
          Powered by Gladius · Sales demo
        </p>
      </div>
    </main>
  );
}
