import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Archive account.",
};

export default function RegisterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
