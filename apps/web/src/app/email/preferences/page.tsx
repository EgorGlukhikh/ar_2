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
            Похоже, ссылка на управление подпиской устарела или была изменена. Если у вас есть
            аккаунт на платформе, вы всегда можете открыть настройки внутри профиля.
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
          Управление подпиской
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Здесь можно включить или выключить маркетинговые письма Академии риэлторов. Сервисные
          письма о доступе, оплате и безопасности аккаунта продолжают приходить всегда.
        </p>

        <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4">
          <p className="text-sm text-[var(--muted)]">Аккаунт</p>
          <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            {preference.user.name || preference.user.email}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{preference.user.email}</p>
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
                Получать письма о новых курсах, наборах, полезных сценариях платформы и
                приглашениях для экспертов
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Вы можете в любой момент вернуться на эту страницу и изменить выбор.
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
