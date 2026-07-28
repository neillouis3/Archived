"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSidebar } from "./sidebarContext";
import Link from "next/link";
import Image from "next/image";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";
import AddPostModal from "./addPostModal";
import { ThemeSwitcher } from "./themeSwitch";
import { Button, Dropdown, Header, Separator } from "@heroui/react";
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
  Moon02Icon,
  Sun02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { archiveNavItems } from "@/lib/archiveNav";

function SidebarLogo({
  size = 32,
  className,
  onNavigate,
}: {
  size?: number;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link href="/home" className={className} onClick={onNavigate}>
      <Image
        src="/archive-logo.png"
        alt="Archive"
        width={size}
        height={size}
        className="object-contain"
        priority={size >= 28}
      />
    </Link>
  );
}

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
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[55] flex min-h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center gap-3 border-b border-stone-200/80 bg-background/95 px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100/90"
          aria-label="Open menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} />
        </button>
        <SidebarLogo size={28} className="shrink-0" />
        <div className="flex-1" />
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100/90"
          aria-label="Notifications"
        >
          <HugeiconsIcon icon={Notification01Icon} size={20} />
          {unreadNotif > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-800 px-0.5 text-[10px] font-medium leading-none text-white ring-2 ring-white tabular-nums">
              {unreadNotif > 9 ? "9+" : unreadNotif}
            </span>
          ) : null}
        </Link>
      </header>

      {mobileNavOpen ? (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={closeMobileNav}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col border-r border-stone-200/80 bg-background shadow-2xl pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between border-b border-stone-200/60 px-3 py-3">
              <SidebarLogo size={28} className="pl-1" onNavigate={closeMobileNav} />
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
                        ? "bg-background ring-1 ring-inset ring-stone-200 text-stone-800"
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
                  <div className="my-2 border-t border-stone-200/60" />
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
          </aside>
        </div>
      ) : null}
    </>
  );
}

function ProfileMenuDropdown({
  displayName,
  username,
  resolvedImage,
  isCollapsed,
}: {
  displayName: string;
  username: string;
  resolvedImage: string;
  isCollapsed: boolean;
}) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  function handleAction(key: React.Key) {
    switch (key) {
      case "profile":
        router.push("/accounts/profile");
        break;
      case "settings":
        router.push("/accounts/settings");
        break;
      case "notifications":
        router.push("/notifications");
        break;
      case "theme":
        setTheme(isDark ? "light" : "dark");
        break;
      case "logout":
        void signOut({ redirectUrl: "/" });
        break;
    }
  }

  const menuItemClass = "min-h-6 gap-1.5 rounded-lg px-2 py-0.5 text-stone-500";
  const menuIconClass = "shrink-0 text-stone-500";
  const menuLabelClass = "text-xs font-normal leading-none text-stone-500";

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Account menu"
        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg text-left transition-colors
          hover:bg-stone-100/80
          data-[pressed]:scale-100 data-[pressed]:bg-transparent active:scale-100
          data-[focus-visible]:ring-1 data-[focus-visible]:ring-stone-300
          ${isCollapsed ? "justify-center px-1 py-1.5" : "h-auto min-h-0 justify-start px-2 py-2"}`}
      >
        <span className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-stone-200/60">
          <img src={resolvedImage} alt="" className="h-full w-full object-cover" />
        </span>
        {!isCollapsed ? (
          <>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden text-left">
              <span className="truncate whitespace-nowrap text-xs font-medium text-stone-700">
                {displayName}
              </span>
              <span className="truncate whitespace-nowrap text-xs text-stone-400">@{username}</span>
            </div>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              className="flex-shrink-0 text-stone-400"
              aria-hidden
            />
          </>
        ) : null}
      </Dropdown.Trigger>

      <Dropdown.Popover placement="right bottom" className="min-w-[188px]">
        <Dropdown.Menu
          onAction={handleAction}
          className="p-1 [&_[data-slot=menu-item]]:min-h-6 [&_[data-slot=menu-item]]:gap-1.5 [&_[data-slot=menu-item]]:rounded-lg [&_[data-slot=menu-item]]:py-0.5"
        >
          <Dropdown.Section>
            <Header className="px-2 pb-1">
              <p className="truncate text-xs font-medium text-stone-800">{displayName}</p>
              <p className="truncate text-xs text-stone-400">@{username}</p>
            </Header>
          </Dropdown.Section>
          <Dropdown.Item id="profile" textValue="Your profile" className={menuItemClass}>
            <HugeiconsIcon icon={UserIcon} size={14} className={menuIconClass} />
            <span className={menuLabelClass}>Your profile</span>
          </Dropdown.Item>
          <Dropdown.Item id="settings" textValue="Settings" className={menuItemClass}>
            <HugeiconsIcon icon={Settings02Icon} size={14} className={menuIconClass} />
            <span className={menuLabelClass}>Settings</span>
          </Dropdown.Item>
          <Dropdown.Item id="notifications" textValue="Notifications" className={menuItemClass}>
            <HugeiconsIcon icon={Notification01Icon} size={14} className={menuIconClass} />
            <span className={menuLabelClass}>Notifications</span>
          </Dropdown.Item>
          <Dropdown.Item
            id="theme"
            textValue={isDark ? "Light mode" : "Dark mode"}
            className={menuItemClass}
          >
            <HugeiconsIcon
              icon={isDark ? Sun02Icon : Moon02Icon}
              size={14}
              className={menuIconClass}
            />
            <span className={menuLabelClass}>{isDark ? "Light mode" : "Dark mode"}</span>
          </Dropdown.Item>
          <Separator />
          <Dropdown.Item
            id="logout"
            textValue="Log out"
            variant="danger"
            className={`${menuItemClass} text-danger`}
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} className="shrink-0 text-danger" />
            <span className="text-xs font-normal leading-none text-danger">Log out</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export default function ArchiveLeftSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const unreadNotif = useUnreadNotifCount(user);

  const username = user?.username ?? "user";
  const displayName = user?.fullName ?? user?.firstName ?? "Account";
  const resolvedImage = user?.imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

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

      <div
        className={`fixed left-0 top-0 z-40 hidden h-screen shrink-0 border-r border-stone-200/80 bg-background transition-[width] duration-200 ease-out lg:flex lg:flex-col ${
          isCollapsed ? "w-[4.5rem]" : "w-[16.25rem]"
        }`}
      >
        <div className="flex h-full flex-col px-2 pb-4 pt-6">
          <div
            className={`mb-4 flex px-1 ${
              isCollapsed ? "flex-col items-center gap-2" : "items-center justify-between"
            }`}
          >
            <SidebarLogo size={isCollapsed ? 32 : 72} className={isCollapsed ? "" : "pl-1"} />
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100/80 hover:text-stone-600 ${
                isCollapsed ? "" : "ml-auto"
              }`}
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

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                  group relative flex items-center gap-3 rounded-lg transition-colors
                  ${isCollapsed ? "justify-center px-1 py-2.5" : "px-2.5 py-2.5"}
                  ${isActive ? "bg-background ring-1 ring-inset ring-stone-200 text-stone-800" : "text-stone-500 hover:bg-stone-50/80 hover:text-stone-700"}
                `}
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={18}
                    className={`flex-shrink-0 ${isActive ? "text-stone-700" : "text-stone-400"}`}
                  />
                  {!isCollapsed ? (
                    <span
                      className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap text-xs ${
                        isActive ? "font-medium text-stone-800" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  ) : null}
                  {hasBadge && isCollapsed ? (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-800 px-0.5 text-[10px] font-medium leading-none text-white ring-2 ring-white tabular-nums">
                      {Number(notifBadge) > 9 ? "9+" : notifBadge}
                    </span>
                  ) : null}
                  {hasBadge && !isCollapsed ? (
                    <span className="ml-auto flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-stone-800 px-1.5 text-xs font-medium text-white tabular-nums">
                      {notifBadge}
                    </span>
                  ) : null}
                </Link>
              );
            })}

            {!isCollapsed ? (
              <div className="px-1 pt-2">
                <AddPostModal
                  username={username}
                  fullName={displayName}
                  imageUrl={user?.imageUrl ?? undefined}
                  fullWidth
                />
              </div>
            ) : null}
          </nav>

          <div className="mt-auto border-t border-stone-200/60 px-1 pt-5">
            {user ? (
              <ProfileMenuDropdown
                displayName={displayName}
                username={username}
                resolvedImage={resolvedImage}
                isCollapsed={isCollapsed}
              />
            ) : (
              <div
                className={`flex w-full items-center gap-3 rounded-lg opacity-60 ${
                  isCollapsed ? "justify-center px-1 py-1.5" : "px-2 py-2"
                }`}
              >
                <span className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-stone-200/60">
                  <img src={resolvedImage} alt="" className="h-full w-full object-cover" />
                </span>
                {!isCollapsed ? (
                  <div className="min-w-0 flex-1 flex-col overflow-hidden">
                    <span className="truncate whitespace-nowrap text-xs font-medium text-stone-700">{displayName}</span>
                    <span className="truncate whitespace-nowrap text-xs text-stone-400">@{username}</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
