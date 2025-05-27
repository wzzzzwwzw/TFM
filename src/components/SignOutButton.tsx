"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="px-3 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
      onClick={() => {
        fetch("/api/sign-out").then(() => signOut());
      }}
    >
      Sign Out
    </button>
  );
}