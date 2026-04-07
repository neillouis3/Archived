import type { Metadata } from "next";

import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Archive — a place for your moments.",
};

export default function AuthCatchAllLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-white bg-background text-foreground w-screen items-center overflow-y-auto">
      <div className="w-screen px-34 py-17">{children}</div>
      <Footer />
    </div>
  );
}
