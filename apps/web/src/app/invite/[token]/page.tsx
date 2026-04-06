import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, UserPlus2 } from "lucide-react";

import { USER_ROLES } from "@academy/shared";

import { acceptWorkspaceInvite, getWorkspaceInviteByToken } from "@/features/admin/invite-actions";
import { AcademyMark } from "@/components/brand/academy-mark";
import {
  publicActionRowClassName,
  publicGradientCardClassName,
  publicInsetCardClassName,
  publicSoftInsetCardClassName,
} from "@/components/marketing/public-primitives";
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
  [USER_ROLES.AUTHOR]: "РђРІС‚РѕСЂ",
  [USER_ROLES.CURATOR]: "РљСѓСЂР°С‚РѕСЂ",
  [USER_ROLES.SALES_MANAGER]: "РџСЂРѕРґР°Р¶Рё",
  [USER_ROLES.ADMIN]: "РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ",
  [USER_ROLES.STUDENT]: "РЎС‚СѓРґРµРЅС‚",
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
    <div className={`${publicInsetCardClassName} rounded-[var(--radius-xl)] p-6`}>
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
      <div className={`mt-6 ${publicActionRowClassName}`}>
        <Button asChild>
          <Link href="/sign-in">РџРµСЂРµР№С‚Рё РєРѕ РІС…РѕРґСѓ</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">РќР° РіР»Р°РІРЅСѓСЋ</Link>
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
            <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2442] text-white">
                  <AcademyMark className="w-7" title="РђРєР°РґРµРјРёСЏ СЂРёСЌР»С‚РѕСЂРѕРІ" />
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold text-[#1c2442]">
                    РђРєР°РґРµРјРёСЏ СЂРёСЌР»С‚РѕСЂРѕРІ
                  </p>
                  <p className="text-sm leading-6 text-[#667087]">
                    РџСЂРёРіР»Р°С€РµРЅРёРµ РІ СЂР°Р±РѕС‡РёР№ РєРѕРЅС‚СѓСЂ РєРѕРјР°РЅРґС‹.
                  </p>
                </div>
              </div>

              <div className={publicActionRowClassName}>
                <Button asChild size="sm" variant="outline">
                  <Link href="/sign-in">Р’С…РѕРґ</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/catalog">РљР°С‚Р°Р»РѕРі</Link>
                </Button>
              </div>
            </header>

            <div className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-5">
                <div className={`${publicGradientCardClassName} rounded-[32px] md:p-8`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/60">
                    РџСЂРёРіР»Р°С€РµРЅРёРµ
                  </p>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                    Р’РѕР№С‚Рё РІ РєРѕРјР°РЅРґСѓ РїР»Р°С‚С„РѕСЂРјС‹.
                  </h1>
                  <p className="mt-4 text-sm leading-7 text-white/80">
                    РЎСЃС‹Р»РєР° РІРµРґРµС‚ РІ СЂРµР°Р»СЊРЅС‹Р№ СЂР°Р±РѕС‡РёР№ РєРѕРЅС‚СѓСЂ. РџРѕСЃР»Рµ Р°РєС‚РёРІР°С†РёРё С‚С‹ СЃРјРѕР¶РµС€СЊ РІРѕР№С‚Рё
                    РїРѕ РїРѕС‡С‚Рµ Рё РїР°СЂРѕР»СЋ Рё РїРѕРїР°СЃС‚СЊ СЃСЂР°Р·Сѓ РІ СЃРІРѕР№ РєР°Р±РёРЅРµС‚ РїРѕ СЂРѕР»Рё.
                  </p>
                  <div className="mt-6 space-y-3">
                    {[
                      "РћРґРЅРѕ РїСЂРёРіР»Р°С€РµРЅРёРµ вЂ” РѕРґРЅР° СЂРѕР»СЊ Рё РѕРґРёРЅ СЂР°Р±РѕС‡РёР№ РјР°СЂС€СЂСѓС‚.",
                      "РџРѕСЃР»Рµ Р°РєС‚РёРІР°С†РёРё РІС…РѕРґ РёРґРµС‚ С‡РµСЂРµР· РѕР±С‹С‡РЅСѓСЋ С„РѕСЂРјСѓ Р»РѕРіРёРЅР°.",
                      "Р•СЃР»Рё РїСЂРёРіР»Р°С€РµРЅРёРµ РїСЂРѕСЃСЂРѕС‡РµРЅРѕ, Р°РґРјРёРЅ СЃРјРѕР¶РµС‚ РІС‹РїСѓСЃС‚РёС‚СЊ РЅРѕРІРѕРµ.",
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

              <aside className={`${publicInsetCardClassName} rounded-[var(--radius-xl)] p-5 md:p-6`}>
                {isMissing ? (
                  <InviteStateCard
                    title="РџСЂРёРіР»Р°С€РµРЅРёРµ РЅРµ РЅР°Р№РґРµРЅРѕ"
                    description="РЎСЃС‹Р»РєР° Р±РѕР»СЊС€Рµ РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚ РёР»Рё Р±С‹Р»Р° СЃРѕР·РґР°РЅР° СЃ РѕС€РёР±РєРѕР№. РџРѕРїСЂРѕСЃРё РєРѕРјР°РЅРґСѓ РІС‹РґР°С‚СЊ РЅРѕРІРѕРµ РїСЂРёРіР»Р°С€РµРЅРёРµ."
                  />
                ) : isRevoked ? (
                  <InviteStateCard
                    title="РџСЂРёРіР»Р°С€РµРЅРёРµ РѕС‚РѕР·РІР°РЅРѕ"
                    description="РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ СѓР¶Рµ РѕС‚РєР»СЋС‡РёР» СЌС‚Рѕ РїСЂРёРіР»Р°С€РµРЅРёРµ. Р•СЃР»Рё РґРѕСЃС‚СѓРї РІСЃРµ РµС‰Рµ РЅСѓР¶РµРЅ, РїРѕРїСЂРѕСЃРё РІС‹РґР°С‚СЊ РЅРѕРІРѕРµ."
                  />
                ) : isAccepted ? (
                  <InviteStateCard
                    title="РџСЂРёРіР»Р°С€РµРЅРёРµ СѓР¶Рµ Р°РєС‚РёРІРёСЂРѕРІР°РЅРѕ"
                    description="Р­С‚Р° СЃСЃС‹Р»РєР° СѓР¶Рµ РёСЃРїРѕР»СЊР·РѕРІР°РЅР°. РњРѕР¶РЅРѕ РїСЂРѕСЃС‚Рѕ РІРѕР№С‚Рё РІ РїР»Р°С‚С„РѕСЂРјСѓ РїРѕ СЃРІРѕРµР№ РїРѕС‡С‚Рµ Рё РїР°СЂРѕР»СЋ."
                  />
                ) : isExpired ? (
                  <InviteStateCard
                    title="РџСЂРёРіР»Р°С€РµРЅРёРµ РїСЂРѕСЃСЂРѕС‡РµРЅРѕ"
                    description="РЎСЂРѕРє РґРµР№СЃС‚РІРёСЏ СЃСЃС‹Р»РєРё-РїСЂРёРіР»Р°С€РµРЅРёСЏ РёСЃС‚РµРє. РџРѕРїСЂРѕСЃРё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР° РІС‹РїСѓСЃС‚РёС‚СЊ РЅРѕРІРѕРµ РїСЂРёРіР»Р°С€РµРЅРёРµ."
                  />
                ) : (
                  <div className={`${publicSoftInsetCardClassName} rounded-[var(--radius-xl)] p-6`}>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7b8296]">
                        РђРєС‚РёРІР°С†РёСЏ РґРѕСЃС‚СѓРїР°
                      </p>
                      <h2 className="font-[family:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-[#1c2442]">
                        РџРѕРґС‚РІРµСЂРґРё РїСЂРёРіР»Р°С€РµРЅРёРµ
                      </h2>
                      <p className="text-sm leading-7 text-[#596177]">
                        РџРѕСЃР»Рµ Р°РєС‚РёРІР°С†РёРё СЌС‚Р° РїРѕС‡С‚Р° РїРѕР»СѓС‡РёС‚ СЂР°Р±РѕС‡СѓСЋ СЂРѕР»СЊ Рё СЃРјРѕР¶РµС‚ РІС…РѕРґРёС‚СЊ РІ СЃРІРѕР№
                        РєРѕРЅС‚СѓСЂ РїР»Р°С‚С„РѕСЂРјС‹.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className={`${publicInsetCardClassName} p-5`}>
                        <div className="inline-flex rounded-2xl bg-[#eef2ff] p-3">
                          <Mail className="h-5 w-5 text-[#2840db]" />
                        </div>
                        <p className="mt-4 text-sm text-[#697088]">РџРѕС‡С‚Р°</p>
                        <p className="mt-2 text-lg font-semibold text-[#1c2442]">{invite.email}</p>
                      </div>

                      <div className={`${publicInsetCardClassName} p-5`}>
                        <div className="inline-flex rounded-2xl bg-[#eef2ff] p-3">
                          <ShieldCheck className="h-5 w-5 text-[#2840db]" />
                        </div>
                        <p className="mt-4 text-sm text-[#697088]">Р РѕР»СЊ</p>
                        <p className="mt-2 text-lg font-semibold text-[#1c2442]">
                          {roleLabelMap[invite.role]}
                        </p>
                      </div>
                    </div>

                    <form action={acceptWorkspaceInvite} className="mt-6 space-y-5">
                      <input type="hidden" name="token" value={invite.token} />

                      <div className="space-y-2">
                        <Label htmlFor="invite-name">РРјСЏ</Label>
                        <Input
                          id="invite-name"
                          name="name"
                          placeholder="РќР°РїСЂРёРјРµСЂ, РђРЅРЅР° РРІР°РЅРѕРІР°"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invite-password">РџР°СЂРѕР»СЊ</Label>
                        <Input
                          id="invite-password"
                          name="password"
                          type="password"
                          placeholder="РњРёРЅРёРјСѓРј 5 СЃРёРјРІРѕР»РѕРІ"
                          required
                        />
                      </div>

                      {invite.note ? (
                        <div className={`${publicInsetCardClassName} p-4 text-sm leading-7 text-[var(--muted)]`}>
                          <p className="font-medium text-[var(--foreground)]">
                            РљРѕРјРјРµРЅС‚Р°СЂРёР№ Рє РїСЂРёРіР»Р°С€РµРЅРёСЋ
                          </p>
                          <p className="mt-2 whitespace-pre-wrap">{invite.note}</p>
                        </div>
                      ) : null}

                      <Button type="submit" size="lg" className="w-full">
                        РђРєС‚РёРІРёСЂРѕРІР°С‚СЊ РґРѕСЃС‚СѓРї
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>

                    <div
                      className={`mt-6 ${publicInsetCardClassName} p-4 text-sm leading-7 text-[var(--muted)]`}
                    >
                      <div className="flex items-start gap-3">
                        <UserPlus2 className="mt-1 h-4 w-4 text-[#2840db]" />
                        <p>
                          РџСЂРёРіР»Р°С€РµРЅРёРµ РІС‹РґР°РЅРѕ РѕС‚ РёРјРµРЅРё{" "}
                          <span className="font-medium text-[var(--foreground)]">
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
