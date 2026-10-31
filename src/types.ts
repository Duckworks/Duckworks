export type PageId = "briefing" | "jobs" | "layout" | "knowledge";

export type JobType =
  | "no_cool"
  | "no_heat"
  | "maintenance"
  | "estimate"
  | "leak"
  | "noise"
  | "other";

export type JobPriority = "stat" | "today" | "flex";

export type JobSource = "email" | "demo" | "manual";

export type Job = {
  id: string;
  source: JobSource;
  receivedAt: string;
  windowStart: string;
  windowLabel: string;
  customer: string;
  phone?: string;
  address: string;
  city: string;
  type: JobType;
  priority: JobPriority;
  equipment?: string;
  refrigerant?: string;
  notes: string;
  partsHints: string[];
  sopIds: string[];
  rawEmail?: string;
};

export type KnowledgeCategory =
  | "charging"
  | "electrical"
  | "condensate"
  | "gas"
  | "heat_pump"
  | "duct"
  | "safety"
  | "equipment";

export type KnowledgeArticle = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  when: string[];
  steps: string[];
  watchouts: string[];
  tags: string[];
};

export type LayoutKind = "room" | "equipment" | "supply" | "return" | "duct";

export type LayoutItem = {
  id: string;
  kind: LayoutKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  points?: { x: number; y: number }[];
};

export type FloorPlan = {
  id: string;
  name: string;
  jobId?: string;
  notes: string;
  items: LayoutItem[];
  sketchDataUrl?: string;
  updatedAt: string;
};

export type ParsedDispatch = {
  customer?: string;
  phone?: string;
  address?: string;
  city?: string;
  windowLabel?: string;
  windowStart?: string;
  type?: JobType;
  equipment?: string;
  refrigerant?: string;
  notes: string;
  jobNumber?: string;
};

export type WalkthroughParse = {
  items: LayoutItem[];
  notes: string;
};
