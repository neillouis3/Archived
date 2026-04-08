import {
  Home01Icon,
  Image01Icon,
  Search01Icon,
  Notification01Icon,
  UserIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type ArchiveNavItem = {
  key: string;
  label: string;
  href: string;
  icon: IconSvgElement;
};

export const archiveNavItems: readonly ArchiveNavItem[] = [
  { key: "home", label: "Home", href: "/home", icon: Home01Icon },
  { key: "gallery", label: "Gallery", href: "/gallery", icon: Image01Icon },
  { key: "explore", label: "Explore", href: "/explore", icon: Search01Icon },
  { key: "notifications", label: "Notifications", href: "/notifications", icon: Notification01Icon },
  { key: "profile", label: "Profile", href: "/accounts/profile", icon: UserIcon },
  { key: "settings", label: "Settings", href: "/accounts/settings", icon: Settings02Icon },
] as const;
