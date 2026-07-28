"use client";

import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchiveRightSidebar from "@/components/rightSideBar";
import { SidebarProvider } from "@/components/sidebarContext";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";

/**
 * Persistent chrome for authenticated app routes.
 * Keeping sidebars in the layout prevents remount/refetch on every navigation.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-[1600px] flex-row">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />
          {children}
          <div
            className="hidden shrink-0 xl:block xl:w-64 2xl:w-72"
            aria-hidden
          />
          <div className="hidden xl:block">
            <ArchiveRightSidebar />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
