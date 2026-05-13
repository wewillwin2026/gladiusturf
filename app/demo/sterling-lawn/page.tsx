import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";
import { verifyToken, SL_COOKIE_NAME } from "@/lib/sterling-lawn/auth";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function SterlingLawnGatePage() {
  const jar = await cookies();
  const token = jar.get(SL_COOKIE_NAME)?.value;
  if (verifyToken(token)) {
    redirect("/demo/sterling-lawn/dashboard");
  }

  return (
    <main className="sl-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="sl-card-elevated sl-fade-in flex w-full max-w-md flex-col items-center px-8 py-10"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(127, 226, 122, 0.14)",
            border: "1px solid rgba(127, 226, 122, 0.45)",
          }}
        >
          <Leaf
            className="h-7 w-7"
            style={{ color: "var(--sl-accent)" }}
            aria-hidden
          />
        </div>
        <p className="sl-eyebrow">Sterling Lawn · Command Center</p>
        <h1
          className="sl-serif mt-3 text-center text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          See it on lawn-care data.
        </h1>
        <p
          className="mt-3 text-center text-[13px] leading-[1.55]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          A preview of what your shop looks like inside Gladius. 87 customers,
          4 weekly routes, recurring fert plans, EPA chemical log — pre-loaded
          and ready to click.
        </p>

        <div className="mt-8 w-full">
          <UnlockForm />
        </div>

        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--sl-text-faint)" }}
        >
          Powered by Gladius · Sales demo
        </p>
      </div>
    </main>
  );
}
