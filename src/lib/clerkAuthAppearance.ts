import type { Appearance } from "@clerk/types";

/** Shared Clerk UI for sign-in / sign-up pages (matches settings Account tab). */
export const clerkAuthAppearance: Appearance = {
  variables: {
    colorPrimary: "#44403c",
    colorBackground: "#F7F6F2",
    colorInputBackground: "#EDEAE3",
    colorInputText: "#3a3530",
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: "0.75rem",
    fontSize: "14px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    card: "shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-stone-200/90 bg-[#FDFCF9] rounded-2xl",
    headerTitle: "text-stone-800",
    headerSubtitle: "text-stone-500",
    socialButtonsBlockButton:
      "border-stone-200 bg-white hover:bg-stone-50 text-stone-700",
    formButtonPrimary: "bg-stone-800 hover:bg-stone-700 text-sm",
    footerActionLink: "text-stone-700 font-medium",
    formFieldInput: "bg-[#EDEAE3] border-stone-200/80",
    identityPreviewText: "text-stone-700",
    formFieldLabel: "text-stone-600",
  },
};
