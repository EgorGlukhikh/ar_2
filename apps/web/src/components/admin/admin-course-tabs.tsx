"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CreditCard, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminCourseTabsProps = {
  courseId: string;
  showAccessTab?: boolean;
};

const getCourseTabItems = (courseId: string, showAccessTab: boolean) => [
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
  ...(showAccessTab
    ? [
        {
          href: `/admin/courses/${courseId}/access`,
          label: "Доступ и продажи",
          icon: CreditCard,
        },
      ]
    : []),
];

export function AdminCourseTabs({
  courseId,
  showAccessTab = true,
}: AdminCourseTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
      {getCourseTabItems(courseId, showAccessTab).map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-[var(--control-height-sm)] items-center gap-2 rounded-[var(--control-radius)] px-4 py-2 text-sm font-semibold transition [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-current",
              isActive
                ? "border border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-brand)] hover:text-[var(--primary-foreground)]"
                : "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-sm)] hover:border-[var(--primary)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]",
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
