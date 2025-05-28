"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    // Force Google sign out and redirect back to your app
    window.location.href =
      "https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=" +
      encodeURIComponent(window.location.origin);
  };

  return (
    <button
      className="px-3 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
      onClick={handleSignOut}
    >
      Sign Out
    </button>
  );
}