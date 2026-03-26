import { getAdminDashboardPayload } from "@backend/admin-dashboard/get-admin-dashboard-payload";
import { AdminDashboardPageContent } from "@frontend/admin/components/admin-dashboard-page-content";

import { requireAdminUser } from "@/lib/admin";

export default async function AdminPage() {
  await requireAdminUser();

  const payload = await getAdminDashboardPayload();

  return <AdminDashboardPageContent payload={payload} />;
}
