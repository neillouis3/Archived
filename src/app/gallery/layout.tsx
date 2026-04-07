import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Your media collection on Archive.",
};

export default function GalleryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
