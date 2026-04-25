import { FlaskConical } from "lucide-react";

export function SandboxBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-champagne/30 bg-champagne/[0.06] px-4 py-3 text-[13px] text-bone/85">
      <FlaskConical className="mt-0.5 h-4 w-4 flex-none text-champagne-bright" />
      <p>
        <span className="font-semibold text-bone">Sandbox preview.</span> No
        data is saved · direct deposit is mocked. Click around — none of these
        actions hit a real database.
      </p>
    </div>
  );
}
