export type JobPriority = "first" | "normal" | "watch";

export type FieldJob = {
  time: string;
  address: string;
  work: string;
  notes: string;
  pull: string[];
  priority: JobPriority;
};

export type ParsedJobs = {
  jobs: FieldJob[];
  leftover: string[];
};

const TIME =
  /\b((?:[01]?\d|2[0-3])(?::[0-5]\d)?\s?(?:AM|PM|am|pm)|(?:[01]?\d|2[0-3]):[0-5]\d)\b/;
const ADDRESS =
  /\b\d{1,6}\s+[A-Za-z0-9][A-Za-z0-9.'\-]*(?:\s+[A-Za-z0-9][A-Za-z0-9.'\-]*){0,6}\s(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Ct|Court|Way|Ter|Terrace|Pl|Place|Cir|Circle|Pkwy|Parkway|Hwy|Highway)\b\.?(?:,\s*[A-Za-z][A-Za-z.\- ]{1,32})?/i;

const VAN_HINTS: Array<{ test: RegExp; item: string }> = [
  { test: /no\s*cool|not\s*cooling|won'?t\s*cool/i, item: "gauges, temp probes, capacitor kit" },
  { test: /capacitor|hum(?:s|ming)?|won'?t\s*start/i, item: "dual-run capacitors, start assist" },
  { test: /drain|condensate|overflow|pan/i, item: "wet/dry vac, condensate tablets, vinyl tubing" },
  { test: /duct|flex|takeoff|boot/i, item: "flex, takeoff sheet, mastic, straps, boots" },
  { test: /coil|clean/i, item: "coil cleaner, fin comb, drop cloths" },
  { test: /410|r-?410|454|r-?454|freon|recover/i, item: "recovery gear, 410A/454B, scale" },
  { test: /heat(?:er|ing)?|furnace|ignitor|limit/i, item: "ignitor, flame sensor, multimeter" },
  { test: /thermostat|stat\b/i, item: "common-wire adapter, thermostat" },
  { test: /walkthrough|estimate|replace/i, item: "tape, notepad, camera, takeoff sheet" },
];

function splitBlocks(text: string): string[] {
  const chunks = text
    .split(/\n(?=From:)|(?:^|\n)---+\n|^Subject:/m)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return chunks.length > 0 ? chunks : [text.trim()];
}

function firstMatch(source: string, pattern: RegExp): string {
  const match = source.match(pattern);
  return match?.[0]?.replace(/\s+/g, " ").trim() ?? "";
}

function pullFor(text: string): string[] {
  const items = VAN_HINTS.filter((hint) => hint.test.test(text)).map((hint) => hint.item);
  return items.length > 0 ? [...new Set(items)] : ["meters, gauges, basic fittings"];
}

function priorityFor(text: string, index: number): JobPriority {
  if (/no\s*cool|overflow|leak|emergency|first/i.test(text)) return "first";
  if (index === 0) return "first";
  if (/watch|callback|come\s*back/i.test(text)) return "watch";
  return "normal";
}

function cleanWork(value: string): string {
  return value
    .replace(/^[—\-–:,\s]+/, "")
    .replace(/[—\-–\s]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function jobFromLine(line: string, index: number): FieldJob | undefined {
  const parts = line
    .split(/\s*[—–]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2 && (TIME.test(parts[0]) || ADDRESS.test(parts[0]) || ADDRESS.test(parts[1] ?? ""))) {
    const time = firstMatch(parts[0], TIME);
    const timeOnly = Boolean(time) && cleanWork(parts[0].replace(TIME, "")) === "";
    const addressPart = timeOnly ? parts[1] : parts[0];
    const workParts = timeOnly ? parts.slice(2) : parts.slice(1);
    const address = firstMatch(addressPart, ADDRESS) || addressPart;
    const work = cleanWork(workParts.join(" — "));
    if (time || ADDRESS.test(addressPart)) {
      return {
        time: time || "unscheduled",
        address,
        work: work || "see notes",
        notes: line.trim(),
        pull: pullFor(line),
        priority: priorityFor(line, index),
      };
    }
  }
  const time = firstMatch(line, TIME);
  const address = firstMatch(line, ADDRESS);
  if (!time && !address) return undefined;
  const stripped = cleanWork(line.replace(TIME, "").replace(ADDRESS, ""));
  return {
    time: time || "unscheduled",
    address: address || "address not listed",
    work: stripped || "see notes",
    notes: line.trim(),
    pull: pullFor(line),
    priority: priorityFor(line, index),
  };
}

export function parseJobs(text: string): ParsedJobs {
  const jobs: FieldJob[] = [];
  const leftover: string[] = [];
  for (const block of splitBlocks(text)) {
    const lines = block
      .split(/\n+/)
      .map((line) => line.replace(/^[\s>*-]+/, "").trim())
      .filter((line) => line && !/^from:|^to:|^date:|^subject:/i.test(line));
    let found = false;
    for (const [index, line] of lines.entries()) {
      const job = jobFromLine(line, jobs.length + index);
      if (job) {
        jobs.push(job);
        found = true;
      }
    }
    if (!found && block.trim()) leftover.push(block.trim());
  }
  return { jobs, leftover };
}

export function textFromUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array) return new TextDecoder().decode(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
