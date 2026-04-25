import { FlaskConical } from "lucide-react";

export function SandboxBanner() {
  return (
    <div className="border-b border-champagne/30 bg-champagne/[0.06]">
      <div className="mx-auto flex w-full max-w-content items-center gap-2.5 px-4 py-2 md:px-6">
        <FlaskConical
          className="h-3.5 w-3.5 flex-none text-champagne-bright"
          aria-hidden
        />
        <p className="text-[12px] leading-tight text-bone/70">
          <span className="font-semibold text-champagne-bright">
            Sandbox preview
          </span>
          <span className="mx-2 text-bone/30">·</span>
          No data is saved
          <span className="mx-2 text-bone/30">·</span>
          Some interactions are mocked
        </p>
      </div>
    </div>
  );
}
