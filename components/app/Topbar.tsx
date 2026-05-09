"use client";

import * as React from "react";
import { Bell, Command, LogOut, Moon, Search, Sun } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { IconButton } from "./ui/IconButton";
import { useTheme } from "./ThemeProvider";
import { type ProductKind } from "./engines";
import { useCmdK } from "./CommandPaletteContext";
import { MobileNavTrigger } from "./MobileNavTrigger";

export function Topbar({
  product,
  user,
  logoutHref,
  vertical = null,
}: {
  product: ProductKind;
  user: { name: string; subtitle: string };
  logoutHref: string;
  vertical?: string | null;
}) {
  const { theme, toggle } = useTheme();
  const { open } = useCmdK();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 sm:gap-4 h-12 px-3 sm:px-4 border-b border-g-border bg-g-bg/95 backdrop-blur supports-[backdrop-filter]:bg-g-bg/80">
      <MobileNavTrigger product={product} vertical={vertical} />
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-g-border bg-g-surface text-g-text-muted text-[12px] hover:bg-g-surface-2 transition-colors min-w-0 flex-1 md:flex-none md:min-w-[260px]"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Search jobs, customers, properties…</span>
        <span className="ml-auto hidden md:inline-flex items-center gap-0.5 font-geist-mono text-[10px] text-g-text-faint">
          <Command className="h-3 w-3" />K
        </span>
      </button>

      <div className="flex items-center gap-1 ml-auto">
        <IconButton aria-label="Toggle theme" onClick={toggle} size="sm">
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </IconButton>
        <IconButton aria-label="Notifications" size="sm" className="relative">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-g-accent" />
        </IconButton>

        <div className="ml-2 flex items-center gap-2 px-2 py-1 rounded-md border border-g-border-subtle">
          <Avatar
            name={user.name}
            size="sm"
            tone={product === "demo" ? "muted" : "accent"}
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[12px] text-g-text">{user.name}</span>
            <span className="text-[10px] text-g-text-faint">{user.subtitle}</span>
          </div>
        </div>

        <form action={logoutHref} method="POST">
          <button
            type="submit"
            className="ml-1 inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-g-text-muted hover:text-g-text hover:bg-g-surface-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
