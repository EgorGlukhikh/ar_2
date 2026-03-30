export type KnowledgeBaseAudience = "student" | "teacher";

export type KnowledgeBaseArticleSection = {
  title: string;
  paragraphs: string[];
  checklist?: string[];
};

export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  summary: string;
  outcome: string;
  sections: KnowledgeBaseArticleSection[];
};

export type KnowledgeBaseModule = {
  id: string;
  title: string;
  description: string;
  articles: KnowledgeBaseArticle[];
};

export type KnowledgeBasePayload = {
  audience: KnowledgeBaseAudience;
  title: string;
  description: string;
  primaryLabel: string;
  visibilityNote: string;
  modules: KnowledgeBaseModule[];
};
