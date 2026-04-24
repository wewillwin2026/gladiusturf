import type { Engine } from "@/content/engines";

export function EngineCard({ engine }: { engine: Engine }) {
  return (
    <a
      href={`/product#${engine.slug}`}
      className="group flex flex-col rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-bone p-8 shadow-card transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-[rgba(15,61,46,0.32)]"
    >
      <span className="font-serif text-[32px] leading-none text-forest">
        {engine.number}
      </span>
      <h3 className="mt-6 text-[24px] font-medium leading-[1.2] tracking-[-0.01em] text-forest">
        {engine.name}
      </h3>
      <span className="mt-3 font-mono text-[20px] text-moss">
        {engine.outcome}
      </span>
      <p className="mt-6 text-[15px] leading-[1.65] text-stone">
        {engine.description}
      </p>
      <span className="mt-8 text-sm font-medium text-forest underline underline-offset-4 group-hover:text-moss">
        Read more →
      </span>
    </a>
  );
}
