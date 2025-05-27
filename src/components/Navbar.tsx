
import Link from "next/link";
import React from "react";
import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";
import { getAuthSession } from "@/lib/nextauth";
import SignInButton from "./SignInButton";
import SignOutButton from "./SignOutButton";
import { cookies } from "next/headers";
import { UserCircle2 } from "lucide-react";

const Navbar = async () => {
  const session = await getAuthSession();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "1";

  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-2">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href={"/"} className="flex items-center gap-2">
          <p className="rounded-lg border-4 border-blue-900 bg-blue-600 px-3 py-1 text-xl font-bold text-white hover:bg-blue-700 transition-all hover:-translate-y-1 md:block">
            Quizzzy
          </p>
        </Link>
        {/* Centered Home and My Stats buttons */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-4">
            <Link
              href="/home"
              className="px-5 py-1 rounded font-bold text-blue-700 border-2 border-blue-700 bg-white hover:bg-blue-700 hover:text-white transition text-lg"
            >
              Home
            </Link>
            <Link
              href="/mystats"
              className="px-5 py-1 rounded font-bold text-blue-700 border-2 border-blue-700 bg-white hover:bg-blue-700 hover:text-white transition text-lg"
            >
              My Stats
            </Link>
          </div>
        </div>
        {/* Right side: Theme, Admin, User */}
        <div className="flex items-center">
          <ThemeToggle className="mr-4" />
          <Link
            href="/admin"
            className="mr-4 px-3 py-1 rounded bg-blue-900 text-white font-semibold hover:bg-blue-700 transition"
          >
            Admin
          </Link>
          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : isAdmin ? (
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-8 h-8 text-blue-900" />
              <span className="font-semibold text-blue-900">Admin</span>
              <SignOutButton />
            </div>
          ) : (
            <SignInButton text={"Sign In"} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;