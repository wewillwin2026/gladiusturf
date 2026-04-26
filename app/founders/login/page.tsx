import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Founders · Log in",
  robots: { index: false, follow: false },
};

export default function FoundersLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pitch px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne-bright">
            GladiusTurf · Founders
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone">
            War Room
          </h1>
          <p className="mt-2 text-sm text-bone/60">
            Two founders. One shared key.
          </p>
        </div>
        <div className="rounded-2xl border border-champagne/30 bg-bone/[0.02] p-7 shadow-pop-champagne">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-bone/40">
          Restricted area. Activity is logged.
        </p>
      </div>
    </main>
  );
}
