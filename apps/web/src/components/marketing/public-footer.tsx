import Link from "next/link";

import { AcademyMark } from "@/components/brand/academy-mark";
import { PageContainer } from "@/components/layout/page-grid";

export function PublicFooter() {
  return (
    <footer className="bg-[var(--foreground)]">
      <PageContainer className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white/10 text-white">
                <AcademyMark className="w-5" title="Академия риэлторов" />
              </div>
              <p className="text-sm font-semibold text-white">Академия риэлторов</p>
            </div>
            <p className="max-w-[320px] text-sm leading-7 text-white/44">
              Платформа обучения по недвижимости для студентов, преподавателей и
              команды академии.
            </p>
          </div>

          <nav className="flex flex-wrap items-start gap-6 text-sm">
            <Link href="/" className="text-white/44 transition-colors hover:text-white">
              Главная
            </Link>
            <Link href="/catalog" className="text-white/44 transition-colors hover:text-white">
              Каталог
            </Link>
            <Link href="/sign-in" className="text-white/44 transition-colors hover:text-white">
              Вход
            </Link>
            <Link href="/support" className="text-white/44 transition-colors hover:text-white">
              Поддержка
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs text-white/28">© 2024 Академия риэлторов</p>
        </div>
      </PageContainer>
    </footer>
  );
}
