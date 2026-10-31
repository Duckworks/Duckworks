import { describe, expect, it } from "vitest";
import { answerFromArticles, searchKnowledge } from "./knowledgeSearch";

describe("searchKnowledge", () => {
  it("ranks capacitor questions onto the cap SOP", () => {
    const hits = searchKnowledge("humming condenser capacitor test");
    expect(hits[0]?.id).toBe("sop-cap-test");
  });

  it("filters by category", () => {
    const hits = searchKnowledge("", "duct");
    expect(hits.every((article) => article.category === "duct")).toBe(true);
    expect(hits.length).toBeGreaterThan(0);
  });

  it("answers from the best article", () => {
    const reply = answerFromArticles("heat pump iced in heat");
    expect(reply.article?.id).toBe("sop-heat-pump");
    expect(reply.answer).toMatch(/defrost/i);
  });
});
