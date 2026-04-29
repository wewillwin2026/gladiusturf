import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "GladiusTurf · Sign in",
  description: "Sign in to your GladiusTurf workspace.",
  robots: { index: false, follow: false },
};

export default function PreviewLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pitch px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-bright">
            GladiusTurf
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone">
            Sign in to your workspace
          </h1>
          <p className="mt-3 text-[15px] leading-[1.5] text-bone/60">
            Welcome back. Pick up where your crew left off.
          </p>
        </div>

        <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 shadow-pop-champagne">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-bone/40">
          Trouble signing in? Email{" "}
          <a
            href="mailto:founders@gladiusturf.com"
            className="text-champagne-bright underline-offset-2 hover:underline"
          >
            founders@gladiusturf.com
          </a>
        </p>
      </div>
    </main>
  );
}
