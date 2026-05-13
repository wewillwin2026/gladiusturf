import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TreePine } from "lucide-react";
import { verifyToken, TC_COOKIE_NAME } from "@/lib/timbercare/auth";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function TimbercareGatePage() {
  const jar = await cookies();
  const token = jar.get(TC_COOKIE_NAME)?.value;
  if (verifyToken(token)) {
    redirect("/demo/timbercare/dashboard");
  }
  return (
    <main className="tc-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="tc-card-elevated tc-fade-in flex w-full max-w-md flex-col items-center px-8 py-10"
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(180,138,75,0.14)",
            border: "1px solid rgba(180,138,75,0.45)",
          }}
        >
          <TreePine className="h-7 w-7" style={{ color: "var(--tc-accent)" }} />
        </div>
        <p className="tc-eyebrow">TimberCare · Command</p>
        <h1
          className="tc-serif mt-3 text-center text-[28px] leading-[1.1]"
          style={{ color: "var(--tc-text)" }}
        >
          See it on tree-care data.
        </h1>
        <p
          className="mt-3 text-center text-[13px] leading-[1.55]"
          style={{ color: "var(--tc-text-muted)" }}
        >
          DBH-priced jobs, ANSI A300 standards, ISA-certified arborist
          documentation, COI tracking per commercial property.
        </p>
        <div className="mt-8 w-full">
          <UnlockForm />
        </div>
        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--tc-text-faint)" }}
        >
          Powered by Gladius · Sales demo
        </p>
      </div>
    </main>
  );
}
