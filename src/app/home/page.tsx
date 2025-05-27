import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home/HomeClient";
import { cookies } from "next/headers"; // ✅ Move this to the top

export default async function Home() {
  const session = await getAuthSession();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "1";
  if (!session?.user && !isAdmin) {
    redirect("/");
  }
  return <HomeClient />;
}