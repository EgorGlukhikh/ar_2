import Link from "next/link";
import { Briefcase, Link2, ShieldCheck, UserCog, Users2 } from "lucide-react";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { InviteLinkCopy } from "@/components/admin/invite-link-copy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  WorkspaceActionRow,
  WorkspaceEmptyState,
  WorkspaceNotice,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import {
  createWorkspaceInvite,
  revokeWorkspaceInvite,
} from "@/features/admin/invite-actions";
import { createWorkspaceMember } from "@/features/admin/user-actions";
import { requireAdminUser } from "@/lib/admin";
import { buildWorkspaceInviteUrl } from "@/lib/invites";
import { systemNavItemClassName } from "@/components/system/system-ui";

const roleLabelMap = {
  ADMIN: "РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ",
  AUTHOR: "РђРІС‚РѕСЂ",
  CURATOR: "РљСѓСЂР°С‚РѕСЂ",
  SALES_MANAGER: "РџСЂРѕРґР°Р¶Рё",
  STUDENT: "РЎС‚СѓРґРµРЅС‚",
} as const;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

type TeamPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

function formatDate(value?: Date | null) {
  if (!value) {
    return "вЂ”";
  }

  return dateFormatter.format(value);
}

function getInviteStatus(invite: {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}) {
  if (invite.revokedAt) {
    return { label: "РћС‚РѕР·РІР°РЅРѕ", variant: "warning" as const };
  }

  if (invite.acceptedAt) {
    return { label: "РђРєС‚РёРІРёСЂРѕРІР°РЅРѕ", variant: "success" as const };
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    return { label: "РСЃС‚РµРєР»Рѕ", variant: "warning" as const };
  }

  return { label: "РћР¶РёРґР°РµС‚ Р°РєС‚РёРІР°С†РёРё", variant: "neutral" as const };
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  await requireAdminUser();

  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const activeTab = resolvedSearchParams.tab === "invites" ? "invites" : "members";

  const [teamMembers, invites] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: {
          in: [USER_ROLES.ADMIN, USER_ROLES.AUTHOR, USER_ROLES.CURATOR, USER_ROLES.SALES_MANAGER],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            authored: true,
            reviewedHomeworkSubmissions: true,
          },
        },
      },
    }),
    prisma.workspaceInvite.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const authorCount = teamMembers.filter((user) => user.role === USER_ROLES.AUTHOR).length;
  const curatorCount = teamMembers.filter((user) => user.role === USER_ROLES.CURATOR).length;
  const pendingInvites = invites.filter(
    (invite) => !invite.acceptedAt && !invite.revokedAt && invite.expiresAt.getTime() >= Date.now(),
  ).length;

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="РљРѕРјР°РЅРґР° РїР»Р°С‚С„РѕСЂРјС‹"
        title="Р РѕР»Рё, РґРѕСЃС‚СѓРїС‹ Рё РїСЂРёРіР»Р°С€РµРЅРёСЏ"
        description="Р Р°Р·РґРµР»РµРЅ РЅР° РґРІР° СЂР°Р±РѕС‡РёС… РєРѕРЅС‚СѓСЂР°: РґРµР№СЃС‚РІСѓСЋС‰Р°СЏ РєРѕРјР°РЅРґР° Рё РїСЂРёРіР»Р°С€РµРЅРёСЏ. РўР°Рє РїСЂРѕС‰Рµ РѕС‚РґРµР»СЊРЅРѕ СѓРїСЂР°РІР»СЏС‚СЊ Р»СЋРґСЊРјРё РІ СЃРёСЃС‚РµРјРµ Рё РІСЃРµРјРё СЃС†РµРЅР°СЂРёСЏРјРё РїРѕРґРєР»СЋС‡РµРЅРёСЏ."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          label="РљРѕРјР°РЅРґР°"
          value={teamMembers.length}
          hint="Р’СЃРµ РІРЅСѓС‚СЂРµРЅРЅРёРµ СѓС‡Р°СЃС‚РЅРёРєРё РїР»Р°С‚С„РѕСЂРјС‹."
          icon={Users2}
        />
        <WorkspaceStatCard
          label="РђРІС‚РѕСЂС‹"
          value={authorCount}
          hint="РњРѕРіСѓС‚ СЂР°Р±РѕС‚Р°С‚СЊ СЃ Р·Р°РєСЂРµРїР»РµРЅРЅС‹РјРё РєСѓСЂСЃР°РјРё."
          icon={UserCog}
        />
        <WorkspaceStatCard
          label="РљСѓСЂР°С‚РѕСЂС‹"
          value={curatorCount}
          hint="РџСЂРѕРІРµСЂСЏСЋС‚ РґРѕРјР°С€РЅРёРµ Р·Р°РґР°РЅРёСЏ Рё СЃР»РµРґСЏС‚ Р·Р° СЃС‚СѓРґРµРЅС‚Р°РјРё."
          icon={ShieldCheck}
        />
        <WorkspaceStatCard
          label="РћС‚РєСЂС‹С‚С‹Рµ РїСЂРёРіР»Р°С€РµРЅРёСЏ"
          value={pendingInvites}
          hint="Р•С‰Рµ РЅРµ Р°РєС‚РёРІРёСЂРѕРІР°РЅРЅС‹Рµ СЃСЃС‹Р»РєРё Рё РґРѕСЃС‚СѓРїС‹."
          icon={Briefcase}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <WorkspacePanel
          eyebrow="РќР°РІРёРіР°С†РёСЏ"
          title="РљРѕРЅС‚СѓСЂ РєРѕРјР°РЅРґС‹"
          description="РЎР»РµРІР° РїРµСЂРµРєР»СЋС‡РµРЅРёРµ РјРµР¶РґСѓ РґРµР№СЃС‚РІСѓСЋС‰РёРјРё СѓС‡Р°СЃС‚РЅРёРєР°РјРё Рё РїСЂРёРіР»Р°С€РµРЅРёСЏРјРё."
          className="self-start"
        >
          <div className="space-y-2">
            <Link href="/admin/team" className={systemNavItemClassName(activeTab === "members")}>
              <span>Р”РµР№СЃС‚РІСѓСЋС‰РёРµ</span>
              <span className="text-xs">{teamMembers.length}</span>
            </Link>

            <Link
              href="/admin/team?tab=invites"
              className={systemNavItemClassName(activeTab === "invites")}
            >
              <span>РџСЂРёРіР»Р°С€РµРЅРёСЏ</span>
              <span className="text-xs">{invites.length}</span>
            </Link>
          </div>
        </WorkspacePanel>

        <div className="space-y-6">
          {activeTab === "members" ? (
            <WorkspacePanel
              eyebrow="Р”РµР№СЃС‚РІСѓСЋС‰Р°СЏ РєРѕРјР°РЅРґР°"
              title="РљС‚Рѕ СѓР¶Рµ СЂР°Р±РѕС‚Р°РµС‚ РІ СЃРёСЃС‚РµРјРµ"
              description="РЎРїРёСЃРѕРє РїРѕРєР°Р·С‹РІР°РµС‚ С‚РµРєСѓС‰РёС… Р°РІС‚РѕСЂРѕРІ, РєСѓСЂР°С‚РѕСЂРѕРІ, РїСЂРѕРґР°Р¶Рё Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂРѕРІ Р±РµР· СЃРјРµС€РёРІР°РЅРёСЏ СЃ С„РѕСЂРјР°РјРё РїСЂРёРіР»Р°С€РµРЅРёР№."
            >
              {teamMembers.length === 0 ? (
                <WorkspaceEmptyState
                  title="РџРѕРєР° РЅРµС‚ СѓС‡Р°СЃС‚РЅРёРєРѕРІ РєРѕРјР°РЅРґС‹"
                  description="РљР°Рє С‚РѕР»СЊРєРѕ РїРѕСЏРІРёС‚СЃСЏ Р°РІС‚РѕСЂ РёР»Рё РєСѓСЂР°С‚РѕСЂ, РѕРЅ РѕС‚РѕР±СЂР°Р·РёС‚СЃСЏ Р·РґРµСЃСЊ."
                  className="border-[var(--border)] bg-[var(--surface)] shadow-none"
                />
              ) : (
                <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]">
                  <div className="overflow-x-auto">
                    <div className="min-w-[920px]">
                      <div className="grid grid-cols-[minmax(220px,1.4fr)_160px_240px_140px_140px_160px] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        <span>РЈС‡Р°СЃС‚РЅРёРє</span>
                        <span>Р РѕР»СЊ</span>
                        <span>РџРѕС‡С‚Р°</span>
                        <span>РљСѓСЂСЃС‹</span>
                        <span>РџСЂРѕРІРµСЂРєРё</span>
                        <span>РЎРѕР·РґР°РЅ</span>
                      </div>

                      <div className="divide-y divide-[var(--border)]">
                        {teamMembers.map((member) => (
                          <article
                            key={member.id}
                            className="grid grid-cols-[minmax(220px,1.4fr)_160px_240px_140px_140px_160px] gap-4 px-5 py-4 transition-colors hover:bg-[var(--surface-strong)]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-[var(--foreground)]">
                                {member.name || member.email}
                              </p>
                              <p className="mt-1 text-sm text-[var(--muted)]">
                                РђРєРєР°СѓРЅС‚ РєРѕРјР°РЅРґС‹ РїР»Р°С‚С„РѕСЂРјС‹
                              </p>
                            </div>

                            <div className="pt-1">
                              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
                                {roleLabelMap[member.role]}
                              </span>
                            </div>

                            <div className="min-w-0 pt-1">
                              <p className="truncate text-sm text-[var(--foreground)]">{member.email}</p>
                            </div>

                            <div className="pt-1 text-sm text-[var(--foreground)]">
                              {member.role === USER_ROLES.AUTHOR ? member._count.authored : "вЂ”"}
                            </div>

                            <div className="pt-1 text-sm text-[var(--foreground)]">
                              {member.role === USER_ROLES.CURATOR
                                ? member._count.reviewedHomeworkSubmissions
                                : "вЂ”"}
                            </div>

                            <div className="pt-1 text-sm text-[var(--foreground)]">
                              {formatDate(member.createdAt)}
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </WorkspacePanel>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-2">
                <WorkspacePanel
                  eyebrow="РџСЂСЏРјРѕРµ СЃРѕР·РґР°РЅРёРµ"
                  title="Р—Р°РІРµСЃС‚Рё СѓС‡Р°СЃС‚РЅРёРєР° СЃСЂР°Р·Сѓ"
                  description="РСЃРїРѕР»СЊР·СѓР№ СЌС‚РѕС‚ СЃС†РµРЅР°СЂРёР№, РµСЃР»Рё РєРѕРјР°РЅРґР° СѓР¶Рµ СЃРѕРіР»Р°СЃРѕРІР°РЅР° Рё СѓС‡РµС‚РєСѓ РјРѕР¶РЅРѕ РІС‹РґР°С‚СЊ РІСЂСѓС‡РЅСѓСЋ."
                >
                  <form action={createWorkspaceMember} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">РРјСЏ</Label>
                      <Input id="team-name" name="name" placeholder="РђРЅРЅР° РРІР°РЅРѕРІР°" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-email">РџРѕС‡С‚Р°</Label>
                      <Input
                        id="team-email"
                        name="email"
                        type="email"
                        placeholder="author@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-password">РџР°СЂРѕР»СЊ</Label>
                      <Input
                        id="team-password"
                        name="password"
                        type="password"
                        placeholder="РњРёРЅРёРјСѓРј 5 СЃРёРјРІРѕР»РѕРІ"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-role">Р РѕР»СЊ</Label>
                      <Select id="team-role" name="role" defaultValue={USER_ROLES.AUTHOR}>
                        <option value={USER_ROLES.AUTHOR}>РђРІС‚РѕСЂ</option>
                        <option value={USER_ROLES.CURATOR}>РљСѓСЂР°С‚РѕСЂ</option>
                        <option value={USER_ROLES.SALES_MANAGER}>РџСЂРѕРґР°Р¶Рё</option>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full">
                      РЎРѕР·РґР°С‚СЊ СѓС‡Р°СЃС‚РЅРёРєР°
                    </Button>
                  </form>
                </WorkspacePanel>

                <WorkspacePanel
                  eyebrow="РџСЂРёРіР»Р°С€РµРЅРёСЏ"
                  title="Р’С‹РїСѓСЃС‚РёС‚СЊ СЃСЃС‹Р»РєСѓ-РїСЂРёРіР»Р°С€РµРЅРёРµ"
                  description="Р­С‚РѕС‚ СЃС†РµРЅР°СЂРёР№ СѓРґРѕР±РЅРµРµ, РєРѕРіРґР° С‡РµР»РѕРІРµРє РґРѕР»Р¶РµРЅ СЃР°Рј Р°РєС‚РёРІРёСЂРѕРІР°С‚СЊ РґРѕСЃС‚СѓРї, РїСЂРёРґСѓРјР°С‚СЊ РїР°СЂРѕР»СЊ Рё Р·Р°Р№С‚Рё РІ РїР»Р°С‚С„РѕСЂРјСѓ РїРѕ СЃСЃС‹Р»РєРµ."
                >
                  <form action={createWorkspaceInvite} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">РџРѕС‡С‚Р°</Label>
                      <Input
                        id="invite-email"
                        name="email"
                        type="email"
                        placeholder="curator@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Р РѕР»СЊ</Label>
                      <Select id="invite-role" name="role" defaultValue={USER_ROLES.AUTHOR}>
                        <option value={USER_ROLES.AUTHOR}>РђРІС‚РѕСЂ</option>
                        <option value={USER_ROLES.CURATOR}>РљСѓСЂР°С‚РѕСЂ</option>
                        <option value={USER_ROLES.SALES_MANAGER}>РџСЂРѕРґР°Р¶Рё</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-days">РЎСЂРѕРє РґРµР№СЃС‚РІРёСЏ</Label>
                      <Select id="invite-days" name="expiresInDays" defaultValue="7">
                        <option value="3">3 РґРЅСЏ</option>
                        <option value="7">7 РґРЅРµР№</option>
                        <option value="14">14 РґРЅРµР№</option>
                        <option value="30">30 РґРЅРµР№</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-note">РљРѕРјРјРµРЅС‚Р°СЂРёР№</Label>
                      <Input
                        id="invite-note"
                        name="note"
                        placeholder="РќР°РїСЂРёРјРµСЂ, РґРѕСЃС‚СѓРї Рє РґРІСѓРј РєСѓСЂСЃР°Рј РїРѕ РЅРѕРІРѕРјСѓ Р·Р°РїСѓСЃРєСѓ"
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      РЎРѕР·РґР°С‚СЊ РїСЂРёРіР»Р°С€РµРЅРёРµ
                    </Button>
                  </form>
                </WorkspacePanel>
              </div>

              <WorkspacePanel
                eyebrow="РџСЂРёРіР»Р°С€РµРЅРёСЏ"
                title="РСЃС‚РѕСЂРёСЏ СЃСЃС‹Р»РѕРє Рё СЃС‚Р°С‚СѓСЃРѕРІ"
                description="РЎСЋРґР° РїРѕРїР°РґР°СЋС‚ СЃРІРµР¶РёРµ РїСЂРёРіР»Р°С€РµРЅРёСЏ. РЎСЃС‹Р»РєСѓ РјРѕР¶РЅРѕ СЃРєРѕРїРёСЂРѕРІР°С‚СЊ Рё РѕС‚РїСЂР°РІРёС‚СЊ С‡РµР»РѕРІРµРєСѓ РІСЂСѓС‡РЅСѓСЋ, РґР°Р¶Рµ РµСЃР»Рё РїРѕС‡С‚РѕРІС‹Р№ РєРѕРЅС‚СѓСЂ РїРѕРєР° РѕС‚РєР»СЋС‡РµРЅ."
              >
                {invites.length === 0 ? (
                  <WorkspaceEmptyState
                    title="РџРѕРєР° РЅРµС‚ РїСЂРёРіР»Р°С€РµРЅРёР№"
                    description="РЎРѕР·РґР°Р№ РїРµСЂРІРѕРµ РїСЂРёРіР»Р°С€РµРЅРёРµ, Рё РѕРЅРѕ РїРѕСЏРІРёС‚СЃСЏ РІ СЌС‚РѕРј СЃРїРёСЃРєРµ."
                    className="border-[var(--border)] bg-[var(--surface)] shadow-none"
                  />
                ) : (
                  <div className="space-y-4">
                    {invites.map((invite) => {
                      const status = getInviteStatus(invite);
                      const inviteUrl = buildWorkspaceInviteUrl(invite.token);

                      return (
                        <article
                          key={invite.id}
                          className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5"
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={status.variant}>{status.label}</Badge>
                                <Badge variant="neutral">{roleLabelMap[invite.role]}</Badge>
                              </div>
                              <div>
                                <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                                  {invite.email}
                                </h2>
                                <p className="mt-1 text-sm text-[var(--muted)]">
                                  Р’С‹РґР°Р» {invite.invitedBy.name || invite.invitedBy.email}
                                </p>
                              </div>
                              <div className="grid gap-2 text-sm text-[var(--muted)] md:grid-cols-2">
                                <p>РЎРѕР·РґР°РЅРѕ: {formatDate(invite.createdAt)}</p>
                                <p>Р”РµР№СЃС‚РІСѓРµС‚ РґРѕ: {formatDate(invite.expiresAt)}</p>
                                <p>РђРєС‚РёРІРёСЂРѕРІР°РЅРѕ: {formatDate(invite.acceptedAt)}</p>
                                <p>РћС‚РѕР·РІР°РЅРѕ: {formatDate(invite.revokedAt)}</p>
                              </div>
                              {invite.note ? (
                                <WorkspaceNotice title="РљРѕРјРјРµРЅС‚Р°СЂРёР№" description={invite.note} />
                              ) : null}
                            </div>

                            <WorkspaceNotice
                              className="w-full max-w-[420px]"
                              title="РЎСЃС‹Р»РєР° РїСЂРёРіР»Р°С€РµРЅРёСЏ"
                              description={
                                <span className="inline-flex items-center gap-2">
                                  <Link2 className="h-4 w-4 text-[var(--primary)]" />
                                  Р“РѕС‚РѕРІР° Рє РѕС‚РїСЂР°РІРєРµ РёР»Рё РїСЂРѕРІРµСЂРєРµ.
                                </span>
                              }
                            >
                              <Input readOnly value={inviteUrl} />
                              <WorkspaceActionRow dense className="mt-3">
                                <InviteLinkCopy url={inviteUrl} />
                                <Button asChild variant="outline" size="sm">
                                  <a href={inviteUrl} target="_blank" rel="noreferrer">
                                    РћС‚РєСЂС‹С‚СЊ РїСЂРёРіР»Р°С€РµРЅРёРµ
                                  </a>
                                </Button>
                                {!invite.revokedAt && !invite.acceptedAt ? (
                                  <form action={revokeWorkspaceInvite}>
                                    <input type="hidden" name="inviteId" value={invite.id} />
                                    <Button type="submit" variant="outline" size="sm">
                                      РћС‚РѕР·РІР°С‚СЊ
                                    </Button>
                                  </form>
                                ) : null}
                              </WorkspaceActionRow>
                            </WorkspaceNotice>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </WorkspacePanel>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
