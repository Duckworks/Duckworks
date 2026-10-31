import { ARTICLES } from "../data/knowledge";
import type { KnowledgeArticle, KnowledgeCategory } from "../types";

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+/.\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

export function searchKnowledge(
  query: string,
  category?: KnowledgeCategory | "all",
): KnowledgeArticle[] {
  const q = tokens(query);
  const pool =
    category && category !== "all"
      ? ARTICLES.filter((article) => article.category === category)
      : ARTICLES;

  if (!q.length) return pool;

  const scored = pool
    .map((article) => {
      const hay = tokens(
        [article.title, article.summary, article.tags.join(" "), article.when.join(" "), article.steps.join(" ")].join(
          " ",
        ),
      );
      let score = 0;
      for (const token of q) {
        if (article.id === token) score += 8;
        if (article.title.toLowerCase().includes(token)) score += 5;
        if (article.tags.some((tag) => tag.includes(token))) score += 3;
        if (article.when.some((when) => when.includes(token))) score += 3;
        if (hay.includes(token)) score += 1;
      }
      return { article, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((row) => row.article);
}

export function answerFromArticles(query: string): { answer: string; article?: KnowledgeArticle } {
  const hits = searchKnowledge(query);
  const article = hits[0];
  if (!article) {
    return {
      answer:
        "Nothing in the local SOP book matched that. Try a part, a symptom, or a model — capacitor, no cool, GSX16, condensate.",
    };
  }
  return {
    article,
    answer: `${article.summary} First move: ${article.steps[0]}`,
  };
}
