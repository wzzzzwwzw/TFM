import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

const AdminPage = async () => {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "1";
  if (!isAdmin) {
    redirect("/admin/login");
  }
  return <AdminDashboardClient />;
};

export default AdminPage;