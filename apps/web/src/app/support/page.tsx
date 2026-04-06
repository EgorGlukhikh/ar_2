import Link from "next/link";

import { PageContainer, PageGrid } from "@/components/layout/page-grid";
import { PublicFooter } from "@/components/marketing/public-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupportRequestForm } from "@/components/support/support-request-form";
import {
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import { getSupportFormPrefill } from "@/features/support/service";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const prefill = await getSupportFormPrefill();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#f1f5ff_100%)]">
      <PageContainer className="py-6 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={prefill.isAuthenticated ? "/learning" : "/"}>
              {prefill.isAuthenticated ? "Вернуться в кабинет" : "На главную"}
            </Link>
          </Button>
        </div>

        <div className="mt-5 space-y-6">
          <WorkspacePageHeader
            eyebrow="Техподдержка"
            title="Написать в поддержку портала"
            description="Опиши, с чем столкнулся, что не сработало и как с тобой лучше связаться. Сообщение уйдёт напрямую команде платформы."
            meta={
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{prefill.roleLabel}</Badge>
                <Badge variant="neutral">
                  {prefill.isAuthenticated ? "Профиль найден" : "Гостевой запрос"}
                </Badge>
              </div>
            }
          />

          <PageGrid className="items-start">
            <div className="xl:col-span-8">
              <WorkspacePanel
                eyebrow="Форма"
                title="Сообщение в техподдержку"
                description="Чем конкретнее описание, тем быстрее команда поймёт проблему и сможет ответить."
              >
                <SupportRequestForm prefill={prefill} />
              </WorkspacePanel>
            </div>

            <div className="space-y-4 xl:col-span-4">
              <WorkspacePanel
                eyebrow="Что указать"
                title="Чтобы помочь быстрее"
                description="Поддержке особенно полезны детали, которые позволяют сразу воспроизвести ситуацию."
              >
                <div className="space-y-3 text-sm leading-7 text-[var(--foreground)]">
                  <p>Что именно ты пытался сделать и на каком шаге появилась проблема.</p>
                  <p>Какой курс, урок или раздел был открыт в этот момент.</p>
                  <p>Что ожидалось увидеть и что произошло по факту.</p>
                  <p>Если проблема повторяется, укажи это прямо в сообщении.</p>
                </div>
              </WorkspacePanel>

              <WorkspacePanel
                eyebrow="Канал ответа"
                title="Куда придёт ответ"
                description="Команда ответит на тот email, который ты укажешь в форме. Если нужно, уточни телефон в поле контакта."
              />
            </div>
          </PageGrid>
        </div>
      </PageContainer>

      <PublicFooter />
    </main>
  );
}
