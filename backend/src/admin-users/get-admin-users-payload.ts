import type { AdminUsersPayload } from "@shared/admin-users/types";

import { getAdminUsersSnapshot } from "@database/admin-users/admin-users.repository";

export async function getAdminUsersPayload(input: {
  query?: string;
  role?: string;
  access?: string;
  authSource?: string;
}): Promise<AdminUsersPayload> {
  const snapshot = await getAdminUsersSnapshot(input);

  return {
    totalUsers: snapshot.totalUsers,
    filteredUsers: snapshot.filteredUsers,
    filters: {
      query: input.query ?? "",
      role: input.role ?? "all",
      access: input.access ?? "all",
      authSource: input.authSource ?? "all",
    },
    roleOptions: snapshot.roleOptions.map((item) => ({ ...item })),
    users: snapshot.users,
  };
}
