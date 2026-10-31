import { JobCard } from "../components/JobCard";
import { articleById } from "../data/knowledge";
import { JOB_TYPE_LABEL, PRIORITY_LABEL } from "../lib/labels";
import type { Job } from "../types";

type Props = {
  jobs: Job[];
  selected: Job;
  onSelect: (id: string) => void;
  onOpenSop: (id: string) => void;
  onLayout: () => void;
};

export function JobsPage({ jobs, selected, onSelect, onOpenSop, onLayout }: Props) {
  return (
    <section>
      <p className="kicker">Jobs</p>
      <h1>Ticket</h1>
      <p className="lede">
        One board for the day. Open a ticket for the address, equipment, and the SOP that matches the complaint.
      </p>
      <div className="grid-2">
        <div className="job-list">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              selected={job.id === selected.id}
              onSelect={() => onSelect(job.id)}
            />
          ))}
        </div>
        <article className="card">
          <p className="kicker">
            {PRIORITY_LABEL[selected.priority]} · {JOB_TYPE_LABEL[selected.type]}
          </p>
          <h2>{selected.customer}</h2>
          <dl className="detail">
            <dt>Window</dt>
            <dd>{selected.windowLabel}</dd>
            <dt>Site</dt>
            <dd>
              {selected.address}, {selected.city}
              {selected.phone ? ` · ${selected.phone}` : ""}
            </dd>
            <dt>Equipment</dt>
            <dd>
              {selected.equipment || "Not on the ticket"}
              {selected.refrigerant ? ` · ${selected.refrigerant}` : ""}
            </dd>
            <dt>Complaint</dt>
            <dd>{selected.notes}</dd>
            <dt>Pull</dt>
            <dd>{selected.partsHints.join(" · ")}</dd>
            <dt>SOPs</dt>
            <dd>
              <div className="sop-links">
                {selected.sopIds.map((id) => (
                  <button key={id} onClick={() => onOpenSop(id)}>
                    {articleById(id)?.title ?? id}
                  </button>
                ))}
              </div>
            </dd>
          </dl>
          <div className="form-actions">
            <button className="btn btn-amber" onClick={onLayout}>
              Sketch this job
            </button>
          </div>
          {selected.rawEmail && (
            <pre className="empty" style={{ whiteSpace: "pre-wrap", marginTop: 14 }}>
              {selected.rawEmail}
            </pre>
          )}
        </article>
      </div>
    </section>
  );
}
