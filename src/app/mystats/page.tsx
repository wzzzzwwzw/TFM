import UserQuizStats from "@/components/UserQuizStats";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function MyStatsPage() {
  const session = await getAuthSession();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "1";
  if (!session?.user && !isAdmin) {
    redirect("/");
  }
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <UserQuizStats />
    </main>
  );
}