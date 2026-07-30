"use client";

import { usePathname } from "next/navigation";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchiveRightSidebar from "@/components/rightSideBar";
import { PostViewerProvider } from "@/components/postViewerContext";
import { SidebarProvider } from "@/components/sidebarContext";

/**
 * Persistent chrome for authenticated app routes.
 * Main column is 50vw, centered on the viewport (not in the gap between unequal rails).
 * `modal` is unused legacy parallel slot (kept so the @modal folder still builds).
 */
export default function AppLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const pathname = usePathname() || "";
  const hideRightSidebar =
    pathname === "/accounts/profile" ||
    pathname.startsWith("/accounts/profile/") ||
    pathname.startsWith("/profile/") ||
    pathname === "/gallery" ||
    pathname.startsWith("/gallery/") ||
    pathname === "/accounts/settings" ||
    pathname.startsWith("/accounts/settings/") ||
    pathname === "/explore" ||
    pathname.startsWith("/explore/");

  return (
    <SidebarProvider>
      <PostViewerProvider>
        <div className="relative min-h-screen w-full bg-background text-foreground">
          <ArchiveLeftSidebar />

          {/* Mobile top header clearance */}
          <div
            className="lg:hidden min-h-[calc(3.5rem+env(safe-area-inset-top,0px))]"
            aria-hidden
          />

          <main
            className={`mx-auto min-h-screen w-full min-w-0 lg:w-[min(50vw,calc(100vw-4.5rem))] ${
              hideRightSidebar
                ? ""
                : "xl:w-[min(50vw,calc(100vw-4.5rem-300px))]"
            }`}
          >
            {children}
          </main>

          {!hideRightSidebar ? (
            <div className="hidden xl:block">
              <ArchiveRightSidebar />
            </div>
          ) : null}

          {/* Legacy parallel slot — always null via @modal/default */}
          {modal}
        </div>
      </PostViewerProvider>
    </SidebarProvider>
  );
}
