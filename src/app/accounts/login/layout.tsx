import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Sign in to Archive.",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
