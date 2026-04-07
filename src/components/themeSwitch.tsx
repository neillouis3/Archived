"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeSwitcher({ menuRow }: { menuRow?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? SunIcon : MoonIcon;
  const label = isDark ? "Light mode" : "Dark mode";

  const rowClass =
    "w-full justify-start text-stone-600 text-xs font-normal h-8 px-2.5 rounded-lg hover:bg-stone-100/90 gap-2.5";

  if (!mounted) {
    return menuRow ? (
      <div className={`${rowClass} flex items-center opacity-0 pointer-events-none`} aria-hidden />
    ) : (
      <Button isIconOnly variant="ghost" size="sm" className="opacity-0 pointer-events-none" aria-hidden />
    );
  }

  if (menuRow) {
    return (
      <Button variant="ghost" size="sm" onPress={toggle} className={rowClass}>
        <Icon className="w-[17px] h-[17px] text-stone-400 flex-shrink-0" />
        {label}
      </Button>
    );
  }

  return (
    <Button isIconOnly variant="ghost" size="sm" onPress={toggle} aria-label={label}>
      <Icon className="w-5 h-5 text-stone-500" />
    </Button>
  );
}
