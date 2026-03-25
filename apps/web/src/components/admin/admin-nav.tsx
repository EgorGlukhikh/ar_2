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
    <nav className="flex flex-wrap items-center gap-2 self-start">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold leading-none transition",
              isActive
                ? "border-transparent bg-[linear-gradient(135deg,_#2650d8_0%,_#4f6ff0_58%,_#7893ff_100%)] text-white shadow-[0_16px_32px_rgba(38,80,216,0.24)] [&_svg]:text-white"
                : "border-[var(--border)] bg-[rgba(255,255,255,0.92)] text-[var(--muted)] shadow-[0_10px_22px_rgba(24,32,54,0.05)] hover:border-[var(--primary)] hover:text-[var(--foreground)]",
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
