import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "GladiusTurf · Sign in",
  description: "Sign in to your GladiusTurf workspace.",
  robots: { index: false, follow: false },
};

// useSearchParams() in LoginForm makes this page a client-search-params
// reader; Next 15 requires a Suspense boundary so the static shell can
// pre-render and hydrate when the query string lands.
export const dynamic = "force-dynamic";

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
            Real customer? Email yourself a link. Demo? Use shared creds.
          </p>
        </div>

        <div className="g-card p-6 shadow-2xl">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
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

function LoginFormSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-12 rounded-md bg-g-surface" />
      <div className="h-10 rounded-md bg-g-accent-faint" />
    </div>
  );
}
