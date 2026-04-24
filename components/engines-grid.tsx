import { EngineCard } from "@/components/engine-card";
import { ENGINES } from "@/content/engines";

export function EnginesGrid() {
  return (
    <section id="engines" className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
      <div className="mx-auto max-w-content px-6 py-20 md:py-section">
        <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
          Seven engines · One platform
        </p>
        <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
          Every engine is a specific number going into your bank account.
        </h2>
        <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-stone">
          We don&apos;t ship features. We ship engines. Each one replaces a
          tool you&apos;re already paying for and pays for itself inside the
          first month. If an engine isn&apos;t moving a dollar, we don&apos;t
          ship it.
        </p>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {ENGINES.map((e, i) => (
            <div
              key={e.slug}
              className={i % 2 === 1 ? "md:translate-y-10" : ""}
            >
              <EngineCard engine={e} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
