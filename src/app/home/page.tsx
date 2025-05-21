import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home/HomeClient";

export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }
  return <HomeClient />;
}