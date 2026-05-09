import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Plan · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Renders the most recent gym-block plan doc inline so founders can read
 * it inside the war-room without leaving for GitHub or a local editor.
 *
 * Source: `docs/PLAN_2026_05_09_GYM_BLOCK.md`. When the user wants a new
 * plan, drop it at `docs/PLAN_<date>.md` and update the constant below —
 * or generalize this page to surface a list.
 */

const DOC_REL_PATH = "docs/PLAN_2026_05_09_GYM_BLOCK.md";

async function loadPlanHtml(): Promise<{ html: string; mtimeIso: string } | null> {
  try {
    const abs = path.join(process.cwd(), DOC_REL_PATH);
    const [raw, stat] = await Promise.all([
      fs.readFile(abs, "utf8"),
      fs.stat(abs),
    ]);
    // Marked is sync by default. The doc is our own repo content (trusted),
    // so we render via dangerouslySetInnerHTML without sanitization.
    const html = await marked.parse(raw, {
      gfm: true,
      breaks: false,
    });
    return { html, mtimeIso: stat.mtime.toISOString() };
  } catch {
    return null;
  }
}

export default async function PlanPage() {
  const result = await loadPlanHtml();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Plan"
        title="Latest plan"
        subtitle={
          result
            ? `Last edited ${new Date(result.mtimeIso).toLocaleString()} · source: ${DOC_REL_PATH}`
            : `Couldn't load ${DOC_REL_PATH}`
        }
      />

      {!result ? (
        <section className="g-card flex items-start gap-3 p-6">
          <FileText className="h-5 w-5 shrink-0 text-g-text-faint" />
          <p className="text-[13px] text-g-text-muted">
            The plan doc was not readable on the deployed filesystem. This
            is expected on Vercel if the file isn&apos;t in the deploy
            output. Redeploy after the doc is committed; meanwhile read it
            on GitHub at{" "}
            <a
              href="https://github.com/wewillwin2026/gladiusturf/blob/main/docs/PLAN_2026_05_09_GYM_BLOCK.md"
              target="_blank"
              rel="noopener"
              className="text-g-accent hover:underline"
            >
              the canonical URL
            </a>
            .
          </p>
        </section>
      ) : (
        <article className="g-card p-6 md:p-10">
          <div
            className="plan-prose"
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        </article>
      )}

      {/* Inline styles for the rendered markdown — no Tailwind typography
          plugin required. Scoped to .plan-prose so we don't leak. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .plan-prose { color: var(--g-text); font-size: 14px; line-height: 1.65; }
            .plan-prose h1 { font-size: 28px; font-weight: 600; margin: 0 0 24px; letter-spacing: -0.01em; color: var(--g-text); }
            .plan-prose h2 { font-size: 20px; font-weight: 600; margin: 32px 0 16px; padding-top: 24px; border-top: 1px solid var(--g-border-subtle); letter-spacing: -0.01em; color: var(--g-text); }
            .plan-prose h2:first-of-type { border-top: 0; padding-top: 0; }
            .plan-prose h3 { font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: var(--g-text); }
            .plan-prose h4 { font-size: 14px; font-weight: 600; margin: 20px 0 8px; color: var(--g-text); text-transform: uppercase; letter-spacing: 0.08em; }
            .plan-prose p { margin: 0 0 14px; color: var(--g-text-muted); }
            .plan-prose strong { color: var(--g-text); font-weight: 600; }
            .plan-prose em { font-style: italic; color: var(--g-text); }
            .plan-prose a { color: var(--g-accent); text-decoration: underline; text-underline-offset: 2px; }
            .plan-prose a:hover { color: var(--g-accent-hover); }
            .plan-prose ul, .plan-prose ol { padding-left: 22px; margin: 0 0 14px; color: var(--g-text-muted); }
            .plan-prose li { margin: 4px 0; }
            .plan-prose ul li::marker { color: var(--g-accent); }
            .plan-prose code { font-family: ui-monospace, "Geist Mono", monospace; font-size: 12px; padding: 2px 6px; background: var(--g-surface-2); border-radius: 4px; color: var(--g-text); }
            .plan-prose pre { background: var(--g-surface-2); padding: 14px 16px; border-radius: 8px; overflow-x: auto; margin: 0 0 14px; font-size: 12px; line-height: 1.6; }
            .plan-prose pre code { background: transparent; padding: 0; font-size: 12px; }
            .plan-prose blockquote { margin: 14px 0; padding: 8px 14px; border-left: 3px solid var(--g-accent); color: var(--g-text-muted); }
            .plan-prose hr { border: 0; border-top: 1px solid var(--g-border-subtle); margin: 32px 0; }
            .plan-prose table { width: 100%; border-collapse: collapse; margin: 0 0 18px; font-size: 13px; }
            .plan-prose th { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--g-border-subtle); color: var(--g-text-faint); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
            .plan-prose td { padding: 8px 10px; border-bottom: 1px solid var(--g-border-subtle); color: var(--g-text-muted); vertical-align: top; }
            .plan-prose td:first-child, .plan-prose th:first-child { padding-left: 0; }
            .plan-prose td:last-child, .plan-prose th:last-child { padding-right: 0; }
          `,
        }}
      />
    </div>
  );
}
