// TODO: swap placeholder for real beta customer quote before launch.
export function QuoteBlock() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-content px-6 py-20 md:py-section">
        <blockquote className="max-w-4xl font-serif text-[24px] italic leading-[1.4] text-forest md:text-[28px]">
          &ldquo;We killed five subscriptions in our first 30 days on
          GladiusTurf and added $43K in upsell revenue we would have left on
          the table. It pays the crew before it pays itself.&rdquo;
        </blockquote>
        <p className="mt-8 text-sm text-stone">
          — PLACEHOLDER · Beta customer, 14-crew shop, North Carolina
          <span className="ml-2 text-stone/60">(swap with real quote pre-launch)</span>
        </p>
      </div>
    </section>
  );
}
