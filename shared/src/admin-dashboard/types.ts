export type AdminDashboardStat = {
  label: string;
  value: string;
  hint: string;
};

export type AdminDashboardRoleShare = {
  label: string;
  value: number;
};

export type AdminDashboardPaymentPoint = {
  label: string;
  amount: number;
};

export type AdminDashboardRecentOrder = {
  id: string;
  createdAtLabel: string;
  studentName: string;
  courseTitle: string;
  amountLabel: string;
  statusLabel: string;
};

export type AdminDashboardRecentUser = {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  createdAtLabel: string;
};

export type AdminDashboardPayload = {
  stats: AdminDashboardStat[];
  roleShare: AdminDashboardRoleShare[];
  demoRevenueSeries: AdminDashboardPaymentPoint[];
  recentOrders: AdminDashboardRecentOrder[];
  recentUsers: AdminDashboardRecentUser[];
};
