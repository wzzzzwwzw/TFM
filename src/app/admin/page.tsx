import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

const AdminPage = async () => {
  const session = await getAuthSession();
  if (!session?.user || !session.user.isAdmin) {
    redirect("/");
  }
  return <AdminDashboardClient />;
};

export default AdminPage;