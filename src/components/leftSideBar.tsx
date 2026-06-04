"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebarContext";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import AddPostModal from "./addPostModal";
import { ThemeSwitcher } from "./themeSwitch";
import { Button, Separator } from "@heroui/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  Logout01Icon,
  Menu01Icon,
  Cancel01Icon,
  Notification01Icon,
  UserIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { archiveNavItems } from "@/lib/archiveNav";

const PROFILE_MENU_ID = "sidebar-profile-menu";

function useUnreadNotifCount(user: ReturnType<typeof useUser>["user"], pathname: string) {
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
    return () => {
      cancelled = true;
    };
  }, [user, pathname]);
  return unreadNotif;
}

function MobileArchiveNav({
  pathname,
  unreadNotif,
  username,
  displayName,
  resolvedImage,
  user,
}: {
  pathname: string;
  unreadNotif: number;
  username: string;
  displayName: string;
  resolvedImage: string;
  user: NonNullable<ReturnType<typeof useUser>["user"]> | null | undefined;
}) {
  const router = useRouter();
  const { mobileNavOpen, setMobileNavOpen, closeMobileNav } = useSidebar();

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[55] flex min-h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center gap-3 border-b border-stone-200/80 bg-white/95 px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100/90"
          aria-label="Open menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} />
        </button>
        <Link
          href="/home"
          className="text-sm font-medium text-stone-500"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Archive
        </Link>
        <div className="flex-1" />
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100/90"
          aria-label="Notifications"
        >
          <HugeiconsIcon icon={Notification01Icon} size={20} />
          {unreadNotif > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-stone-800 ring-2 ring-white" />
          ) : null}
        </Link>
      </header>

      <AnimatePresence>
        {mobileNavOpen ? (
          <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Navigation">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
              aria-label="Close menu"
              onClick={closeMobileNav}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute left-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col border-r border-stone-200/80 bg-white shadow-2xl pt-[env(safe-area-inset-top)]"
            >
              <div className="flex items-center justify-between border-b border-stone-200/60 px-3 py-3">
                <span
                  className="pl-1 text-xs text-stone-400"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Archive
                </span>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
                  aria-label="Close menu"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
                {archiveNavItems.map((item) => {
                  const icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/home" && pathname.startsWith(item.href)) ||
                    (item.href === "/notifications" && pathname.startsWith("/notifications"));
                  const notifBadge =
                    item.key === "notifications" && unreadNotif > 0
                      ? unreadNotif > 99
                        ? "99+"
                        : String(unreadNotif)
                      : null;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={closeMobileNav}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-white ring-1 ring-inset ring-stone-200 text-stone-800"
                          : "text-stone-600 hover:bg-stone-50/80 hover:text-stone-800"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={icon}
                        size={18}
                        className={`shrink-0 ${isActive ? "text-stone-700" : "text-stone-400"}`}
                      />
                      <span className={`text-sm ${isActive ? "font-medium" : ""}`}>{item.label}</span>
                      {notifBadge ? (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-800 px-1 text-xs text-white">
                          {notifBadge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}

                {user ? (
                  <div className="mt-2 border-t border-stone-200/60 pt-3">
                    <AddPostModal
                      username={username}
                      fullName={displayName}
                      imageUrl={user.imageUrl ?? undefined}
                      fullWidth
                    />
                  </div>
                ) : null}
              </nav>

              <div className="border-t border-stone-200/60 px-2 py-4">
                {user ? (
                  <>
                    <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
                      <img src={resolvedImage} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-stone-200/60" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-stone-800">{displayName}</p>
                        <p className="truncate text-xs text-stone-400">@{username}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {[
                        { icon: UserIcon, label: "Your profile", href: "/accounts/profile" },
                        { icon: Settings02Icon, label: "Settings", href: "/accounts/settings" },
                        { icon: Notification01Icon, label: "Notifications", href: "/notifications" },
                      ].map(({ icon, label, href }) => (
                        <Button
                          key={href}
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            closeMobileNav();
                            router.push(href);
                          }}
                          className="h-9 w-full justify-start gap-2.5 rounded-lg px-2.5 text-xs font-normal text-stone-600 hover:bg-stone-100/90"
                        >
                          <HugeiconsIcon icon={icon} size={17} className="shrink-0 text-stone-400" />
                          {label}
                        </Button>
                      ))}
                      <ThemeSwitcher menuRow />
                    </div>
                    <Separator className="my-2" />
                    <SignOutButton redirectUrl="/">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-full justify-start gap-2 rounded-lg px-2.5 text-xs font-normal text-red-700/90 hover:bg-red-50/90"
                      >
                        <HugeiconsIcon icon={Logout01Icon} size={17} className="shrink-0" />
                        Log out
                      </Button>
                    </SignOutButton>
                  </>
                ) : (
                  <p className="px-2 text-xs text-stone-400">Sign in to post and sync.</p>
                )}
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default function ArchiveLeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [menuMounted, setMenuMounted] = useState(false);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const unreadNotif = useUnreadNotifCount(user, pathname);

  const username = user?.username ?? "user";
  const displayName = user?.fullName ?? user?.firstName ?? "Account";
  const resolvedImage = user?.imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

  useEffect(() => setMenuMounted(true), []);

  useLayoutEffect(() => {
    if (!profileMenuOpen || !profileTriggerRef.current) return;
    const r = profileTriggerRef.current.getBoundingClientRect();
    const menuH = 320;
    const menuW = 220;
    const top = Math.max(8, Math.min(r.top, window.innerHeight - menuH - 8));
    const gap = 10;
    let left = r.right + gap;
    if (left + menuW > window.innerWidth - 8) left = Math.max(8, r.left - menuW - gap);
    setMenuPos({ top, left });
  }, [profileMenuOpen, isCollapsed]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (profileTriggerRef.current?.contains(t)) return;
      if (document.getElementById(PROFILE_MENU_ID)?.contains(t)) return;
      setProfileMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <>
      <MobileArchiveNav
        pathname={pathname}
        unreadNotif={unreadNotif}
        username={username}
        displayName={displayName}
        resolvedImage={resolvedImage}
        user={user}
      />

      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="fixed left-0 top-0 z-40 hidden h-screen shrink-0 border-r border-stone-200/80 bg-white lg:flex lg:flex-col"
      >
        <div className="flex h-full flex-col px-2 pb-4 pt-6">
          <div className="mb-4 flex items-center justify-between px-1">
            {!isCollapsed && (
              <span
                className="pl-2 text-xs text-stone-400"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Archive
              </span>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="ml-auto rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100/80 hover:text-stone-600"
            >
              {isCollapsed ? (
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              ) : (
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              )}
            </button>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-1">
            {archiveNavItems.map((item) => {
              const icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/home" && pathname.startsWith(item.href)) ||
                (item.href === "/notifications" && pathname.startsWith("/notifications"));
              const notifBadge =
                item.key === "notifications" && unreadNotif > 0
                  ? unreadNotif > 99
                    ? "99+"
                    : String(unreadNotif)
                  : null;
              const hasBadge = notifBadge != null;

              const linkEl = (
                <Link
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                  group relative flex items-center gap-3 rounded-lg transition-colors
                  ${isCollapsed ? "justify-center px-1 py-2.5" : "px-2.5 py-2.5"}
                  ${isActive ? "bg-white ring-1 ring-inset ring-stone-200 text-stone-800" : "text-stone-500 hover:bg-stone-50/80 hover:text-stone-700"}
                `}
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={18}
                    className={`flex-shrink-0 ${isActive ? "text-stone-700" : "text-stone-400"}`}
                  />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap text-xs
                        ${isActive ? "font-medium text-stone-800" : ""}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {hasBadge && isCollapsed && (
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-stone-600" />
                  )}
                  {hasBadge && !isCollapsed && (
                    <AnimatePresence mode="wait">
                      <motion.span
                        key="badge"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="ml-auto flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-stone-800 text-xs text-white"
                      >
                        {notifBadge}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </Link>
              );

              return <React.Fragment key={item.key}>{linkEl}</React.Fragment>;
            })}

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  key="post-btn"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-1 pt-2"
                >
                  <AddPostModal
                    username={username}
                    fullName={displayName}
                    imageUrl={user?.imageUrl ?? undefined}
                    fullWidth
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          <div className="mt-auto border-t border-stone-200/60 px-1 pt-5">
            <button
              ref={profileTriggerRef}
              type="button"
              onClick={() => user && setProfileMenuOpen((o) => !o)}
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              aria-controls={PROFILE_MENU_ID}
              disabled={!user}
              className={`
              flex w-full items-center gap-3 rounded-lg text-left transition-colors
              ${user ? "cursor-pointer hover:bg-stone-100/80" : "cursor-default opacity-60"}
              ${isCollapsed ? "justify-center px-1 py-1.5" : "px-2 py-2"}
              ${profileMenuOpen && user ? "bg-white ring-1 ring-inset ring-stone-200" : ""}
            `}
            >
              <span className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-stone-200/60">
                <img src={resolvedImage} alt="" className="h-full w-full object-cover" />
              </span>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    key="profile-info"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex min-w-0 flex-1 flex-col overflow-hidden"
                  >
                    <span className="truncate whitespace-nowrap text-xs font-medium text-stone-700">{displayName}</span>
                    <span className="truncate whitespace-nowrap text-xs text-stone-400">@{username}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isCollapsed && user && (
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={16}
                  className={`flex-shrink-0 text-stone-400 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              )}
            </button>

            {menuMounted && profileMenuOpen && user && createPortal(
              <motion.div
                id={PROFILE_MENU_ID}
                role="menu"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{ top: menuPos.top, left: menuPos.left }}
                className="fixed z-[100] w-[220px] rounded-xl border border-stone-200/80 bg-white py-2 shadow-xl"
              >
                <div className="border-b border-stone-100 px-3 pb-2">
                  <p className="truncate text-xs font-medium text-stone-800">{displayName}</p>
                  <p className="truncate text-xs text-stone-400">@{username}</p>
                </div>
                <div className="flex flex-col gap-0.5 px-1 pt-2">
                  {[
                    { icon: UserIcon, label: "Your profile", href: "/accounts/profile" },
                    { icon: Settings02Icon, label: "Settings", href: "/accounts/settings" },
                    { icon: Notification01Icon, label: "Notifications", href: "/notifications" },
                  ].map(({ icon, label, href }) => (
                    <Button
                      key={href}
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        setProfileMenuOpen(false);
                        router.push(href);
                      }}
                      className="h-8 w-full justify-start gap-2.5 rounded-lg px-2.5 text-xs font-normal text-stone-600 hover:bg-stone-100/90"
                    >
                      <HugeiconsIcon icon={icon} size={17} className="flex-shrink-0 text-stone-400" />
                      {label}
                    </Button>
                  ))}
                  <ThemeSwitcher menuRow />
                </div>
                <Separator className="mx-2 my-1.5" />
                <div className="px-1 pb-0.5">
                  <SignOutButton redirectUrl="/">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full justify-start rounded-lg px-2.5 text-xs font-normal text-red-700/90 hover:bg-red-50/90"
                    >
                      <HugeiconsIcon icon={Logout01Icon} size={17} className="flex-shrink-0" />
                      Log out
                    </Button>
                  </SignOutButton>
                </div>
              </motion.div>,
              document.body
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
