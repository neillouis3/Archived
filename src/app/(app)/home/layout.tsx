import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Your Archive feed — following first, then suggested posts.",
};

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-white text-foreground flex flex-col w-full">{children}</div>
  );
}
