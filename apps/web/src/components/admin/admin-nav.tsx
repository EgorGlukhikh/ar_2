"use client";

import Link from "next/link";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Mail,
  Settings2,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { USER_ROLES, type UserRole } from "@academy/shared";

import { systemNavItemClassName } from "@/components/system/system-ui";
import { cn } from "@/lib/utils";
import {
  canViewAnalyticsWorkspace,
  canViewCourseWorkspace,
  canViewEmailWorkspace,
  canViewHomeworkWorkspace,
  canViewStudentWorkspace,
  canViewTeamWorkspace,
  canViewUserWorkspace,
  canViewWorkspaceOverview,
} from "@/lib/workspace-role";

const navItems = [
  {
    href: "/admin",
    label: "Панель",
    icon: LayoutDashboard,
    isVisible: canViewWorkspaceOverview,
  },
  {
    href: "/admin/courses",
    label: "Курсы",
    icon: BookOpen,
    isVisible: canViewCourseWorkspace,
  },
  {
    href: "/admin/knowledge-base",
    label: "База знаний",
    icon: BookMarked,
    isVisible: canViewCourseWorkspace,
  },
  {
    href: "/admin/users",
    label: "Пользователи",
    icon: Users,
    isVisible: canViewUserWorkspace,
  },
  {
    href: "/admin/students",
    label: "Студенты",
    icon: Users,
    isVisible: (role: UserRole) =>
      canViewStudentWorkspace(role) && !canViewUserWorkspace(role),
  },
  {
    href: "/admin/homework",
    label: "Домашние",
    icon: ClipboardCheck,
    isVisible: canViewHomeworkWorkspace,
  },
  {
    href: "/admin/emails",
    label: "Письма",
    icon: Mail,
    isVisible: canViewEmailWorkspace,
  },
  {
    href: "/admin/analytics",
    label: "Аналитика",
    icon: BarChart3,
    isVisible: canViewAnalyticsWorkspace,
  },
  {
    href: "/admin/team",
    label: "Команда",
    icon: Settings2,
    isVisible: canViewTeamWorkspace,
  },
] as const;

type AdminNavProps = {
  effectiveRole: UserRole;
};

export function AdminNav({ effectiveRole }: AdminNavProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => item.isVisible(effectiveRole));

  if (effectiveRole === USER_ROLES.STUDENT || visibleItems.length === 0) {
    return null;
  }

  return (
    <nav className="flex max-w-full items-center gap-2 self-start overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              systemNavItemClassName(isActive),
              "px-5 font-semibold leading-none",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
