import { useMemo, useState } from "react";
import { CATEGORY_LABEL } from "../lib/labels";
import { answerFromArticles, searchKnowledge } from "../lib/knowledgeSearch";
import type { KnowledgeArticle, KnowledgeCategory } from "../types";

const CATEGORIES: Array<KnowledgeCategory | "all"> = [
  "all",
  "charging",
  "electrical",
  "condensate",
  "gas",
  "heat_pump",
  "duct",
  "safety",
  "equipment",
];

type Props = {
  query: string;
  onQuery: (value: string) => void;
  category: KnowledgeCategory | "all";
  onCategory: (value: KnowledgeCategory | "all") => void;
  article: KnowledgeArticle;
  onOpen: (id: string) => void;
};

export function KnowledgePage({ query, onQuery, category, onCategory, article, onOpen }: Props) {
  const [asked, setAsked] = useState("");
  const hits = useMemo(() => searchKnowledge(query, category), [query, category]);
  const reply = asked ? answerFromArticles(asked) : undefined;

  return (
    <section>
      <p className="kicker">Equipment & SOPs</p>
      <h1>Straight answers</h1>
      <p className="lede">
        Field steps, not a textbook. Ask a symptom or a model. The book stays on the phone when the attic has no signal.
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p className="kicker">Ask</p>
        <div className="search-row">
          <input
            type="search"
            placeholder="Why is this heat pump iced in heat mode?"
            aria-label="Ask the SOP book"
            value={asked}
            onChange={(event) => setAsked(event.target.value)}
          />
        </div>
        {reply && <div className="answer-box">{reply.answer}</div>}
      </div>

      <div className="search-row">
        <input
          type="search"
          placeholder="Filter the book — capacitor, GSX16, condensate…"
          aria-label="Filter knowledge"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </div>
      <div className="chips">
        {CATEGORIES.map((id) => (
          <button key={id} className={category === id ? "active" : ""} onClick={() => onCategory(id)}>
            {id === "all" ? "All" : CATEGORY_LABEL[id]}
          </button>
        ))}
      </div>

      <div className="grid-2">
        <div className="article-list">
          {hits.map((hit) => (
            <button key={hit.id} className={hit.id === article.id ? "selected" : ""} onClick={() => onOpen(hit.id)}>
              <strong>{hit.title}</strong>
              <div className="meta">{CATEGORY_LABEL[hit.category]}</div>
            </button>
          ))}
          {hits.length === 0 && <div className="empty">No SOP matched that filter.</div>}
        </div>
        <article className="card">
          <p className="kicker">{CATEGORY_LABEL[article.category]}</p>
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
          <h3>Steps</h3>
          <ol className="steps">
            {article.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h3>Watch</h3>
          <ul className="watch">
            {article.watchouts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
