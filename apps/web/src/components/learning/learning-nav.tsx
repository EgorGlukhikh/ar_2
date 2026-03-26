"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [{ href: "/learning", label: "Мои курсы" }];

export function LearningNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-[var(--control-height)] items-center gap-2 rounded-[var(--control-radius)] px-4 py-3 text-sm font-semibold transition [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-current",
              isActive
                ? "border border-transparent bg-[var(--primary)] !text-[var(--primary-foreground)] shadow-[var(--shadow-brand)] hover:!text-[var(--primary-foreground)] [&_svg]:!text-[var(--primary-foreground)]"
                : "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-sm)] hover:border-[var(--primary)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
