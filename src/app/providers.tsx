"use client";

import * as React from "react";
import { RouterProvider, I18nProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";


export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({children}: ProvidersProps) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <I18nProvider locale="en-US">
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="archived-theme" disableTransitionOnChange>
          {children}
        </NextThemesProvider>
      </I18nProvider>
    </RouterProvider>
  );
}