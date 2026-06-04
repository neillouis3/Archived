"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import SignedOutGate from "@/components/signedOutGate";
import { clerkAuthAppearance } from "@/lib/clerkAuthAppearance";

export default function LandingPage() {
  return (
    <SignedOutGate
      fallback={
        <div className="flex h-[100vh] w-full items-center justify-center bg-white" />
      }
    >
      <div
        className="flex h-[100vh] w-full flex-col items-center justify-center overflow-y-auto bg-white px-4 py-12"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
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
              ...clerkAuthAppearance,
              elements: {
                ...clerkAuthAppearance.elements,
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
