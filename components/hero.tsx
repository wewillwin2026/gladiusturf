import { TopographicBg } from "@/components/topographic-bg";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[rgba(15,61,46,0.12)] bg-paper">
      <TopographicBg />
      <div className="relative mx-auto max-w-content px-6 py-20 md:py-section">
        <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
          Landscaping Revenue Intelligence
        </p>
        <h1 className="max-w-5xl font-serif text-display-md text-forest md:text-display-lg">
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
  );
}
