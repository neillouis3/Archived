import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Your Archive feed — following and discover.",
};

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background text-foreground flex flex-col w-full">{children}</div>
  );
}
