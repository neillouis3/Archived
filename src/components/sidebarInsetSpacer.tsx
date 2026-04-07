"use client";

import { motion } from "framer-motion";
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
      <motion.div
        aria-hidden
        initial={false}
        animate={{ width: collapsed ? "4.5rem" : "17rem" }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="hidden shrink-0 lg:block"
        style={{ willChange: "width" }}
      />
    </>
  );
}
