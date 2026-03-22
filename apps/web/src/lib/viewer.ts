import { auth } from "@academy/auth";
import { ELEVATED_ROLES, USER_ROLES, type UserRole } from "@academy/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ROLE_PREVIEW_COOKIE = "academy_role_preview";

const PREVIEWABLE_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR,
  USER_ROLES.STUDENT,
];

type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
};

export type ViewerContext = {
  user: SessionUser;
  actualRole: UserRole;
  effectiveRole: UserRole;
  previewRole: UserRole | null;
  isPreview: boolean;
};

function isUserRole(value: string | undefined | null): value is UserRole {
  return Boolean(value && Object.values(USER_ROLES).includes(value as UserRole));
}

export function canUseRolePreview(role: UserRole) {
  return role === USER_ROLES.ADMIN;
}

export async function getViewerContext(): Promise<ViewerContext | null> {
  const session = await auth();

  if (!session?.user || !isUserRole(session.user.role)) {
    return null;
  }

  const actualRole = session.user.role;
  const cookieStore = await cookies();
  const previewValue = cookieStore.get(ROLE_PREVIEW_COOKIE)?.value;
  const previewRole =
    canUseRolePreview(actualRole) && isUserRole(previewValue) && PREVIEWABLE_ROLES.includes(previewValue)
      ? previewValue
      : null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: actualRole,
    },
    actualRole,
    effectiveRole: previewRole ?? actualRole,
    previewRole,
    isPreview: Boolean(previewRole && previewRole !== actualRole),
  };
}

export async function requireAdminViewer() {
  const viewer = await getViewerContext();

  if (!viewer?.user) {
    redirect("/sign-in");
  }

  if (viewer.actualRole !== USER_ROLES.ADMIN) {
    redirect("/");
  }

  return viewer;
}

export async function requireLearningViewer() {
  const viewer = await getViewerContext();

  if (!viewer?.user) {
    redirect("/sign-in");
  }

  if (
    viewer.actualRole !== USER_ROLES.STUDENT &&
    !ELEVATED_ROLES.includes(viewer.actualRole)
  ) {
    redirect("/");
  }

  return viewer;
}
