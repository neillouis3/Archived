"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface SignedOutGateProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/** Don't mount Clerk auth forms while signed in — avoids redirect/hooks races after login. */
export default function SignedOutGate({
  children,
  redirectTo = "/home",
  fallback = null,
}: SignedOutGateProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace(redirectTo);
    }
  }, [isLoaded, isSignedIn, redirectTo, router]);

  if (!isLoaded || isSignedIn) {
    return fallback;
  }

  return children;
}
