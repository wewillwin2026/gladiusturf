import { LogoMark } from "@/components/logo-mark";

// Placeholder homepage — sections being built top-down.
// Renders nav + hero shell so we can sign off on type/palette before filling the rest.
export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-forest">
      <header className="sticky top-0 z-40 border-b border-[rgba(15,61,46,0.12)] bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <LogoMark size={32} withWordmark />
          <nav className="hidden gap-8 text-sm text-stone md:flex">
            <a href="#engines" className="hover:text-forest">Engines</a>
            <a href="/pricing" className="hover:text-forest">Pricing</a>
            <a href="/compare" className="hover:text-forest">Compare</a>
            <a href="/surplus-yard" className="hover:text-forest">Surplus Yard</a>
          </nav>
          <a
            href="/demo"
            className="inline-flex items-center rounded-[8px] bg-moss px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-moss/90"
          >
            Try the live demo
          </a>
        </div>
      </header>

      <section className="border-b border-[rgba(15,61,46,0.12)]">
        <div className="mx-auto max-w-content px-6 py-20 md:py-[120px]">
          <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
            Landscaping Revenue Intelligence
          </p>
          <h1 className="font-serif text-display-md text-forest md:text-display-lg">
            The $180,000 your crew is leaving in the grass every year.
          </h1>
          <p className="mt-8 max-w-2xl text-[20px] leading-[1.55] text-stone">
            Voicemail inboxes. Dying estimates. Clients chasing you instead of
            paying you. Crews that can&apos;t find the gate code. The average
            landscaping shop leaks six figures a year to problems a better
            system would flag before the first mower starts.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="/demo"
              className="inline-flex items-center rounded-[8px] bg-forest px-6 py-3 text-sm font-medium text-bone transition-colors hover:bg-forest/90"
            >
              Try the live demo
            </a>
            <a
              href="#proof"
              className="text-sm font-medium text-forest underline underline-offset-4 hover:text-moss"
            >
              Show me the math →
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-obsidian text-bone">
        <div className="mx-auto max-w-content px-6 py-16">
          <LogoMark size={32} tone="moss" withWordmark />
          <p className="mt-6 text-xs text-stone">
            GladiusTurf · a Gladius Inc. product · built for landscape operators
          </p>
          <p className="mt-2 font-serif text-sm italic text-moss">Not a CRM</p>
        </div>
      </footer>
    </main>
  );
}
