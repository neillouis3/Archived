"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { getClerkAuthAppearance } from "@/lib/clerkAuthAppearance";

export function useClerkAuthAppearance() {
  const { resolvedTheme } = useTheme();
  return useMemo(() => getClerkAuthAppearance(resolvedTheme), [resolvedTheme]);
}
