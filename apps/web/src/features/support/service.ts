import { auth } from "@academy/auth";
import { prisma, type Prisma } from "@academy/db";
import { composeFullName, USER_ROLES } from "@academy/shared";

export type SupportFormPrefill = {
  isAuthenticated: boolean;
  name: string;
  email: string;
  phone: string;
  roleLabel: string;
};

function getRoleLabel(role?: string | null) {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "Администратор";
    case USER_ROLES.AUTHOR:
      return "Преподаватель";
    case USER_ROLES.CURATOR:
      return "Куратор";
    case USER_ROLES.SALES_MANAGER:
      return "Менеджер";
    case USER_ROLES.STUDENT:
      return "Студент";
    default:
      return "Гость";
  }
}

export async function getSupportFormPrefill(): Promise<SupportFormPrefill> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      isAuthenticated: false,
      name: "",
      email: "",
      phone: "",
      roleLabel: "Гость",
    };
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    } as Prisma.UserSelect,
  });

  return {
    isAuthenticated: true,
    name:
      composeFullName(profile?.firstName, profile?.lastName) ??
      profile?.name ??
      session.user.name ??
      "",
    email: profile?.email ?? session.user.email ?? "",
    phone: profile?.phone ?? session.user.phone ?? "",
    roleLabel: getRoleLabel(profile?.role ?? session.user.role),
  };
}
