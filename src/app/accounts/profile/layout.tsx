import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Your Archive profile and posts.",
};

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="bg-midground flex flex-col w-full">{children}</div>;
}
