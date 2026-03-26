import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-12 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] px-6 py-6 shadow-[var(--shadow-sm)] backdrop-blur md:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Академия риэлторов
          </p>
          <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
            Платформа обучения по недвижимости для студентов, преподавателей и команды академии.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--foreground)]">
            Главная
          </Link>
          <Link href="/catalog" className="transition hover:text-[var(--foreground)]">
            Каталог
          </Link>
          <Link href="/sign-in" className="transition hover:text-[var(--foreground)]">
            Вход
          </Link>
        </nav>
      </div>
    </footer>
  );
}
