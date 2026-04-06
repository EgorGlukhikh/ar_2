import { GraduationCap, KeyRound, Mail, UserPlus, Users } from "lucide-react";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { createStudent } from "@/features/admin/user-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  WorkspaceEmptyState,
  WorkspaceInfoItem,
  WorkspaceNotice,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import { requireRoleAccess } from "@/lib/admin";

export default async function StudentsPage() {
  const user = await requireRoleAccess([USER_ROLES.ADMIN, USER_ROLES.CURATOR]);

  const students = await prisma.user.findMany({
    where: {
      role: USER_ROLES.STUDENT,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          enrollments: true,
          progress: true,
        },
      },
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  const studentsWithCourses = students.filter((student) => student._count.enrollments > 0).length;

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Р‘Р°Р·Р° СЃС‚СѓРґРµРЅС‚РѕРІ"
        title="РЈРїСЂР°РІР»РµРЅРёРµ СѓС‡РµРЅРёРєР°РјРё"
        description="Р—РґРµСЃСЊ РєРѕРјР°РЅРґР° РІРёРґРёС‚ РІСЃРµС… СЃС‚СѓРґРµРЅС‚РѕРІ, РёС… РґРѕСЃС‚СѓРїС‹ Рё Р°РєС‚РёРІРЅРѕСЃС‚СЊ. РЎРѕР·РґР°РЅРёРµ РЅРѕРІС‹С… Р°РєРєР°СѓРЅС‚РѕРІ РѕСЃС‚Р°РІР»РµРЅРѕ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂСѓ, Р° РєСѓСЂР°С‚РѕСЂ СЂР°Р±РѕС‚Р°РµС‚ СЃ СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµР№ Р±Р°Р·РѕР№."
        meta={
          <WorkspaceInfoItem
            label="Р’СЃРµРіРѕ"
            value={`РЎС‚СѓРґРµРЅС‚РѕРІ: ${students.length}`}
            className="min-w-[180px]"
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <WorkspaceStatCard
          label="РЎС‚СѓРґРµРЅС‚С‹"
          value={students.length}
          hint="Р’СЃРµ СЃРѕР·РґР°РЅРЅС‹Рµ СѓС‡РµРЅРёРєРё РїР»Р°С‚С„РѕСЂРјС‹."
          icon={Users}
        />
        <WorkspaceStatCard
          label="РЎ РґРѕСЃС‚СѓРїРѕРј"
          value={studentsWithCourses}
          hint="РЎС‚СѓРґРµРЅС‚С‹, Сѓ РєРѕС‚РѕСЂС‹С… СѓР¶Рµ РѕС‚РєСЂС‹С‚ С…РѕС‚СЏ Р±С‹ РѕРґРёРЅ РєСѓСЂСЃ."
          icon={GraduationCap}
        />
        <WorkspaceStatCard
          label="Р‘РµР· РґРѕСЃС‚СѓРїР°"
          value={students.length - studentsWithCourses}
          hint="РџРѕР»СЊР·РѕРІР°С‚РµР»Рё, РєРѕС‚РѕСЂС‹Рј РµС‰Рµ РЅРµ РІС‹РґР°РЅС‹ РєСѓСЂСЃС‹."
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <WorkspacePanel
          eyebrow="РќРѕРІС‹Р№ СЃС‚СѓРґРµРЅС‚"
          title={
            user.role === USER_ROLES.ADMIN
              ? "РЎРѕР·РґР°С‚СЊ СѓС‡РµС‚РЅСѓСЋ Р·Р°РїРёСЃСЊ"
              : "Р”РѕСЃС‚СѓРї Рє Р±Р°Р·Рµ СЃС‚СѓРґРµРЅС‚РѕРІ"
          }
          description={
            user.role === USER_ROLES.ADMIN
              ? "Р¤РѕСЂРјР° РЅСѓР¶РЅР° РґР»СЏ Р±С‹СЃС‚СЂРѕРіРѕ СЃС‚Р°СЂС‚Р°. Р”Р°Р»СЊС€Рµ РґРѕСЃС‚СѓРї Рє РєСѓСЂСЃР°Рј РјРѕР¶РЅРѕ РІС‹РґР°С‚СЊ РІРЅСѓС‚СЂРё РєР°СЂС‚РѕС‡РєРё РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ РєСѓСЂСЃР°."
              : "РљСѓСЂР°С‚РѕСЂ РёСЃРїРѕР»СЊР·СѓРµС‚ СЌС‚РѕС‚ СЂР°Р·РґРµР» РєР°Рє СЂР°Р±РѕС‡СѓСЋ Р±Р°Р·Сѓ Рё РЅРµ СЃРѕР·РґР°РµС‚ РЅРѕРІС‹Рµ Р°РєРєР°СѓРЅС‚С‹."
          }
          className="self-start"
        >
          {user.role === USER_ROLES.ADMIN ? (
            <form action={createStudent} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="student-name">РРјСЏ</Label>
                <Input id="student-name" name="name" placeholder="РРІР°РЅ РџРµС‚СЂРѕРІ" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-email">РџРѕС‡С‚Р°</Label>
                <Input
                  id="student-email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-password">РџР°СЂРѕР»СЊ</Label>
                <Input
                  id="student-password"
                  name="password"
                  type="password"
                  placeholder="РњРёРЅРёРјСѓРј 5 СЃРёРјРІРѕР»РѕРІ"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <WorkspaceInfoItem
                  label="РџРѕС‡С‚Р° РґР»СЏ РІС…РѕРґР°"
                  value={
                    <>
                      <Mail className="mb-3 h-4 w-4 text-[var(--primary)]" />
                      <span className="block text-sm font-medium text-[var(--foreground)]">
                        РђРґСЂРµСЃ РґР»СЏ Р°РІС‚РѕСЂРёР·Р°С†РёРё
                      </span>
                    </>
                  }
                  hint="Р­С‚РѕС‚ Р°РґСЂРµСЃ СЃС‚СѓРґРµРЅС‚ РёСЃРїРѕР»СЊР·СѓРµС‚ РІ РїР»Р°С‚С„РѕСЂРјРµ."
                />
                <WorkspaceInfoItem
                  label="Р’СЂРµРјРµРЅРЅС‹Р№ РїР°СЂРѕР»СЊ"
                  value={
                    <>
                      <KeyRound className="mb-3 h-4 w-4 text-[var(--primary)]" />
                      <span className="block text-sm font-medium text-[var(--foreground)]">
                        РЎС‚Р°СЂС‚ Р±РµР· РѕР¶РёРґР°РЅРёСЏ
                      </span>
                    </>
                  }
                  hint="Р•РіРѕ РјРѕР¶РЅРѕ Р·Р°РјРµРЅРёС‚СЊ РїРѕР·Р¶Рµ РїРѕСЃР»Рµ РїРµСЂРІРѕРіРѕ РІС…РѕРґР°."
                />
              </div>

              <Button type="submit" className="w-full">
                РЎРѕР·РґР°С‚СЊ СЃС‚СѓРґРµРЅС‚Р°
              </Button>
            </form>
          ) : (
            <WorkspaceNotice
              title="РЎРѕР·РґР°РЅРёРµ РѕСЃС‚Р°РІР»РµРЅРѕ Р°РґРјРёРЅСѓ"
              description="Р—РґРµСЃСЊ РєСѓСЂР°С‚РѕСЂ РёСЃРїРѕР»СЊР·СѓРµС‚ СЃРїРёСЃРѕРє СѓР¶Рµ Р·Р°С‡РёСЃР»РµРЅРЅС‹С… Рё Р°РєС‚РёРІРЅС‹С… СѓС‡РµРЅРёРєРѕРІ."
            />
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="РЎРїРёСЃРѕРє СѓС‡РµРЅРёРєРѕРІ"
          title="РљРѕРіРѕ СѓР¶Рµ РјРѕР¶РЅРѕ РІРµСЃС‚Рё РїРѕ РєСѓСЂСЃР°Рј"
          description="РљР°СЂС‚РѕС‡РєРё РЅРёР¶Рµ РїРѕРјРѕРіР°СЋС‚ Р±С‹СЃС‚СЂРѕ РїРѕРЅСЏС‚СЊ, Сѓ РєРѕРіРѕ СѓР¶Рµ РµСЃС‚СЊ РґРѕСЃС‚СѓРїС‹ Рё СЃРєРѕР»СЊРєРѕ Р°РєС‚РёРІРЅРѕСЃС‚Рё Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅРѕ РІ СЃРёСЃС‚РµРјРµ."
        >
          {students.length === 0 ? (
            <WorkspaceEmptyState
              title="РџРѕРєР° РЅРµС‚ СЃС‚СѓРґРµРЅС‚РѕРІ"
              description="РљР°Рє С‚РѕР»СЊРєРѕ РїРѕСЏРІРёС‚СЃСЏ РїРµСЂРІС‹Р№ СЃС‚СѓРґРµРЅС‚, РѕРЅ РѕС‚РѕР±СЂР°Р·РёС‚СЃСЏ Р·РґРµСЃСЊ."
              className="border-[var(--border)] bg-[var(--surface)] shadow-none"
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {students.map((student) => (
                <article
                  key={student.id}
                  className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                            {student.name || student.email}
                          </h2>
                          <Badge variant="neutral">РЎС‚СѓРґРµРЅС‚</Badge>
                        </div>
                        <p className="text-sm text-[var(--muted)]">{student.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="neutral">РљСѓСЂСЃРѕРІ {student._count.enrollments}</Badge>
                        <Badge variant="neutral">РђРєС‚РёРІРЅРѕСЃС‚РµР№ {student._count.progress}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                        РџРѕСЃР»РµРґРЅРёРµ РґРѕСЃС‚СѓРїС‹
                      </p>
                      {student.enrollments.length === 0 ? (
                        <WorkspaceNotice
                          title="РџРѕРєР° РЅРµС‚ РѕС‚РєСЂС‹С‚С‹С… РєСѓСЂСЃРѕРІ"
                          description="РЈ СЃС‚СѓРґРµРЅС‚Р° РµС‰Рµ РЅРµС‚ Р°РєС‚РёРІРЅС‹С… Р·Р°С‡РёСЃР»РµРЅРёР№."
                          className="border-dashed shadow-none"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {student.enrollments.map((enrollment) => (
                            <Badge key={enrollment.id} variant="neutral">
                              {enrollment.course.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </section>
  );
}
