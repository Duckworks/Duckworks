import { JOB_TYPE_LABEL, PRIORITY_LABEL } from "../lib/labels";
import type { Job } from "../types";

type Props = {
  job: Job;
  selected?: boolean;
  onSelect: () => void;
};

export function JobCard({ job, selected, onSelect }: Props) {
  return (
    <button className={`job-card${selected ? " selected" : ""}`} onClick={onSelect}>
      <div>
        <div className="when">{job.windowLabel}</div>
        <span className={`pill pill-${job.priority}`}>{PRIORITY_LABEL[job.priority]}</span>
      </div>
      <div>
        <strong>
          {JOB_TYPE_LABEL[job.type]} · {job.customer}
        </strong>
        <div className="meta">
          {job.address}, {job.city}
          {job.equipment ? ` · ${job.equipment}` : ""}
        </div>
      </div>
      <div className="meta">{job.source === "email" ? "Email" : job.source === "demo" ? "Board" : "Manual"}</div>
    </button>
  );
}
