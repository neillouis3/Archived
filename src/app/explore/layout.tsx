import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Discover moments on Archive.",
};

export default function ExploreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
