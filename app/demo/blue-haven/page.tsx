import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Waves } from "lucide-react";
import { verifyToken, BH_COOKIE_NAME } from "@/lib/blue-haven/auth";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function BlueHavenGatePage() {
  const jar = await cookies();
  const token = jar.get(BH_COOKIE_NAME)?.value;
  if (verifyToken(token)) {
    redirect("/demo/blue-haven/dashboard");
  }
  return (
    <main className="bh-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="bh-card-elevated bh-fade-in flex w-full max-w-md flex-col items-center px-8 py-10"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(124,200,232,0.14)",
            border: "1px solid rgba(124,200,232,0.45)",
          }}
        >
          <Waves
            className="h-7 w-7"
            style={{ color: "var(--bh-accent)" }}
            aria-hidden
          />
        </div>
        <p className="bh-eyebrow">Blue Haven · Command</p>
        <h1
          className="bh-serif mt-3 text-center text-[28px] leading-[1.1]"
          style={{ color: "var(--bh-text)" }}
        >
          See it on pool-service data.
        </h1>
        <p
          className="mt-3 text-center text-[13px] leading-[1.55]"
          style={{ color: "var(--bh-text-muted)" }}
        >
          162 pools, 5 weekly routes, EPA-style chemistry log — pre-loaded
          and ready to click.
        </p>
        <div className="mt-8 w-full">
          <UnlockForm />
        </div>
        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--bh-text-faint)" }}
        >
          Powered by Gladius · Sales demo
        </p>
      </div>
    </main>
  );
}
