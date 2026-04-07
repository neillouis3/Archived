"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

type Props = {
  className?: string;
  /** Full-width row matching the left sidebar account menu */
  menuRow?: boolean;
};

export function ThemeSwitcher({ className = "", menuRow }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (!mounted) {
    if (menuRow) {
      return (
        <div
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-stone-400"
          aria-hidden
        >
          <span className="h-[17px] w-[17px] rounded bg-stone-200/60" />
          Appearance
        </div>
      );
    }
    return (
      <div
        className={`h-8 w-8 rounded-lg bg-stone-200/50 animate-pulse ${className}`}
        aria-hidden
      />
    );
  }

  if (menuRow) {
    return (
      <button
        type="button"
        role="menuitem"
        onClick={toggle}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs
                   text-stone-600 hover:bg-stone-100/90 transition-colors"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <SunIcon className="h-[17px] w-[17px] shrink-0 text-stone-400" />
        ) : (
          <MoonIcon className="h-[17px] w-[17px] shrink-0 text-stone-400" />
        )}
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex items-center justify-center rounded-lg border border-stone-200/80
                  bg-stone-100/80 p-2 text-stone-600 transition-colors hover:bg-stone-200/60 ${className}`}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </button>
  );
}
