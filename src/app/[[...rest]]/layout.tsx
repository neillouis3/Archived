import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Archive — a place for your moments.",
};

export default function AuthCatchAllLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-screen flex flex-col bg-white text-foreground w-screen items-center overflow-y-auto">
      <div className="w-screen">{children}</div>
    </div>
  );
}
