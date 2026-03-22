import { Eye, Shield, UserRound, PenSquare } from "lucide-react";

import { USER_ROLES, type UserRole } from "@academy/shared";

import { updateRolePreview } from "@/features/preview/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RolePreviewSwitcherProps = {
  actualRole: UserRole;
  effectiveRole: UserRole;
  previewRole: UserRole | null;
};

const roleMeta = {
  [USER_ROLES.ADMIN]: {
    label: "Админ",
    icon: Shield,
    returnTo: "/admin",
  },
  [USER_ROLES.AUTHOR]: {
    label: "Автор",
    icon: PenSquare,
    returnTo: "/admin/courses",
  },
  [USER_ROLES.STUDENT]: {
    label: "Студент",
    icon: UserRound,
    returnTo: "/learning",
  },
} satisfies Record<
  Extract<UserRole, "ADMIN" | "AUTHOR" | "STUDENT">,
  {
    label: string;
    icon: typeof Shield;
    returnTo: string;
  }
>;

export function RolePreviewSwitcher({
  actualRole,
  effectiveRole,
  previewRole,
}: RolePreviewSwitcherProps) {
  if (actualRole !== USER_ROLES.ADMIN) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">
          <Eye className="mr-2 h-3.5 w-3.5" />
          Просмотр ролей
        </Badge>
        <span className="text-sm text-[var(--muted)]">
          Сейчас:{" "}
          <span className="font-medium text-[var(--foreground)]">
            {roleMeta[effectiveRole as keyof typeof roleMeta]?.label ?? effectiveRole}
          </span>
          {previewRole ? ` · preview` : ""}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.entries(roleMeta) as Array<
          [Extract<UserRole, "ADMIN" | "AUTHOR" | "STUDENT">, (typeof roleMeta)[keyof typeof roleMeta]]
        >).map(([role, meta]) => {
          const Icon = meta.icon;
          const isActive = effectiveRole === role;

          return (
            <form key={role} action={updateRolePreview}>
              <input type="hidden" name="role" value={role} />
              <input type="hidden" name="returnTo" value={meta.returnTo} />
              <Button type="submit" variant={isActive ? "default" : "outline"} size="sm">
                <Icon className="mr-2 h-4 w-4" />
                {meta.label}
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

