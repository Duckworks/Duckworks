export type RoomInput = {
  name: string;
  widthFt: number;
  depthFt: number;
  notes?: string;
};

export type DuctInput = {
  from: string;
  to: string;
  sizeIn: string;
  kind: "supply" | "return" | "trunk";
};

export type LayoutInput = {
  jobLabel: string;
  rooms: RoomInput[];
  ducts?: DuctInput[];
  equipment?: string;
};

type PlacedRoom = RoomInput & { x: number; y: number };

const PX = 10;
const PAD = 36;

function wrapRooms(rooms: RoomInput[]): { placed: PlacedRoom[]; width: number; height: number } {
  const placed: PlacedRoom[] = [];
  let x = PAD;
  let y = PAD + 24;
  let rowH = 0;
  let maxX = PAD;
  const maxRow = 80 * PX;
  for (const room of rooms) {
    const w = Math.max(room.widthFt, 6) * PX;
    const h = Math.max(room.depthFt, 6) * PX;
    if (x > PAD && x + w > maxRow) {
      x = PAD;
      y += rowH + 20;
      rowH = 0;
    }
    placed.push({ ...room, x, y });
    x += w + 16;
    rowH = Math.max(rowH, h);
    maxX = Math.max(maxX, x);
  }
  return {
    placed,
    width: Math.max(maxX + PAD, 480),
    height: y + rowH + PAD + 48,
  };
}

function center(room: PlacedRoom): { x: number; y: number } {
  return {
    x: room.x + (Math.max(room.widthFt, 6) * PX) / 2,
    y: room.y + (Math.max(room.depthFt, 6) * PX) / 2,
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const DUCT_COLOR = {
  supply: "#c45c26",
  return: "#2f6f8f",
  trunk: "#1f3b4d",
};

export function renderFloorPlan(input: LayoutInput): string {
  const rooms = input.rooms.length > 0 ? input.rooms : [{ name: "Unnamed", widthFt: 12, depthFt: 12 }];
  const { placed, width, height } = wrapRooms(rooms);
  const byName = new Map(placed.map((room) => [room.name.toLowerCase(), room]));
  const ducts = input.ducts ?? [];
  const ductLines = ducts
    .map((duct) => {
      const from = byName.get(duct.from.toLowerCase());
      const to = byName.get(duct.to.toLowerCase());
      if (!from || !to) return "";
      const a = center(from);
      const b = center(to);
      const color = DUCT_COLOR[duct.kind];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${duct.kind === "trunk" ? 6 : 3}" />
      <text x="${mx}" y="${my - 6}" font-size="11" fill="${color}">${escapeXml(`${duct.kind} ${duct.sizeIn}`)}</text>`;
    })
    .join("\n");
  const roomRects = placed
    .map((room) => {
      const w = Math.max(room.widthFt, 6) * PX;
      const h = Math.max(room.depthFt, 6) * PX;
      const note = room.notes ? escapeXml(room.notes) : "";
      return `<rect x="${room.x}" y="${room.y}" width="${w}" height="${h}" fill="#f4efe6" stroke="#1f3b4d" stroke-width="2" />
      <text x="${room.x + 8}" y="${room.y + 18}" font-size="13" font-weight="700" fill="#1f3b4d">${escapeXml(room.name)}</text>
      <text x="${room.x + 8}" y="${room.y + 34}" font-size="11" fill="#5a4634">${room.widthFt}' × ${room.depthFt}'</text>
      ${note ? `<text x="${room.x + 8}" y="${room.y + 48}" font-size="10" fill="#7a5c3e">${note}</text>` : ""}`;
    })
    .join("\n");
  const equipment = input.equipment
    ? `<rect x="${PAD}" y="${height - 40}" width="220" height="24" fill="#1f3b4d" />
       <text x="${PAD + 8}" y="${height - 24}" font-size="11" fill="#f4efe6">${escapeXml(input.equipment)}</text>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fffaf2" />
  <text x="${PAD}" y="24" font-size="16" font-weight="700" fill="#1f3b4d">${escapeXml(input.jobLabel)}</text>
  <text x="${PAD}" y="${height - 8}" font-size="10" fill="#7a5c3e">Duckworks field sketch — not a stamped drawing</text>
  ${roomRects}
  ${ductLines}
  ${equipment}
</svg>
`;
}
