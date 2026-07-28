"use client";

import { useSidebar } from "./sidebarContext";

/** Below `lg`: reserves height for the fixed mobile header. At `lg+`: reserves width for the left rail. */
export function SidebarInsetSpacer() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <>
      <div
        className="shrink-0 lg:hidden min-h-[calc(3.5rem+env(safe-area-inset-top,0px))]"
        aria-hidden
      />
      <div
        aria-hidden
        className={`hidden shrink-0 lg:block transition-[width] duration-200 ease-out ${
          collapsed ? "w-[4.5rem]" : "w-[17rem]"
        }`}
      />
    </>
  );
}
