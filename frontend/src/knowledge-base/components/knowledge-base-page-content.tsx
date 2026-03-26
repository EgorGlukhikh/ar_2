import { BookOpen, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WorkspacePageHeader, WorkspacePanel } from "@/components/workspace/workspace-primitives";
import type { KnowledgeBasePayload } from "@shared/knowledge-base/types";

export function KnowledgeBasePageContent({
  payload,
}: {
  payload: KnowledgeBasePayload;
}) {
  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow={payload.primaryLabel}
        title={payload.title}
        description={payload.description}
        meta={<Badge variant="neutral">Роль: {payload.audience === "student" ? "Студент" : "Преподаватель"}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <WorkspacePanel
          eyebrow="Короткая инструкция"
          title="Открывай и действуй по шагам"
          description="База знаний не объясняет интерфейс ради интерфейса, а помогает быстрее дойти до нужного действия."
        >
          <div className="space-y-4">
            {payload.sections.slice(0, 2).map((section) => (
              <article
                key={section.title}
                className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] text-[var(--primary)]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">{section.title}</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {section.items.slice(0, 2).map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--muted)]">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Основные сценарии"
          title="Что важно знать в первую очередь"
          description="Сначала — базовые шаги, потом — частые рабочие ситуации."
        >
          <div className="grid gap-4">
            {payload.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] text-[var(--primary)]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">{section.title}</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--muted)]">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
      </div>

      <WorkspacePanel
        eyebrow="Частые вопросы"
        title="Ситуации, которые встречаются чаще всего"
        description="Если хочется быстро разобраться без переписки с командой, начни с этих карточек."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {payload.articles.map((article) => (
            <article
              key={article.title}
              className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{article.body}</p>
            </article>
          ))}
        </div>
      </WorkspacePanel>
    </section>
  );
}
