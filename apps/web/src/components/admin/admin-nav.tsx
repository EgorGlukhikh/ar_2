"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Mail,
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
] as const;

type AdminNavProps = {
  effectiveRole: UserRole;
};

export function AdminNav({ effectiveRole }: AdminNavProps) {
  const pathname = usePathname();
  const visibleItems =
    effectiveRole === USER_ROLES.AUTHOR
      ? navItems.filter((item) => item.href === "/admin/courses")
      : navItems;

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
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-[#2840db] text-white shadow-[0_14px_28px_rgba(40,64,219,0.2)]"
                : "border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
