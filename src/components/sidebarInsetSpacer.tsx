"use client";

import { SIDEBAR_COLLAPSED_W } from "@/lib/sidebarWidths";

/**
 * Reserves space for chrome.
 * - Mobile: header height
 * - lg+: collapsed left rail only (hover expand overlays)
 *
 * Do NOT match the right sidebar width here — the rails are different widths.
 * Equal gaps come from centering page content in the flex-1 middle between
 * the left spacer (72) and the right spacer (right rail width).
 */
export function SidebarInsetSpacer() {
  return (
    <>
      <div
        className="shrink-0 lg:hidden min-h-[calc(3.5rem+env(safe-area-inset-top,0px))]"
        aria-hidden
      />
      <div
        aria-hidden
        className="hidden shrink-0 lg:block"
        style={{ width: SIDEBAR_COLLAPSED_W }}
      />
    </>
  );
}
