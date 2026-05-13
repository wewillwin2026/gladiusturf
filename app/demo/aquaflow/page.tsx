import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Droplets } from "lucide-react";
import { verifyToken, AF_COOKIE_NAME } from "@/lib/aquaflow/auth";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function AquaflowGatePage() {
  const jar = await cookies();
  const token = jar.get(AF_COOKIE_NAME)?.value;
  if (verifyToken(token)) {
    redirect("/demo/aquaflow/dashboard");
  }
  return (
    <main className="af-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="af-card-elevated af-fade-in flex w-full max-w-md flex-col items-center px-8 py-10"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(77,196,178,0.14)",
            border: "1px solid rgba(77,196,178,0.45)",
          }}
        >
          <Droplets
            className="h-7 w-7"
            style={{ color: "var(--af-accent)" }}
            aria-hidden
          />
        </div>
        <p className="af-eyebrow">Aquaflow · Command</p>
        <h1
          className="af-serif mt-3 text-center text-[28px] leading-[1.1]"
          style={{ color: "var(--af-text)" }}
        >
          See it on irrigation data.
        </h1>
        <p
          className="mt-3 text-center text-[13px] leading-[1.55]"
          style={{ color: "var(--af-text-muted)" }}
        >
          89 properties, 4 weekly routes, annual backflow filings tracked
          per utility portal — pre-loaded and ready to click.
        </p>
        <div className="mt-8 w-full">
          <UnlockForm />
        </div>
        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--af-text-faint)" }}
        >
          Powered by Gladius · Sales demo
        </p>
      </div>
    </main>
  );
}
