import { auth } from "@academy/auth";
import { ELEVATED_ROLES, USER_ROLES, type UserRole } from "@academy/shared";
import { redirect } from "next/navigation";

type WorkspaceUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
};

function isUserRole(value: string | undefined | null): value is UserRole {
  return Boolean(value && Object.values(USER_ROLES).includes(value as UserRole));
}

export function canEditCourseContent(user: WorkspaceUser, authorId?: string | null) {
  return user.role === USER_ROLES.ADMIN || (user.role === USER_ROLES.AUTHOR && authorId === user.id);
}

export function canManageHomework(user: WorkspaceUser) {
  return user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.CURATOR;
}

export function canManageStudents(user: WorkspaceUser) {
  return user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.CURATOR;
}

export function getWorkspaceHomePath(role: UserRole) {
  if (role === USER_ROLES.ADMIN) {
    return "/admin";
  }

  if (role === USER_ROLES.AUTHOR) {
    return "/admin/courses";
  }

  if (role === USER_ROLES.CURATOR) {
    return "/admin/homework";
  }

  if (role === USER_ROLES.SALES_MANAGER) {
    return "/admin/emails";
  }

  return "/learning";
}

export async function requireWorkspaceUser() {
  const session = await auth();

  if (!session?.user || !isUserRole(session.user.role)) {
    redirect("/sign-in");
  }

  if (!ELEVATED_ROLES.includes(session.user.role)) {
    redirect("/");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  } satisfies WorkspaceUser;
}

export async function requireRoleAccess(allowedRoles: UserRole[]) {
  const user = await requireWorkspaceUser();

  if (!allowedRoles.includes(user.role)) {
    redirect(getWorkspaceHomePath(user.role));
  }

  return user;
}

export async function requireAdminUser() {
  return requireRoleAccess([USER_ROLES.ADMIN]);
}
