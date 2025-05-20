import Link from "next/link";
import React from "react";

import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";
import { getAuthSession } from "@/lib/nextauth";
import SignInButton from "./SignInButton";

const Navbar = async () => {
  const session = await getAuthSession();
  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300  py-2 ">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href={"/"} className="flex items-center gap-2">
          <p className="rounded-lg border-4 border-blue-900 bg-blue-600 px-3 py-1 text-xl font-bold text-white hover:bg-blue-700 transition-all hover:-translate-y-1 md:block">
            Quizzzy
          </p>
        </Link>
        <div className="flex items-center">
          <ThemeToggle className="mr-4" />
           {session?.user?.email === "waelwzwz@gmail.com" && (
            <Link
              href="/admin"
              className="mr-4 px-3 py-1 rounded bg-blue-900 text-white font-semibold hover:bg-blue-700 transition"
            >
              Admin
            </Link>
          )}
          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <SignInButton text={"Sign In"} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
