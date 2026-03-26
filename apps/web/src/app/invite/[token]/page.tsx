import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, UserPlus2 } from "lucide-react";

import { USER_ROLES } from "@academy/shared";

import { acceptWorkspaceInvite, getWorkspaceInviteByToken } from "@/features/admin/invite-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

const roleLabelMap = {
  [USER_ROLES.AUTHOR]: "Автор",
  [USER_ROLES.CURATOR]: "Куратор",
  [USER_ROLES.SALES_MANAGER]: "Продажи",
  [USER_ROLES.ADMIN]: "Администратор",
  [USER_ROLES.STUDENT]: "Студент",
} as const;

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

function InviteStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight text-[#1c2442]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#596177]">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/sign-in">Перейти ко входу</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </div>
  );
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invite = await getWorkspaceInviteByToken(token);

  const now = Date.now();
  const isMissing = !invite;
  const isRevoked = Boolean(invite?.revokedAt);
  const isAccepted = Boolean(invite?.acceptedAt);
  const isExpired = Boolean(invite && invite.expiresAt.getTime() < now);

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="flex flex-col gap-4 border-b border-black/5 pb-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2442] text-sm font-semibold text-white">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold text-[#1c2442]">
                    Академия риэлторов
                  </p>
                  <p className="text-sm leading-6 text-[#667087]">
                    Приглашение в рабочий контур команды.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/sign-in">Вход</Link>
                </Button>
                <Button asChild>
                  <Link href="/catalog">Каталог</Link>
                </Button>
              </div>
            </header>

            <div className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-5">
                <div className="rounded-[32px] bg-[linear-gradient(135deg,_#18213d_0%,_#3146b6_56%,_#ff8f6d_100%)] p-6 text-white shadow-[0_30px_90px_rgba(38,43,101,0.22)] md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/60">
                    Приглашение
                  </p>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                    Войти в команду платформы.
                  </h1>
                  <p className="mt-4 text-sm leading-7 text-white/80">
                    Ссылка ведет в реальный рабочий контур. После активации ты сможешь войти
                    по почте и паролю и попасть сразу в свой кабинет по роли.
                  </p>
                  <div className="mt-6 space-y-3">
                    {[
                      "Одно приглашение — одна роль и один рабочий маршрут.",
                      "После активации вход идет через обычную форму логина.",
                      "Если приглашение просрочено, админ сможет выпустить новое.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/8 p-4"
                      >
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#ffd6be]" />
                        <p className="text-sm leading-7 text-white/84">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="rounded-[32px] border border-black/5 bg-white p-5 shadow-[0_24px_80px_rgba(28,36,66,0.1)] md:p-6">
                {isMissing ? (
                  <InviteStateCard
                    title="Приглашение не найдено"
                    description="Ссылка больше не существует или была создана с ошибкой. Попроси команду выдать новое приглашение."
                  />
                ) : isRevoked ? (
                  <InviteStateCard
                    title="Приглашение отозвано"
                    description="Администратор уже отключил это приглашение. Если доступ все еще нужен, попроси выдать новое."
                  />
                ) : isAccepted ? (
                  <InviteStateCard
                    title="Приглашение уже активировано"
                    description="Эта ссылка уже использована. Можно просто войти в платформу по своей почте и паролю."
                  />
                ) : isExpired ? (
                  <InviteStateCard
                    title="Приглашение просрочено"
                    description="Срок действия ссылки-приглашения истек. Попроси администратора выпустить новое приглашение."
                  />
                ) : (
                  <div className="rounded-[28px] border border-black/5 bg-[linear-gradient(180deg,_#f6f8ff_0%,_#fffaf7_100%)] p-6">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7b8296]">
                        Активация доступа
                      </p>
                      <h2 className="font-[family:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-[#1c2442]">
                        Подтверди приглашение
                      </h2>
                      <p className="text-sm leading-7 text-[#596177]">
                        После активации эта почта получит рабочую роль и сможет входить в свой
                        контур платформы.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[var(--radius-xl)] border border-[#dfe5f7] bg-white p-5 shadow-sm">
                        <div className="inline-flex rounded-2xl bg-[#eef2ff] p-3">
                          <Mail className="h-5 w-5 text-[#2840db]" />
                        </div>
                        <p className="mt-4 text-sm text-[#697088]">Почта</p>
                        <p className="mt-2 text-lg font-semibold text-[#1c2442]">{invite.email}</p>
                      </div>

                      <div className="rounded-[var(--radius-xl)] border border-[#dfe5f7] bg-white p-5 shadow-sm">
                        <div className="inline-flex rounded-2xl bg-[#eef2ff] p-3">
                          <ShieldCheck className="h-5 w-5 text-[#2840db]" />
                        </div>
                        <p className="mt-4 text-sm text-[#697088]">Роль</p>
                        <p className="mt-2 text-lg font-semibold text-[#1c2442]">
                          {roleLabelMap[invite.role]}
                        </p>
                      </div>
                    </div>

                    <form action={acceptWorkspaceInvite} className="mt-6 space-y-5">
                      <input type="hidden" name="token" value={invite.token} />

                      <div className="space-y-2">
                        <Label htmlFor="invite-name">Имя</Label>
                        <Input
                          id="invite-name"
                          name="name"
                          placeholder="Например, Анна Иванова"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invite-password">Пароль</Label>
                        <Input
                          id="invite-password"
                          name="password"
                          type="password"
                          placeholder="Минимум 5 символов"
                          required
                        />
                      </div>

                      {invite.note ? (
                        <div className="rounded-[22px] border border-[#dfe5f7] bg-white p-4 text-sm leading-7 text-[#596177]">
                          <p className="font-medium text-[#1c2442]">Комментарий к приглашению</p>
                          <p className="mt-2 whitespace-pre-wrap">{invite.note}</p>
                        </div>
                      ) : null}

                      <Button type="submit" size="lg" className="w-full">
                        Активировать доступ
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>

                    <div className="mt-6 rounded-[22px] border border-[#dfe5f7] bg-white p-4 text-sm leading-7 text-[#596177]">
                      <div className="flex items-start gap-3">
                        <UserPlus2 className="mt-1 h-4 w-4 text-[#2840db]" />
                        <p>
                          Приглашение выдано от имени{" "}
                          <span className="font-medium text-[#1c2442]">
                            {invite.invitedBy.name || invite.invitedBy.email}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
