import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateEmailPreferenceByTokenAction } from "@/features/email/actions";
import { getEmailPreferenceByToken } from "@/features/email/service";

type EmailPreferencesPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

function EmailPreferenceShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[840px] items-center px-6 py-16">
      <Card as="article" className="w-full">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <CardTitle className="mt-1">{title}</CardTitle>
          <CardDescription className="mt-2 max-w-3xl">{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-2">{children}</CardContent>
      </Card>
    </section>
  );
}

function InfoTile({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <Card variant={strong ? "strong" : "default"} padding="md">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-3 text-sm leading-7 text-[var(--foreground)]">{children}</div>
    </Card>
  );
}

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
      <EmailPreferenceShell
        eyebrow="Настройки писем"
        title="Ссылка больше не действует"
        description="Похоже, ссылка на управление письмами устарела или была изменена. Если у вас есть аккаунт на платформе, настройки всегда можно открыть внутри профиля."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/sign-in">Перейти на платформу</Link>
          </Button>
        </div>
      </EmailPreferenceShell>
    );
  }

  return (
    <EmailPreferenceShell
      eyebrow="Настройки писем"
      title="Управление получением писем"
      description="Здесь можно включить или отключить новости платформы, анонсы курсов, приглашения на вебинары и подборки. Сервисные письма о доступе, оплате и безопасности аккаунта приходят всегда."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <InfoTile label="Аккаунт" strong>
          <p className="font-semibold text-[var(--foreground)]">
            {preference.user.name || preference.user.email}
          </p>
          <p className="text-[var(--muted)]">{preference.user.email}</p>
        </InfoTile>

        <InfoTile label="Сервисные письма">
          Доступ к курсам, оплата, вход в аккаунт и важные уведомления по безопасности
          остаются включёнными всегда.
        </InfoTile>
      </div>

      <form action={updateEmailPreferenceByTokenAction} className="mt-6 space-y-6">
        <input type="hidden" name="preferenceToken" value={preference.preferenceToken} />

        <Card variant="strong" padding="md">
          <label className="flex items-start gap-3">
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
                приглашения на вебинары и полезные письма от команды Академии риэлторов.
              </p>
            </div>
          </label>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Сохранить настройки</Button>
          <Button asChild variant="outline">
            <Link href="/sign-in">Открыть платформу</Link>
          </Button>
        </div>
      </form>
    </EmailPreferenceShell>
  );
}
