import type { Job } from "../types";

export type PullItem = { name: string; jobs: string[] };

export function formatClock(iso: string, timeZone = "America/New_York"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function todayLabel(timeZone = "America/New_York"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export function sortJobs(jobs: Job[]): Job[] {
  const rank = { stat: 0, today: 1, flex: 2 };
  return [...jobs].sort((a, b) => {
    if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
    return a.windowStart.localeCompare(b.windowStart);
  });
}

export function pullList(jobs: Job[]): PullItem[] {
  const map = new Map<string, Set<string>>();
  for (const job of jobs) {
    for (const part of job.partsHints) {
      const key = part.trim();
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(job.customer);
    }
  }
  return [...map.entries()]
    .map(([name, customers]) => ({ name, jobs: [...customers] }))
    .sort((a, b) => b.jobs.length - a.jobs.length || a.name.localeCompare(b.name));
}

export function briefingHeadline(jobs: Job[]): string {
  const stat = jobs.filter((job) => job.priority === "stat").length;
  if (!jobs.length) return "No jobs on the board yet. Paste a dispatch email.";
  if (stat === 0) return `${jobs.length} job${jobs.length === 1 ? "" : "s"} today. Nothing marked stat.`;
  return `${jobs.length} job${jobs.length === 1 ? "" : "s"} today · ${stat} stat. Pull parts before you roll.`;
}
