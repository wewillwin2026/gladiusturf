import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { verifyToken, BL_COOKIE_NAME } from "@/lib/bright-lights/auth";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function BrightLightsGatePage() {
  const jar = await cookies();
  const token = jar.get(BL_COOKIE_NAME)?.value;
  if (verifyToken(token)) {
    redirect("/demo/bright-lights-encina/dashboard");
  }

  return (
    <main className="bl-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="bl-card-elevated bl-fade-in flex w-full max-w-md flex-col items-center px-8 py-10"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center">
          <Image
            src="/bright-lights/logo.png"
            alt="Bright Lights Landscape Lighting"
            width={120}
            height={96}
            priority
          />
        </div>
        <p className="bl-eyebrow">Bright Lights · Command Center</p>
        <h1
          className="bl-serif mt-3 text-center text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Welcome, Felipe.
        </h1>
        <p
          className="mt-3 text-center text-[13px] leading-[1.55]"
          style={{ color: "var(--bl-text-muted)" }}
        >
          A preview of what your business looks like inside Gladius. Your real
          customers, your real fixture brands, your real numbers — pre-loaded for
          your call with Ricardo.
        </p>

        <div className="mt-8 w-full">
          <UnlockForm />
        </div>

        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          Powered by Gladius · Sarasota, FL
        </p>
      </div>
    </main>
  );
}
