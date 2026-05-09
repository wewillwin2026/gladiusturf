"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * URL-driven search input for the vertical_leads table. Updates `?q=` in
 * the address bar with a 250ms debounce so each keystroke doesn't trigger
 * a server-component re-render. Preserves any other query params (vertical,
 * status filter pills, etc.).
 */
export function SearchBar({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = React.useState(params.get("q") ?? "");

  React.useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      const trimmed = value.trim();
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      const qs = next.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-g-text-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Search email, company, name…"}
        className="h-9 w-full rounded-md border border-g-border-subtle bg-g-surface pl-9 pr-9 text-[13px] text-g-text placeholder:text-g-text-faint focus:border-g-accent focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-g-text-faint hover:bg-g-surface-2 hover:text-g-text"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
