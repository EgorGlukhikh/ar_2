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

const navItems = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Курсы", icon: BookOpen },
  { href: "/admin/students", label: "Студенты", icon: Users },
  { href: "/admin/homework", label: "Домашки", icon: ClipboardCheck },
  { href: "/admin/emails", label: "Письма", icon: Mail },
  { href: "/admin/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/admin/team", label: "Команда", icon: Settings2 },
] as const;

type AdminNavProps = {
  effectiveRole: UserRole;
};

export function AdminNav({ effectiveRole }: AdminNavProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => {
    if (effectiveRole === USER_ROLES.AUTHOR) {
      return item.href === "/admin/courses";
    }

    if (effectiveRole === USER_ROLES.CURATOR) {
      return ["/admin/students", "/admin/homework", "/admin/analytics"].includes(
        item.href,
      );
    }

    if (effectiveRole === USER_ROLES.SALES_MANAGER) {
      return ["/admin/students", "/admin/emails", "/admin/analytics"].includes(
        item.href,
      );
    }

    return true;
  });

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
