import type { JobPriority, JobType, KnowledgeCategory } from "../types";

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  no_cool: "No cool",
  no_heat: "No heat",
  maintenance: "Maintenance",
  estimate: "Estimate",
  leak: "Leak",
  noise: "Noise",
  other: "Other",
};

export const PRIORITY_LABEL: Record<JobPriority, string> = {
  stat: "Stat",
  today: "Today",
  flex: "Flex",
};

export const CATEGORY_LABEL: Record<KnowledgeCategory, string> = {
  charging: "Charging",
  electrical: "Electrical",
  condensate: "Condensate",
  gas: "Gas furnace",
  heat_pump: "Heat pump",
  duct: "Duct",
  safety: "Safety",
  equipment: "Equipment",
};
