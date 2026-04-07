import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account and notification settings for Archive.",
};

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-midground flex flex-col w-full min-h-screen">{children}</div>
  );
}
