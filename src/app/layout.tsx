import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import { ClerkProvider } from "@clerk/nextjs";

/** Clerk client hooks need a real key at runtime; static prerender also evaluates the root layout. */
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Archived",
  description: "A place for your moments.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body className="antialiased">
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
