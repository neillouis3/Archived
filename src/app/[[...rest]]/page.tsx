"use client";

import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
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
          alt="Archived"
          width={120}
          height={120}
          priority
          className="mb-4"
        />
        <h1 className="mb-10 font-normal text-xl text-stone-800 sm:text-2xl">
          Archived
        </h1>

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
