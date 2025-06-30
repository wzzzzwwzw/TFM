"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SignInButton from "@/components/SignInButton";

function SignInInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "";
  if (error === "AccessDenied") {
    errorMessage = "Your account has been blocked. Please contact support.";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      {errorMessage && <div className="mb-4 text-red-600">{errorMessage}</div>}
      <SignInButton text="Sign in with Google" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  );
}