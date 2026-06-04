"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerkAuthAppearance";
import SignedOutGate from "@/components/signedOutGate";

export default function LoginForm() {
  return (
    <SignedOutGate>
      <SignIn
        appearance={clerkAuthAppearance}
        routing="path"
        path="/accounts/login"
        signUpUrl="/accounts/register"
        fallbackRedirectUrl="/home"
      />
    </SignedOutGate>
  );
}
