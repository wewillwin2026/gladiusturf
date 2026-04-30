import { PageHeader } from "@/components/app/PageHeader";

export default function AppHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Foundation shipped"
        title="Today"
        subtitle="Phase 2 lands the populated Today dashboard. The shell, design system, sidebar, and Cmd-K are wired."
      />
      <div className="g-card p-10 text-center text-[13px] text-g-text-muted">
        Press{" "}
        <span className="font-geist-mono px-1 py-0.5 rounded bg-g-surface-2 text-g-text">
          ⌘K
        </span>{" "}
        to navigate the 33 engines. Real data populates next.
      </div>
    </div>
  );
}
