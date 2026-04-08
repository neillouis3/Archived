"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function ThemeSwitcher({ menuRow }: { menuRow?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isDark = resolvedTheme === "dark";
  const icon = isDark ? Sun02Icon : Moon02Icon;
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
        <HugeiconsIcon icon={icon} size={17} className="text-stone-400 flex-shrink-0" />
        {label}
      </Button>
    );
  }

  return (
    <Button isIconOnly variant="ghost" size="sm" onPress={toggle} aria-label={label}>
      <HugeiconsIcon icon={icon} size={20} className="text-stone-500" />
    </Button>
  );
}
