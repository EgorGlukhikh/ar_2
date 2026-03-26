import { getAdminUsersPayload } from "@backend/admin-users/get-admin-users-payload";
import { AdminUsersPageContent } from "@frontend/admin/components/admin-users-page-content";

import { requireAdminUser } from "@/lib/admin";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    query?: string;
    role?: string;
    access?: string;
    authSource?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireAdminUser();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const payload = await getAdminUsersPayload(resolvedSearchParams);

  return <AdminUsersPageContent payload={payload} />;
}
