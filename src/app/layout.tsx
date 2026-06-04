import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import { ClerkProvider } from "@clerk/nextjs";

/** Clerk client hooks need a real key at runtime; static prerender also evaluates the root layout. */
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Avoid static prerender of routes that use Clerk in the tree (reduces build-time edge cases).
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Archive",
    template: "%s | Archive",
  },
  description: "A place for your moments.",
  icons: {
    icon: "/archive-logo.ico",
    shortcut: "/archive-logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (!clerkPublishableKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. In Vercel: Project → Settings → Environment Variables → add your Clerk publishable key for Production (and Preview if you use it), then redeploy. Also set CLERK_SECRET_KEY."
      );
    }
    return shell;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>{shell}</ClerkProvider>
  );
}
