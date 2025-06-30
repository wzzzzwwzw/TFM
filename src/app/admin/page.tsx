import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { getAuthSession } from "@/lib/nextauth";

const AdminPage = async () => {
  const session = await getAuthSession();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }
  return <AdminDashboardClient />;
};

export default AdminPage;
