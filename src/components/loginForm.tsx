"use client";

import { SignIn } from "@clerk/nextjs";
import { useClerkAuthAppearance } from "@/hooks/useClerkAuthAppearance";
import SignedOutGate from "@/components/signedOutGate";

export default function LoginForm() {
  const clerkAppearance = useClerkAuthAppearance();

  return (
    <SignedOutGate>
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/accounts/login"
        signUpUrl="/accounts/register"
        fallbackRedirectUrl="/home"
      />
    </SignedOutGate>
  );
}
