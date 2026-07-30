"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar } from "@heroui/react";
import {
  Home01Icon,
  Image01Icon,
  Search01Icon,
  FavouriteIcon,
  AddSquareIcon,
  Settings02Icon,
  Logout01Icon,
  Cancel01Icon,
  Menu01Icon,
  Moon01Icon,
  Sun01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useTheme } from "next-themes";
import AddPostModal from "./addPostModal";
import { useSidebar } from "./sidebarContext";
import { archiveNavItems, isNavActive } from "@/lib/archiveNav";
import { SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from "@/lib/sidebarWidths";

const NAV_ICONS: Record<string, IconSvgElement> = {
  home: Home01Icon,
  gallery: Image01Icon,
  search: Search01Icon,
  notifications: FavouriteIcon,
  create: AddSquareIcon,
};

function useUnreadNotifCount(user: ReturnType<typeof useUser>["user"]) {
  const [unreadNotif, setUnreadNotif] = useState(0);
  useEffect(() => {
    if (!user) {
      setUnreadNotif(0);
      return;
    }
    let cancelled = false;
    async function loadUnread() {
      try {
        const res = await fetch("/api/notifications?unreadCount=1", {
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setUnreadNotif(typeof data.unread === "number" ? data.unread : 0);
      } catch {
        if (!cancelled) setUnreadNotif(0);
      }
    }
    void loadUnread();
    const onFocus = () => void loadUnread();
    window.addEventListener("focus", onFocus);
    const interval = window.setInterval(() => void loadUnread(), 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
    };
  }, [user]);
  return unreadNotif;
}

function NavGlyph({ itemKey, active }: { itemKey: string; active: boolean }) {
  const icon = NAV_ICONS[itemKey];
  if (!icon) return null;
  return (
    <HugeiconsIcon
      icon={icon}
      size={24}
      strokeWidth={1.6}
      className={active ? "text-black" : "text-neutral-500"}
    />
  );
}

/** Icons live in a collapsed-width column so they stay centered when the rail clips. */
function navItemClass(active: boolean, expanded: boolean) {
  // Pill must fit inside the visible rail when collapsed (aside clips overflow),
  // otherwise the right side looks square where it's cut off.
  const pill = expanded
    ? "before:left-2 before:right-2"
    : "before:left-2 before:w-14"; // 8px inset + 56px = 72px collapsed rail

  return [
    "relative z-0 flex w-full items-center py-3 font-sans text-sm font-normal leading-none transition-colors",
    "before:pointer-events-none before:absolute before:inset-y-0 before:-z-10 before:rounded-lg before:transition-[background-color,width,left,right]",
    pill,
    "hover:before:bg-neutral-100",
    active ? "text-black before:bg-neutral-100" : "text-neutral-500",
  ].join(" ");
}

function NavIconSlot({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: SIDEBAR_COLLAPSED_W }}
    >
      {children}
    </span>
  );
}

function NavLabel({ expanded, children }: { expanded: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`pr-3 whitespace-nowrap transition-opacity duration-100 ease-out ${
        expanded ? "opacity-100 delay-75" : "opacity-0 delay-0 pointer-events-none"
      }`}
      aria-hidden={!expanded}
    >
      {children}
    </span>
  );
}

function MoreMenu({
  username,
  displayName,
  resolvedImage,
  expanded,
  onNavigate,
}: {
  username: string;
  displayName: string;
  resolvedImage: string;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const cleanUsername = username.replace(/^@+/, "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const isDark = themeMounted && resolvedTheme === "dark";

  function closeMenu() {
    setMenuOpen(false);
  }

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    // Anchor menu bottom to the More row — opens upward beside the rail.
    setPos({
      bottom: Math.max(8, window.innerHeight - rect.bottom),
      left: rect.right + gap,
    });
  }

  useLayoutEffect(() => {
    if (!menuOpen) {
      setPos(null);
      return;
    }
    updatePosition();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    function onReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [menuOpen]);

  function runAction(action: "profile" | "settings" | "logout") {
    closeMenu();
    if (action === "profile") {
      onNavigate?.();
      router.push("/accounts/profile");
      return;
    }
    if (action === "settings") {
      onNavigate?.();
      router.push("/accounts/settings");
      return;
    }
    void signOut({ redirectUrl: "/" });
  }

  const menu =
    menuOpen && pos
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Account menu"
            className="fixed z-[100] w-[260px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            style={{ bottom: pos.bottom, left: pos.left }}
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 px-5 pb-3 pt-5 text-left transition-colors hover:bg-neutral-50"
              onClick={() => runAction("profile")}
            >
              <Avatar
                size="sm"
                className="size-10 shrink-0 rounded-full shadow-none"
              >
                <Avatar.Image
                  src={resolvedImage}
                  alt={cleanUsername}
                  className="rounded-full object-cover"
                />
                <Avatar.Fallback className="rounded-full text-xs font-sans">
                  {(displayName || cleanUsername).slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {displayName}
                </p>
                <p className="truncate text-sm text-neutral-500">
                  @{cleanUsername}
                </p>
              </div>
            </button>

            <div className="py-2">
              <button
                type="button"
                role="menuitem"
                className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
                onClick={() => runAction("profile")}
              >
                <span>Profile</span>
                <HugeiconsIcon
                  icon={UserIcon}
                  size={18}
                  strokeWidth={1.6}
                  className="shrink-0 text-neutral-800"
                />
              </button>
              <button
                type="button"
                role="menuitem"
                className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
                onClick={() => runAction("settings")}
              >
                <span>Settings</span>
                <HugeiconsIcon
                  icon={Settings02Icon}
                  size={18}
                  strokeWidth={1.6}
                  className="shrink-0 text-neutral-800"
                />
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={!themeMounted}
                className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                onClick={() => {
                  setTheme(resolvedTheme === "dark" ? "light" : "dark");
                }}
              >
                <span>
                  {!themeMounted
                    ? "Theme"
                    : isDark
                      ? "Light mode"
                      : "Dark mode"}
                </span>
                <HugeiconsIcon
                  icon={isDark ? Sun01Icon : Moon01Icon}
                  size={18}
                  strokeWidth={1.6}
                  className="shrink-0 text-neutral-800"
                />
              </button>
              <button
                type="button"
                role="menuitem"
                className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-neutral-100"
                onClick={() => runAction("logout")}
              >
                <span>Log out</span>
                <HugeiconsIcon
                  icon={Logout01Icon}
                  size={18}
                  strokeWidth={1.6}
                  className="shrink-0 text-red-600"
                />
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className={[
          navItemClass(menuOpen, expanded),
          "cursor-pointer",
        ].join(" ")}
      >
        <NavIconSlot>
          <HugeiconsIcon
            icon={Menu01Icon}
            size={24}
            strokeWidth={1.6}
            className={menuOpen ? "text-black" : "text-neutral-500"}
          />
        </NavIconSlot>
        <NavLabel expanded={expanded}>More</NavLabel>
      </button>
      {menu}
    </div>
  );
}

function SidebarNav({
  pathname,
  unreadNotif,
  username,
  displayName,
  resolvedImage,
  expanded,
  onNavigate,
}: {
  pathname: string;
  unreadNotif: number;
  username: string;
  displayName: string;
  resolvedImage: string;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const profileActive = isNavActive(pathname, "profile");

  return (
    /* Fixed expanded inner width — parent clips; icons never re-center on shrink. */
    <div
      className="flex h-full flex-col py-4"
      style={{ width: SIDEBAR_EXPANDED_W }}
    >
      <Link
        href="/home"
        onClick={onNavigate}
        className="mb-6 inline-flex items-center py-0"
        aria-label="Archive home"
      >
        <NavIconSlot>
          <Image
            src="/archive-logo.png"
            alt="Archive"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            priority
          />
        </NavIconSlot>
      </Link>

      <nav className="flex min-h-0 flex-1 flex-col justify-center gap-1 overflow-y-auto overflow-x-hidden">
        {archiveNavItems.map((item) => {
          const active = isNavActive(pathname, item.key);
          const badge =
            item.key === "notifications" && unreadNotif > 0
              ? unreadNotif > 99
                ? "99+"
                : String(unreadNotif)
              : null;

          const content = (
            <>
              <NavIconSlot>
                <span className="relative size-6">
                  <NavGlyph itemKey={item.key} active={active} />
                  {badge ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold leading-none text-white">
                      {Number(badge) > 9 && !badge.includes("+") ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
              </NavIconSlot>
              <NavLabel expanded={expanded}>{item.label}</NavLabel>
            </>
          );

          if (!item.href) {
            return (
              <button
                key={item.key}
                type="button"
                className={`${navItemClass(false, expanded)} text-left opacity-50`}
                disabled
                title="Coming soon"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={navItemClass(active, expanded)}
              aria-label={item.label}
              title={!expanded ? item.label : undefined}
            >
              {content}
            </Link>
          );
        })}

        <AddPostModal username={username} fullName={displayName} imageUrl={resolvedImage}>
          <button
            type="button"
            onClick={onNavigate}
            className={navItemClass(false, expanded)}
            aria-label="Create"
            title={!expanded ? "Create" : undefined}
          >
            <NavIconSlot>
              <NavGlyph itemKey="create" active={false} />
            </NavIconSlot>
            <NavLabel expanded={expanded}>Create</NavLabel>
          </button>
        </AddPostModal>

        <Link
          href="/accounts/profile"
          onClick={onNavigate}
          className={navItemClass(profileActive, expanded)}
          aria-label="Profile"
          title={!expanded ? "Profile" : undefined}
        >
          <NavIconSlot>
            <Avatar
              size="sm"
              className="size-6 shrink-0 rounded-full shadow-none"
            >
              <Avatar.Image
                src={resolvedImage}
                alt={username.replace(/^@+/, "")}
                className="rounded-full object-cover"
              />
              <Avatar.Fallback className="rounded-full text-xs font-sans">
                {username.replace(/^@+/, "").slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
          </NavIconSlot>
          <NavLabel expanded={expanded}>Profile</NavLabel>
        </Link>
      </nav>

      <div className="flex shrink-0 flex-col gap-1 pt-4">
        <MoreMenu
          username={username}
          displayName={displayName}
          resolvedImage={resolvedImage}
          expanded={expanded}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

function MobileChrome({
  pathname,
  unreadNotif,
  username,
  displayName,
  resolvedImage,
}: {
  pathname: string;
  unreadNotif: number;
  username: string;
  displayName: string;
  resolvedImage: string;
}) {
  const { mobileNavOpen, setMobileNavOpen, closeMobileNav } = useSidebar();

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen, closeMobileNav]);

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[55] flex min-h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center gap-3 border-b border-neutral-200 bg-white px-3 pt-[env(safe-area-inset-top,0px)]">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-10 w-10 items-center justify-center text-neutral-600"
          aria-label="Open menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} />
        </button>
        <Link href="/home" aria-label="Archive home">
          <Image
            src="/archive-logo.png"
            alt="Archive"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            priority
          />
        </Link>
        <div className="flex-1" />
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center text-neutral-500"
          aria-label="Notifications"
        >
          <HugeiconsIcon icon={FavouriteIcon} size={24} strokeWidth={1.6} />
          {unreadNotif > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
              {unreadNotif > 9 ? "9+" : unreadNotif}
            </span>
          ) : null}
        </Link>
      </header>

      {mobileNavOpen ? (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={closeMobileNav}
          />
          <aside
            className="absolute left-0 top-0 flex h-full max-w-[88vw] flex-col bg-white shadow-2xl pt-[env(safe-area-inset-top)]"
            style={{ width: SIDEBAR_EXPANDED_W }}
          >
            <div className="absolute right-2 top-[calc(0.75rem+env(safe-area-inset-top))] z-10">
              <button
                type="button"
                onClick={closeMobileNav}
                className="flex h-9 w-9 items-center justify-center text-neutral-500"
                aria-label="Close menu"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>
            <SidebarNav
              pathname={pathname}
              unreadNotif={unreadNotif}
              username={username}
              displayName={displayName}
              resolvedImage={resolvedImage}
              expanded
              onNavigate={closeMobileNav}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default function ArchiveLeftSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const unreadNotif = useUnreadNotifCount(user);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const username = user?.username ?? "user";
  const displayName = user?.fullName ?? user?.firstName ?? "Account";
  const resolvedImage = user?.imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

  /** Labels show on hover only — menu open no longer expands the rail. */
  const expanded = hovered;

  function clearLeaveTimer() {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  function handleEnter() {
    clearLeaveTimer();
    setHovered(true);
  }

  function handleLeave() {
    clearLeaveTimer();
    // Short delay avoids flicker when the cursor crosses gaps between items.
    leaveTimer.current = setTimeout(() => setHovered(false), 80);
  }

  useEffect(
    () => () => {
      clearLeaveTimer();
    },
    []
  );

  return (
    <>
      <MobileChrome
        pathname={pathname}
        unreadNotif={unreadNotif}
        username={username}
        displayName={displayName}
        resolvedImage={resolvedImage}
      />

      <aside
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="fixed left-0 top-0 z-40 hidden h-screen overflow-hidden bg-white lg:block"
        style={{
          width: expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
          transition: "width 200ms cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "width",
        }}
      >
        <SidebarNav
          pathname={pathname}
          unreadNotif={unreadNotif}
          username={username}
          displayName={displayName}
          resolvedImage={resolvedImage}
          expanded={expanded}
        />
      </aside>
    </>
  );
}
