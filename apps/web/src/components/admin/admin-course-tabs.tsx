"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CreditCard, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminCourseTabsProps = {
  courseId: string;
};

const getCourseTabItems = (courseId: string) => [
  {
    href: `/admin/courses/${courseId}`,
    label: "О курсе",
    exact: true,
    icon: Settings2,
  },
  {
    href: `/admin/courses/${courseId}/content`,
    label: "Программа",
    icon: BookOpen,
  },
  {
    href: `/admin/courses/${courseId}/access`,
    label: "Доступ и продажи",
    icon: CreditCard,
  },
];

export function AdminCourseTabs({ courseId }: AdminCourseTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
      {getCourseTabItems(courseId).map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              isActive
                ? "bg-[var(--primary)] text-white"
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
