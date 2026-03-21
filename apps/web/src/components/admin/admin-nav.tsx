"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/courses", label: "Курсы" },
  { href: "/admin/students", label: "Студенты" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-medium transition",
              isActive
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
