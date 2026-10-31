import { DEMO_JOBS } from "../data/jobs";
import type { FloorPlan, Job } from "../types";

const JOBS_KEY = "duckworks.jobs.v1";
const PLANS_KEY = "duckworks.plans.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadJobs(): Job[] {
  const stored = readJson<Job[]>(JOBS_KEY, []);
  if (!stored.length) return DEMO_JOBS;
  const demoIds = new Set(DEMO_JOBS.map((job) => job.id));
  const extras = stored.filter((job) => !demoIds.has(job.id));
  return [...DEMO_JOBS, ...extras];
}

export function saveJobs(jobs: Job[]): void {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export function loadPlans(): FloorPlan[] {
  return readJson<FloorPlan[]>(PLANS_KEY, []);
}

export function savePlans(plans: FloorPlan[]): void {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}
