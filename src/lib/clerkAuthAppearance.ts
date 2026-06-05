import type { Appearance } from "@clerk/types";
import { APP_FONT_FAMILY } from "@/lib/appFont";

const sharedElements: NonNullable<Appearance["elements"]> = {
  rootBox: "w-full flex justify-center",
  headerTitle: "text-stone-800 dark:text-stone-100",
  headerSubtitle: "text-stone-500 dark:text-stone-400",
  formButtonPrimary: "bg-stone-800 hover:bg-stone-700 text-sm",
  footerActionLink: "text-stone-700 dark:text-stone-200 font-medium",
  identityPreviewText: "text-stone-700 dark:text-stone-200",
  formFieldLabel: "text-stone-600 dark:text-stone-300",
};

/** Shared Clerk UI for sign-in / sign-up pages (matches settings Account tab). */
export const clerkAuthAppearance: Appearance = {
  variables: {
    colorPrimary: "#44403c",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#3a3530",
    fontFamily: APP_FONT_FAMILY,
    borderRadius: "0.75rem",
    fontSize: "14px",
  },
  elements: {
    ...sharedElements,
    card: "shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-stone-200/90 bg-white rounded-2xl dark:bg-stone-900 dark:border-stone-700/80",
    socialButtonsBlockButton:
      "border-stone-200 bg-white hover:bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-stone-200",
    formFieldInput:
      "bg-white border-stone-200/80 dark:bg-stone-900 dark:border-stone-700/80 dark:text-stone-100",
  },
};

export const clerkAuthAppearanceDark: Appearance = {
  variables: {
    colorPrimary: "#d6d3d1",
    colorBackground: "#1c1917",
    colorInputBackground: "#292524",
    colorInputText: "#fafaf9",
    colorText: "#fafaf9",
    colorTextSecondary: "#a8a29e",
    fontFamily: APP_FONT_FAMILY,
    borderRadius: "0.75rem",
    fontSize: "14px",
  },
  elements: {
    ...sharedElements,
    card: "shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-stone-700/80 bg-stone-900 rounded-2xl",
    socialButtonsBlockButton:
      "border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200",
    formFieldInput: "bg-stone-900 border-stone-700/80 text-stone-100",
  },
};

export function getClerkAuthAppearance(resolvedTheme?: string): Appearance {
  return resolvedTheme === "dark" ? clerkAuthAppearanceDark : clerkAuthAppearance;
}
