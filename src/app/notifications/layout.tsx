import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Your Archive notifications.",
};

export default function NotificationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
