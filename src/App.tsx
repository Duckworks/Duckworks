import { useEffect, useMemo, useState } from "react";
import { SAMPLE_DISPATCH, SAMPLE_WALKTHROUGH } from "./data/jobs";
import { articleById } from "./data/knowledge";
import { BriefingPage } from "./pages/BriefingPage";
import { JobsPage } from "./pages/JobsPage";
import { KnowledgePage } from "./pages/KnowledgePage";
import { LayoutPage } from "./pages/LayoutPage";
import { briefingHeadline, pullList, sortJobs, todayLabel } from "./lib/briefing";
import { jobFromParsed, parseDispatchEmail } from "./lib/emailParser";
import { uid } from "./lib/ids";
import { loadJobs, loadPlans, saveJobs, savePlans } from "./lib/jobStore";
import { parseWalkthrough } from "./lib/walkthrough";
import type { FloorPlan, Job, KnowledgeCategory, PageId } from "./types";

const GROK_BOT = "https://x.ai/bot/d1ug4cTbeJgreRt7xr42e";

export function App() {
  const [page, setPage] = useState<PageId>("briefing");
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const [plans, setPlans] = useState<FloorPlan[]>(() => loadPlans());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id ?? null);
  const [emailDraft, setEmailDraft] = useState(SAMPLE_DISPATCH);
  const [walkthrough, setWalkthrough] = useState(SAMPLE_WALKTHROUGH);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [articleId, setArticleId] = useState("sop-no-cool");
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [knowledgeCategory, setKnowledgeCategory] = useState<KnowledgeCategory | "all">("all");

  useEffect(() => saveJobs(jobs), [jobs]);
  useEffect(() => savePlans(plans), [plans]);

  const ordered = useMemo(() => sortJobs(jobs), [jobs]);
  const selectedJob = ordered.find((job) => job.id === selectedJobId) ?? ordered[0];
  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? plans[0];

  const ingestEmail = () => {
    const parsed = parseDispatchEmail(emailDraft);
    const job = jobFromParsed(parsed, emailDraft);
    setJobs((current) => [job, ...current]);
    setSelectedJobId(job.id);
    setPage("jobs");
  };

  const openSop = (id: string) => {
    setArticleId(id);
    setKnowledgeQuery("");
    setPage("knowledge");
  };

  const generatePlan = (job?: Job) => {
    const parsed = parseWalkthrough(walkthrough);
    const plan: FloorPlan = {
      id: uid("plan"),
      name: job ? `${job.customer} · ${job.city}` : "Walkthrough layout",
      jobId: job?.id,
      notes: parsed.notes,
      items: parsed.items,
      updatedAt: new Date().toISOString(),
    };
    setPlans((current) => [plan, ...current]);
    setActivePlanId(plan.id);
    setPage("layout");
  };

  const updatePlan = (next: FloorPlan) => {
    setPlans((current) => current.map((plan) => (plan.id === next.id ? next : plan)));
  };

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#briefing" onClick={() => setPage("briefing")}>
          <img src="/mark.svg" alt="" />
          <div>
            <div className="brand-name">
              Duck<span>works</span>
            </div>
            <span className="brand-sub">Field sidekick</span>
          </div>
        </a>
        <div className="top-actions">
          <div className="date-chip">{todayLabel()}</div>
          <a className="btn btn-amber" href={GROK_BOT} target="_blank" rel="noreferrer">
            Open Grok Bot
          </a>
        </div>
      </header>

      <div className="shell">
        <nav className="nav" aria-label="Primary">
          <button className={page === "briefing" ? "active" : ""} onClick={() => setPage("briefing")}>
            Briefing
          </button>
          <button className={page === "jobs" ? "active" : ""} onClick={() => setPage("jobs")}>
            Jobs <span className="count">{jobs.length}</span>
          </button>
          <button className={page === "layout" ? "active" : ""} onClick={() => setPage("layout")}>
            Layout
          </button>
          <button className={page === "knowledge" ? "active" : ""} onClick={() => setPage("knowledge")}>
            Knowledge
          </button>
        </nav>

        <main>
          {page === "briefing" && (
            <BriefingPage
              headline={briefingHeadline(ordered)}
              jobs={ordered}
              pull={pullList(ordered)}
              selectedId={selectedJob?.id}
              onSelect={(job) => {
                setSelectedJobId(job.id);
                setPage("jobs");
              }}
              onOpenSop={openSop}
              emailDraft={emailDraft}
              onEmailDraft={setEmailDraft}
              onIngest={ingestEmail}
              onLoadSample={() => setEmailDraft(SAMPLE_DISPATCH)}
            />
          )}
          {page === "jobs" && selectedJob && (
            <JobsPage
              jobs={ordered}
              selected={selectedJob}
              onSelect={setSelectedJobId}
              onOpenSop={openSop}
              onLayout={() => {
                setWalkthrough(
                  selectedJob.notes.includes("Walkthrough")
                    ? selectedJob.notes
                    : `${SAMPLE_WALKTHROUGH}\nJob notes: ${selectedJob.notes}`,
                );
                generatePlan(selectedJob);
              }}
            />
          )}
          {page === "layout" && (
            <LayoutPage
              walkthrough={walkthrough}
              onWalkthrough={setWalkthrough}
              onGenerate={() => generatePlan(selectedJob)}
              plan={activePlan}
              plans={plans}
              onChoosePlan={setActivePlanId}
              onUpdatePlan={updatePlan}
            />
          )}
          {page === "knowledge" && (
            <KnowledgePage
              query={knowledgeQuery}
              onQuery={setKnowledgeQuery}
              category={knowledgeCategory}
              onCategory={setKnowledgeCategory}
              article={articleById(articleId) ?? articleById("sop-no-cool")!}
              onOpen={setArticleId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
