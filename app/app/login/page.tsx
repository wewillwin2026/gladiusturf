import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "GladiusTurf · Sign in",
  description: "Sign in to your GladiusTurf workspace.",
  robots: { index: false, follow: false },
};

export default function AppLoginPage() {
  return (
    <main className="gladius-app min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-g-accent">
            GladiusTurf
          </p>
          <h1 className="mt-3 text-[28px] font-medium tracking-[-0.02em] text-g-text">
            Sign in to your workspace
          </h1>
          <p className="mt-3 text-[14px] leading-[1.5] text-g-text-muted">
            Demo environment · Cypress Lawn &amp; Landscape, Tampa FL
          </p>
        </div>

        <div className="g-card p-6 shadow-2xl">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[11px] text-g-text-faint">
          Trouble signing in? Email{" "}
          <a
            href="mailto:founders@gladiusturf.com"
            className="text-g-accent hover:underline"
          >
            founders@gladiusturf.com
          </a>
        </p>
      </div>
    </main>
  );
}
