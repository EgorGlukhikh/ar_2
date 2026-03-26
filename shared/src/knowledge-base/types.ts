export type KnowledgeBaseAudience = "student" | "teacher";

export type KnowledgeBaseArticle = {
  title: string;
  body: string;
};

export type KnowledgeBaseSection = {
  title: string;
  items: string[];
};

export type KnowledgeBasePayload = {
  audience: KnowledgeBaseAudience;
  title: string;
  description: string;
  primaryLabel: string;
  sections: KnowledgeBaseSection[];
  articles: KnowledgeBaseArticle[];
};
