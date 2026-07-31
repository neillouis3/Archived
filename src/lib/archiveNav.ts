export type ArchiveNavItem = {
  key: string;
  label: string;
  href?: string;
};

/** Primary Instagram-style nav (Create / Profile / More handled in the sidebar). */
export const archiveNavItems: readonly ArchiveNavItem[] = [
  { key: "home", label: "Home", href: "/home" },
  { key: "gallery", label: "Gallery", href: "/gallery" },
  { key: "search", label: "Search", href: "/explore" },
  { key: "notifications", label: "Notifications", href: "/notifications" },
] as const;

export function isNavActive(pathname: string, key: string): boolean {
  if (key === "home") return pathname === "/home" || pathname === "/";
  if (key === "gallery") {
    return pathname.startsWith("/gallery") || pathname.startsWith("/c/");
  }
  if (key === "search") return pathname.startsWith("/explore");
  if (key === "notifications") return pathname.startsWith("/notifications");
  if (key === "profile") {
    return (
      pathname.startsWith("/accounts/profile") || pathname.startsWith("/profile/")
    );
  }
  return false;
}
