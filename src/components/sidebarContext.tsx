"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface SidebarContextType {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Matches Tailwind `lg` (1024px) — narrow viewports use header + drawer */
  isMobile: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  closeMobileNav: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const check = () => setIsMobile(mq.matches);
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="))
      ?.split("=")[1];
    if (saved) setOpen(saved === "true");
  }, []);

  const toggleSidebar = useCallback(() => {
    setOpen((prev) => {
      const newState = !prev;
      document.cookie = `sidebar_state=${newState}; path=/; max-age=${60 * 60 * 24 * 7}`;
      return newState;
    });
  }, []);

  const state: "expanded" | "collapsed" = open ? "expanded" : "collapsed";

  const value = useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
      closeMobileNav,
    }),
    [state, open, isMobile, toggleSidebar, mobileNavOpen, closeMobileNav]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
