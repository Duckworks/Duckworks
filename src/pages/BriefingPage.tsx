import type { Job } from "../types";
import type { PullItem } from "../lib/briefing";
import { JobCard } from "../components/JobCard";
import { articleById } from "../data/knowledge";

type Props = {
  headline: string;
  jobs: Job[];
  pull: PullItem[];
  selectedId?: string;
  onSelect: (job: Job) => void;
  onOpenSop: (id: string) => void;
  emailDraft: string;
  onEmailDraft: (value: string) => void;
  onIngest: () => void;
  onLoadSample: () => void;
};

export function BriefingPage({
  headline,
  jobs,
  pull,
  selectedId,
  onSelect,
  onOpenSop,
  emailDraft,
  onEmailDraft,
  onIngest,
  onLoadSample,
}: Props) {
  return (
    <section>
      <p className="kicker">Morning heads-up</p>
      <h1>Today on the truck</h1>
      <p className="lede">{headline}</p>

      <div className="weather">
        <div>Tampa Bay · late Oct · humid, mid-80s, storm chance after 2</div>
        <div>Stat first. Wash the Goodman coil if the filter is packed.</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="job-list">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} selected={job.id === selectedId} onSelect={() => onSelect(job)} />
            ))}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <p className="kicker">Work email</p>
            <h2>Drop a dispatch on the board</h2>
            <p className="lede">
              Paste a ServiceTitan, Housecall, or shop email. Duckworks pulls the window, address, equipment, and what
              to grab.
            </p>
            <textarea
              aria-label="Dispatch email"
              value={emailDraft}
              onChange={(event) => onEmailDraft(event.target.value)}
            />
            <div className="form-actions">
              <button className="btn btn-amber" onClick={onIngest}>
                Add job from email
              </button>
              <button className="btn" onClick={onLoadSample}>
                Reload sample
              </button>
            </div>
          </div>
        </div>

        <aside>
          <div className="card">
            <p className="kicker">Pull list</p>
            <h2>Leave the shop once</h2>
            <ul className="pull-list">
              {pull.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <span className="who">{item.jobs.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <p className="kicker">Read before you roll</p>
            <div className="sop-links">
              {["sop-no-cool", "sop-heat-pump", "sop-condensate", "sop-safety"].map((id) => {
                const article = articleById(id);
                return (
                  <button key={id} onClick={() => onOpenSop(id)}>
                    {article?.title}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
