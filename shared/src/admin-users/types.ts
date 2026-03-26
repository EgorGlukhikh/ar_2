export type AdminUsersFilters = {
  query: string;
  role: string;
  access: string;
  authSource: string;
};

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  authSourceLabel: string;
  enrollmentCount: number;
  progressCount: number;
  createdAtLabel: string;
  latestCourses: string[];
};

export type AdminUsersPayload = {
  totalUsers: number;
  filteredUsers: number;
  filters: AdminUsersFilters;
  roleOptions: Array<{ value: string; label: string }>;
  users: AdminUserListItem[];
};
