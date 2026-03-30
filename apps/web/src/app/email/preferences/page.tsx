import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateEmailPreferenceByTokenAction } from "@/features/email/actions";
import { getEmailPreferenceByToken } from "@/features/email/service";

type EmailPreferencesPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function EmailPreferencesPage({
  searchParams,
}: EmailPreferencesPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/sign-in");
  }

  const preference = await getEmailPreferenceByToken(token);

  if (!preference) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-[720px] items-center px-6 py-16">
        <div className="w-full rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Настройки писем
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Ссылка больше не действует
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Похоже, ссылка на управление письмами устарела или была изменена.
            Если у вас есть аккаунт на платформе, вы всегда можете открыть
            настройки внутри профиля.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/sign-in">Перейти на платформу</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[720px] items-center px-6 py-16">
      <div className="w-full rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-lg)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Настройки писем
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          Управление получением писем
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Здесь можно включить или отключить новости платформы, анонсы курсов,
          приглашения на вебинары и подборки. Сервисные письма о доступе,
          оплате и безопасности аккаунта продолжают приходить всегда.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4">
            <p className="text-sm text-[var(--muted)]">Аккаунт</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              {preference.user.name || preference.user.email}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{preference.user.email}</p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <p className="text-sm text-[var(--muted)]">Сервисные письма</p>
            <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
              Доступ к курсам, оплата, вход в аккаунт и важные уведомления по
              безопасности остаются включенными всегда.
            </p>
          </div>
        </div>

        <form action={updateEmailPreferenceByTokenAction} className="mt-6 space-y-6">
          <input type="hidden" name="preferenceToken" value={preference.preferenceToken} />

          <label className="flex items-start gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <input
              type="checkbox"
              name="marketingEnabled"
              defaultChecked={preference.isMarketingEnabled}
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--primary)] focus:ring-[var(--focus)]"
            />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Новости платформы, новые курсы, подборки и приглашения
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Оставьте галочку, если хотите получать анонсы новых программ,
                приглашения на вебинары и полезные письма от команды Академии
                риэлторов.
              </p>
            </div>
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Сохранить настройки</Button>
            <Button asChild variant="outline">
              <Link href="/sign-in">Открыть платформу</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
