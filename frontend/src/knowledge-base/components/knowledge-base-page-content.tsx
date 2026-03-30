import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspacePageHeader, WorkspacePanel } from "@/components/workspace/workspace-primitives";
import type { KnowledgeBasePayload } from "@shared/knowledge-base/types";

type AudienceSwitcherLink = {
  href: string;
  label: string;
  active: boolean;
};

function getAudienceLabel(audience: KnowledgeBasePayload["audience"]) {
  return audience === "student" ? "Студент" : "Преподаватель";
}

function getAudienceAccent(audience: KnowledgeBasePayload["audience"]) {
  return audience === "student"
    ? {
        badge: "Учебный доступ",
        title: "Маршрут по кабинету и обучению",
        description:
          "Секции ниже выстроены как последовательный путь ученика: сначала вход и каталог, затем доступ, прохождение, домашние задания и поддержка.",
      }
    : {
        badge: "Рабочий доступ",
        title: "Внутренний контур команды и автора",
        description:
          "Секции ниже собраны как рабочая карта курса: от создания программы до выдачи доступов, проверки домашних работ и рассылок.",
      };
}

export function KnowledgeBasePageContent({
  payload,
  audienceLinks,
}: {
  payload: KnowledgeBasePayload;
  audienceLinks?: AudienceSwitcherLink[];
}) {
  const accent = getAudienceAccent(payload.audience);

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow={payload.primaryLabel}
        title={payload.title}
        description={payload.description}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">Роль: {getAudienceLabel(payload.audience)}</Badge>
            <Badge variant="success">{payload.modules.length} разделов</Badge>
          </div>
        }
        actions={
          audienceLinks && audienceLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {audienceLinks.map((item) => (
                <Button key={item.href} asChild size="sm" variant={item.active ? "default" : "outline"}>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-[256px_minmax(0,1fr)]">
        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <WorkspacePanel
            eyebrow={accent.badge}
            title={accent.title}
            description={accent.description}
            className="p-5"
          >
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--primary-soft)]/60 px-4 py-4 text-sm leading-7 text-[var(--foreground)]">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-2xl bg-white p-2 text-[var(--primary)] shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p>{payload.visibilityNote}</p>
              </div>
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Разделы"
            title="Навигация по базе знаний"
            description="Каждый раздел — это отдельный рабочий этап. Внутри него лежат подробные статьи по конкретным ситуациям."
          >
            <nav className="space-y-3">
              {payload.modules.map((module, index) => (
                <a
                  key={module.id}
                  href={`#${module.id}`}
                  className="group block rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:border-[var(--primary)] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Раздел {index + 1}
                      </p>
                      <p className="mt-2 text-[17px] font-semibold leading-7 text-[var(--foreground)]">
                        {module.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {module.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)] transition group-hover:translate-x-0.5" />
                  </div>
                </a>
              ))}
            </nav>
          </WorkspacePanel>
        </div>

        <div className="space-y-6">
          {payload.modules.map((module, moduleIndex) => (
            <WorkspacePanel
              key={module.id}
              className="scroll-mt-24"
              eyebrow={`Раздел ${moduleIndex + 1}`}
              title={module.title}
              description={module.description}
            >
              <div id={module.id} className="space-y-4">
                {module.articles.map((article, articleIndex) => (
                  <article
                    key={article.id}
                    id={article.id}
                    className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="neutral">Статья {articleIndex + 1}</Badge>
                          <Badge variant="neutral">{getAudienceLabel(payload.audience)}</Badge>
                        </div>
                        <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                          {article.title}
                        </h3>
                        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
                          {article.summary}
                        </p>
                      </div>

                      <div className="max-w-[320px] rounded-[22px] border border-[var(--border)] bg-white px-4 py-4 text-sm leading-7 text-[var(--foreground)]">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-2xl bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                              Что должно получиться
                            </p>
                            <p className="mt-2">{article.outcome}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {article.sections.map((section) => (
                        <section
                          key={section.title}
                          className="rounded-[22px] border border-[var(--border)] bg-white px-5 py-5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--icon-radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)]">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <h4 className="text-lg font-semibold text-[var(--foreground)]">
                              {section.title}
                            </h4>
                          </div>

                          <div className="mt-4 space-y-3">
                            {section.paragraphs.map((paragraph) => (
                              <p
                                key={paragraph}
                                className="text-sm leading-7 text-[var(--foreground)]"
                              >
                                {paragraph}
                              </p>
                            ))}
                          </div>

                          {section.checklist && section.checklist.length > 0 ? (
                            <div className="mt-5 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                Практический чек-лист
                              </p>
                              <div className="mt-3 space-y-3">
                                {section.checklist.map((item) => (
                                  <div
                                    key={item}
                                    className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]"
                                  >
                                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </WorkspacePanel>
          ))}

          <WorkspacePanel
            eyebrow="Финал"
            title="Как работать с этой базой знаний дальше"
            description="Используй ее как живой рабочий контур: дополняй реальные сценарии, которых еще не хватает, и не смешивай в одной статье несколько процессов."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-2 text-[var(--primary)] shadow-sm">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Одна статья — одна задача</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Лучше пять точных статей, чем один большой текст без структуры и точек входа.
                </p>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-2 text-[var(--primary)] shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Разделяй аудитории</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Студенту не нужен внутренний операционный шум, а команде не нужен студенческий FAQ вперемешку с настройками курса.
                </p>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-2 text-[var(--primary)] shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Пиши под действие</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Хорошая статья отвечает не на «что это», а на «что мне делать прямо сейчас и как проверить, что все сработало».
                </p>
              </div>
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </section>
  );
}
