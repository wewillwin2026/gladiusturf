"use client";

/**
 * Tiny client component that triggers window.print(). Used on /pricing/cfo
 * so the rest of that page can stay a server component (and keep its
 * `metadata` export).
 */
export function PrintButton({
  className,
  children = "Print this page",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      className={
        className ??
        "cursor-pointer rounded-md border border-bone/20 px-3 py-1 hover:border-champagne-bright/60 hover:text-champagne-bright"
      }
    >
      {children}
    </button>
  );
}
