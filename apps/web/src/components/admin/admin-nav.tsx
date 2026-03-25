"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Mail,
  Settings2,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { USER_ROLES, type UserRole } from "@academy/shared";

import { cn } from "@/lib/utils";
import {
  canViewAnalyticsWorkspace,
  canViewCourseWorkspace,
  canViewEmailWorkspace,
  canViewHomeworkWorkspace,
  canViewStudentWorkspace,
  canViewTeamWorkspace,
  canViewWorkspaceOverview,
} from "@/lib/workspace-role";

const navItems = [
  {
    href: "/admin",
    label: "Обзор",
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
    href: "/admin/students",
    label: "Студенты",
    icon: Users,
    isVisible: canViewStudentWorkspace,
  },
  {
    href: "/admin/homework",
    label: "Домашки",
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
    <nav className="flex flex-wrap items-center gap-2">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition",
              isActive
                ? "border-transparent bg-[#2840db] text-white shadow-[0_14px_28px_rgba(40,64,219,0.2)] [&_svg]:text-white"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)]",
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
