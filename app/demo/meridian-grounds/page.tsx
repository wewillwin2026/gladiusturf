import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { verifyToken, MG_COOKIE_NAME } from "@/lib/meridian-grounds/auth";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function MeridianGatePage() {
  const jar = await cookies();
  const token = jar.get(MG_COOKIE_NAME)?.value;
  if (verifyToken(token)) {
    redirect("/demo/meridian-grounds/dashboard");
  }
  return (
    <main className="mg-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="mg-card-elevated mg-fade-in flex w-full max-w-md flex-col items-center px-8 py-10"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(107,148,214,0.14)",
            border: "1px solid rgba(107,148,214,0.45)",
          }}
        >
          <Building2 className="h-7 w-7" style={{ color: "var(--mg-accent)" }} />
        </div>
        <p className="mg-eyebrow">Meridian · Command</p>
        <h1
          className="mg-serif mt-3 text-center text-[28px] leading-[1.1]"
          style={{ color: "var(--mg-text)" }}
        >
          See it on commercial data.
        </h1>
        <p
          className="mt-3 text-center text-[13px] leading-[1.55]"
          style={{ color: "var(--mg-text-muted)" }}
        >
          18 commercial properties under contract. NTE work-order routing,
          COI auto-tracking, monthly recurring contracts.
        </p>
        <div className="mt-8 w-full">
          <UnlockForm />
        </div>
        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--mg-text-faint)" }}
        >
          Powered by Gladius · Sales demo
        </p>
      </div>
    </main>
  );
}
