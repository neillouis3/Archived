"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import SignedOutGate from "@/components/signedOutGate";
import { useClerkAuthAppearance } from "@/hooks/useClerkAuthAppearance";

export default function LandingPage() {
  const clerkAppearance = useClerkAuthAppearance();

  return (
    <SignedOutGate
      fallback={
        <div className="flex h-[100vh] w-full items-center justify-center bg-background" />
      }
    >
      <div
        className="flex h-[100vh] w-full flex-col items-center justify-center overflow-y-auto bg-background px-4 py-12"
       
      >
        <Image
          src="/archive-logo.png"
          alt="Archive"
          width={120}
          height={120}
          priority
          className="mb-10"
        />

        <div className="w-full max-w-[420px]">
          <SignIn
            appearance={{
              ...clerkAppearance,
              elements: {
                ...clerkAppearance.elements,
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
            routing="path"
            path="/"
            signUpUrl="/accounts/register"
            fallbackRedirectUrl="/home"
          />
        </div>
      </div>
    </SignedOutGate>
  );
}
