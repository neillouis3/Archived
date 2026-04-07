import type { ComponentType } from "react";
import {
  HomeIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export type ArchiveNavItem = {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const archiveNavItems: readonly ArchiveNavItem[] = [
  { key: "home", label: "Home", href: "/home", icon: HomeIcon },
  { key: "gallery", label: "Gallery", href: "/gallery", icon: PhotoIcon },
  { key: "explore", label: "Explore", href: "/explore", icon: MagnifyingGlassIcon },
  { key: "notifications", label: "Notifications", href: "/notifications", icon: BellIcon },
  { key: "profile", label: "Profile", href: "/accounts/profile", icon: UserIcon },
  { key: "settings", label: "Settings", href: "/accounts/settings", icon: Cog6ToothIcon },
] as const;
