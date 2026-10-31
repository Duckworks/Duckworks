import type { LayoutItem, WalkthroughParse } from "../types";
import { uid } from "./ids";

const ROOM_RE =
  /\b((?:living|family|great)\s*room|kitchen|dining|bed(?:room)?\s*\d*|primary(?:\s*bed(?:room)?)?|master(?:\s*bed(?:room)?)?|bath(?:room)?\s*\d*|garage|laundry|office|den|hallway|foyer|utility|closet)\b(?:[^\n.]{0,40}?)(\d{1,2}(?:\.\d+)?)\s*(?:x|by)\s*(\d{1,2}(?:\.\d+)?)/gi;

const EQUIP_RE =
  /\b(ahu|air\s*handler|furnace|package\s*unit|condenser|compressor|outdoor\s*unit|evaporator|mini[\s-]?split(?:\s*head)?|thermostat)\b(?:\s+(?:in|at|on)\s+the\s+)?([a-z0-9\s]{0,24})/gi;

const SUPPLY_RE = /\bsupply(?:\s+vents?)?\s+(?:to|in|at)\s+([a-z0-9,\sand]+)/gi;
const RETURN_RE = /\breturn(?:\s+vents?)?\s+(?:in|at|from)\s+([a-z0-9,\sand]+)/gi;

const GAP = 18;
const CANVAS_WIDTH = 680;

function cleanRoom(name: string): string {
  return name.replace(/\s+/g, " ").trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function roomKey(name: string): string {
  return cleanRoom(name).toLowerCase();
}

export function roomsOverlap(a: LayoutItem, b: LayoutItem): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function packRooms(drafts: Omit<LayoutItem, "x" | "y">[]): LayoutItem[] {
  let x = 24;
  let y = 24;
  let rowHeight = 0;
  return drafts.map((draft) => {
    if (x > 24 && x + draft.w > CANVAS_WIDTH) {
      x = 24;
      y += rowHeight + GAP;
      rowHeight = 0;
    }
    const item: LayoutItem = { ...draft, x, y };
    x += draft.w + GAP;
    rowHeight = Math.max(rowHeight, draft.h);
    return item;
  });
}

export function parseWalkthrough(text: string): WalkthroughParse {
  const extras: LayoutItem[] = [];
  const seen = new Map<string, LayoutItem>();
  const drafts: Omit<LayoutItem, "x" | "y">[] = [];
  const keys: string[] = [];

  for (const match of text.matchAll(ROOM_RE)) {
    const label = cleanRoom(match[1]);
    const key = roomKey(label);
    if (seen.has(key)) continue;
    const w = Math.max(88, Number(match[2]) * 7);
    const h = Math.max(56, Number(match[3]) * 6);
    drafts.push({
      id: uid("rm"),
      kind: "room",
      label: `${label} ${match[2]}x${match[3]}`,
      w,
      h,
    });
    keys.push(key);
    seen.set(key, { ...drafts[drafts.length - 1], x: 0, y: 0 });
  }

  const rooms = packRooms(drafts);
  rooms.forEach((room, index) => seen.set(keys[index], room));

  const findRoom = (hint: string): LayoutItem | undefined => {
    const key = roomKey(hint);
    if (seen.has(key)) return seen.get(key);
    for (const [name, item] of seen) {
      if (key.includes(name) || name.includes(key)) return item;
    }
    return rooms[0];
  };

  for (const match of text.matchAll(EQUIP_RE)) {
    const kind = match[1].toLowerCase();
    const where = (match[2] || "").trim();
    const host = findRoom(where);
    const label = cleanRoom(kind);
    extras.push({
      id: uid("eq"),
      kind: "equipment",
      label: where ? `${label} · ${cleanRoom(where)}` : label,
      x: (host?.x ?? 40) + 12,
      y: (host?.y ?? 40) + (host?.h ?? 48) - 28,
      w: 56,
      h: 20,
    });
  }

  const addVents = (blob: string, kind: "supply" | "return") => {
    const names = blob.split(/,| and /i).map((s) => s.trim()).filter(Boolean);
    for (const name of names) {
      const host = findRoom(name);
      extras.push({
        id: uid(kind === "supply" ? "sup" : "ret"),
        kind,
        label: `${kind === "supply" ? "Supply" : "Return"} · ${cleanRoom(name)}`,
        x: (host?.x ?? 32) + (kind === "supply" ? 8 : (host?.w ?? 40) - 24),
        y: (host?.y ?? 32) + 8,
        w: 16,
        h: 16,
      });
    }
  };

  for (const match of text.matchAll(SUPPLY_RE)) addVents(match[1], "supply");
  for (const match of text.matchAll(RETURN_RE)) addVents(match[1], "return");

  const ahu = extras.find((item) => /ahu|air handler|furnace/i.test(item.label));
  const supplies = extras.filter((item) => item.kind === "supply");
  if (ahu && supplies.length) {
    for (const vent of supplies) {
      extras.push({
        id: uid("duct"),
        kind: "duct",
        label: `Trunk to ${vent.label}`,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        points: [
          { x: ahu.x + ahu.w / 2, y: ahu.y },
          { x: ahu.x + ahu.w / 2, y: vent.y + 8 },
          { x: vent.x + 8, y: vent.y + 8 },
        ],
      });
    }
  }

  return {
    items: [...rooms, ...extras],
    notes: text.trim(),
  };
}
