import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
const ADMIN_EMAIL = "waelwzwz@gmail.com"; 

const AdminPage = async () => {
  const session = await getAuthSession();
  if (!session?.user || session.user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  return <AdminDashboardClient />;
};

export default AdminPage;