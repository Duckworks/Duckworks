import type { Job, JobType, ParsedDispatch } from "../types";
import { uid } from "./ids";

const TYPE_PATTERNS: { type: JobType; re: RegExp }[] = [
  { type: "no_cool", re: /\b(no\s*cool|not\s*cooling|ac\s*down|won'?t\s*cool|no\s*a\/?c)\b/i },
  { type: "no_heat", re: /\b(no\s*heat|not\s*heating|won'?t\s*heat|furnace\s*down|heat\s*pump\s*no\s*heat)\b/i },
  { type: "leak", re: /\b(leak|water\s*on\s*ceiling|overflow|wet\s*ceiling)\b/i },
  { type: "noise", re: /\b(noise|loud|squeal|rattle|grinding)\b/i },
  { type: "maintenance", re: /\b(maint|tune[\s-]?up|pm\b|seasonal)\b/i },
  { type: "estimate", re: /\b(est(imate)?|quote|replace(ment)?|change[\s-]?out)\b/i },
];

const EQUIPMENT_RE =
  /\b((?:carrier|trane|goodman|rheem|ruud|lennox|york|daikin|mitsubishi|american standard|bryant|amana|heil|tempstar|payne)\s+[a-z0-9\-\/]+(?:\s+[a-z0-9\-\/]+)?)/i;

const REFRIGERANT_RE = /\b(r-?22|r-?410a|r-?32|r-?454b)\b/i;

const PHONE_RE = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/;
const TIME_RE = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)(?:\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))?|\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2})\b/i;

function firstMatch(re: RegExp, text: string): string | undefined {
  const match = text.match(re);
  return match?.[1]?.trim() || match?.[0]?.trim();
}

function lineValue(text: string, labels: string[]): string | undefined {
  const re = new RegExp(
    `^(?:${labels.join("|")})\\s*[:#-]\\s*(.+)$`,
    "im",
  );
  const match = text.match(re);
  return match?.[1]?.trim();
}

export function detectJobType(text: string): JobType {
  for (const row of TYPE_PATTERNS) {
    if (row.re.test(text)) return row.type;
  }
  return "other";
}

export function parseDispatchEmail(raw: string): ParsedDispatch {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const customer =
    lineValue(text, ["customer", "name", "homeowner", "contact"]) ||
    firstMatch(/for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/, text);
  const address =
    lineValue(text, ["address", "site", "location", "job site"]) ||
    firstMatch(
      /\b(\d{1,5}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|way|ct|court)\.?(?:\s+(?:n|s|e|w|n\.?e\.?|n\.?w\.?|s\.?e\.?|s\.?w\.?))?)\b/i,
      text,
    );
  const city =
    lineValue(text, ["city"]) ||
    firstMatch(
      /\b(Largo|Clearwater|Seminole|Pinellas Park|St\.?\s*Petersburg|Tampa|Safety Harbor|Dunedin|Palm Harbor|Indian Rocks)\b/i,
      text,
    );
  const equipment =
    lineValue(text, ["equipment", "system", "unit", "model"]) || firstMatch(EQUIPMENT_RE, text);
  const refrigerant =
    lineValue(text, ["refrigerant", "gas"]) || firstMatch(REFRIGERANT_RE, text)?.toUpperCase().replace("R", "R-").replace("R--", "R-");
  const notes =
    lineValue(text, ["notes", "complaint", "problem", "description", "call notes"]) ||
    text.split("\n").slice(-3).join(" ").trim();

  return {
    customer,
    phone: firstMatch(PHONE_RE, text),
    address,
    city,
    windowLabel: lineValue(text, ["window", "time", "appt", "appointment", "eta"]) || firstMatch(TIME_RE, text),
    windowStart: undefined,
    type: detectJobType(text),
    equipment,
    refrigerant: refrigerant ? refrigerant.replace(/r(?=\d)/i, "R-") : undefined,
    notes,
    jobNumber: lineValue(text, ["job", "job #", "wo", "work order", "invoice"]),
  };
}

export function jobFromParsed(parsed: ParsedDispatch, rawEmail: string, now = new Date()): Job {
  const city = parsed.city || "Tampa Bay";
  const type = parsed.type || "other";
  return {
    id: uid("job"),
    source: "email",
    receivedAt: now.toISOString(),
    windowStart: parsed.windowStart || now.toISOString(),
    windowLabel: parsed.windowLabel || "TBD",
    customer: parsed.customer || "Unknown",
    phone: parsed.phone,
    address: parsed.address || "Address not parsed",
    city,
    type,
    priority: type === "no_cool" || type === "no_heat" || type === "leak" ? "stat" : "today",
    equipment: parsed.equipment,
    refrigerant: parsed.refrigerant,
    notes: parsed.notes,
    partsHints: partsForJob(type, parsed.equipment, parsed.refrigerant),
    sopIds: sopsForJob(type),
    rawEmail,
  };
}

export function partsForJob(type: JobType, equipment?: string, refrigerant?: string): string[] {
  const parts: string[] = ["capacitor tester", "multimeter", "gauge set", "probe thermometers"];
  if (type === "no_cool" || type === "no_heat") {
    parts.push("dual run capacitor", "contactor", "hard start kit");
  }
  if (type === "leak") {
    parts.push("condensate pump", "3/4 PVC + trap", "wet/dry vac", "pan tablets");
  }
  if (type === "maintenance") {
    parts.push("1\" and 4\" filters", "no-rinse coil cleaner", "fin comb", "bleach tablets");
  }
  if (type === "estimate") {
    parts.push("tape measure", "static tips", "Manual J notes sheet");
  }
  if ((refrigerant || "").toUpperCase().includes("410")) {
    parts.push("R-410A drum + scales");
  } else if ((refrigerant || "").toUpperCase().includes("32")) {
    parts.push("R-32 recovery-compatible gauges");
  } else if ((refrigerant || "").toUpperCase().includes("22")) {
    parts.push("R-22 recovery bottle (do not vent)");
  }
  if ((equipment || "").toLowerCase().includes("furnace") || type === "no_heat") {
    parts.push("igniter", "flame sensor card", "manometer");
  }
  return [...new Set(parts)];
}

export function sopsForJob(type: JobType): string[] {
  switch (type) {
    case "no_cool":
      return ["sop-no-cool", "sop-cap-test", "sop-charge"];
    case "no_heat":
      return ["sop-furnace-seq", "sop-heat-pump", "sop-cap-test"];
    case "leak":
      return ["sop-condensate", "sop-safety"];
    case "maintenance":
      return ["sop-pm", "sop-static"];
    case "estimate":
      return ["sop-duct", "sop-static"];
    case "noise":
      return ["sop-no-cool", "sop-static"];
    default:
      return ["sop-safety"];
  }
}
