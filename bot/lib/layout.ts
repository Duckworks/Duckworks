/**
 * Field-sketch duct layout. Sizes are a velocity rule of thumb
 * (branch 600 fpm, trunk 800 fpm), snapped up to a common round size.
 * This is not a Manual D calculation.
 */

const SIZES = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24] as const;
const BRANCH_FPM = 600;
const TRUNK_FPM = 800;
const CFM_PER_TON = 400;
const CFM_PER_SQFT = 1;

export const FIELD_DISCLAIMER =
  "Field sketch only. Not a Manual J, S, or D calculation and not a permit drawing. Confirm sizes, clearances, and code with the equipment data plate and local rules before you buy or install.";

export type Wall = "n" | "e" | "s" | "w";
export type DuctStyle = "home-run" | "trunk";

export type RoomInput = {
  name: string;
  widthFt: number;
  lengthFt: number;
  xFt: number;
  yFt: number;
};

export type LayoutInput = {
  rooms: RoomInput[];
  unit: { xFt: number; yFt: number; label?: string };
  tons?: number;
  style?: DuctStyle;
  registers?: Array<{
    room: string;
    wall: Wall;
    kind: "supply" | "return";
    cfm?: number;
  }>;
};

export type PlacedRegister = {
  room: string;
  wall: Wall;
  kind: "supply" | "return";
  cfm: number;
  diameterIn: number;
  xFt: number;
  yFt: number;
};

export type DuctRun = {
  kind: "supply" | "return" | "trunk";
  from: string;
  to: string;
  cfm: number;
  diameterIn: number;
  lengthFt: number;
};

export type RoomTakeoff = {
  name: string;
  areaSqFt: number;
  supplyCfm: number;
  returnCfm: number;
};

export type LayoutResult = {
  style: DuctStyle;
  totalCfm: number;
  tonsEquivalent: number;
  cfmBasis: string;
  branchFpm: number;
  trunkFpm: number;
  rooms: RoomTakeoff[];
  registers: PlacedRegister[];
  runs: DuctRun[];
  warnings: string[];
  disclaimer: string;
  svg: string;
};

type Point = { x: number; y: number };

type DraftRegister = {
  room: string;
  wall: Wall;
  kind: "supply" | "return";
  cfm?: number;
};

const WALLS: Wall[] = ["n", "e", "s", "w"];

export function roundDuctInches(cfm: number, fpm: number): { inches: number; capped: boolean } {
  const areaFt2 = Math.max(cfm, 1) / fpm;
  const diameterIn = Math.sqrt((4 * areaFt2) / Math.PI) * 12;
  const inches = SIZES.find((size) => size >= diameterIn - 1e-6) ?? 24;
  return { inches, capped: diameterIn > 24 };
}

export function layoutDucts(input: LayoutInput): LayoutResult {
  const warnings: string[] = [];
  const rooms = input.rooms;
  if (rooms.length === 0) {
    throw new Error("Add at least one room.");
  }
  if (rooms.length > 16) {
    throw new Error("16 rooms is the limit for one field sketch.");
  }
  const names = new Set<string>();
  for (const room of rooms) {
    if (names.has(room.name)) {
      throw new Error(`Room name "${room.name}" is used twice.`);
    }
    names.add(room.name);
    if (!(room.widthFt > 0) || !(room.lengthFt > 0)) {
      throw new Error(`Room "${room.name}" needs a positive width and length in feet.`);
    }
  }

  const byName = new Map(rooms.map((room) => [room.name, room]));
  const totalArea = rooms.reduce((sum, room) => sum + room.widthFt * room.lengthFt, 0);
  const tons = input.tons;
  const totalCfm = tons === undefined ? totalArea * CFM_PER_SQFT : tons * CFM_PER_TON;
  const cfmBasis =
    tons === undefined
      ? "1 cfm per square foot of floor, because no tonnage was given"
      : `${tons} tons × ${CFM_PER_TON} cfm per ton`;
  if (tons !== undefined && (tons < 0.5 || tons > 25)) {
    warnings.push("Tonnage is outside the usual 0.5 to 25 ton range for this sketch. Check the data plate.");
  }

  const style: DuctStyle = input.style ?? "home-run";
  const unitLabel = input.unit.label?.trim() || "air handler";
  const given = input.registers ?? [];
  for (const register of given) {
    if (!byName.has(register.room)) {
      throw new Error(`Register room "${register.room}" is not in the room list.`);
    }
    if (!WALLS.includes(register.wall)) {
      throw new Error(`Register wall "${register.wall}" must be n, e, s, or w.`);
    }
  }
  if (given.length > 40) {
    throw new Error("40 registers is the limit for one field sketch.");
  }

  const supplies = given.filter((register) => register.kind === "supply");
  const returns = given.filter((register) => register.kind === "return");
  const autoSupplies: DraftRegister[] =
    supplies.length > 0
      ? supplies
      : rooms.map((room) => ({
          room: room.name,
          wall: farthestWall(room, input.unit),
          kind: "supply",
        }));
  const largest = [...rooms].sort(
    (a, b) => b.widthFt * b.lengthFt - a.widthFt * a.lengthFt,
  )[0];
  if (largest === undefined) {
    throw new Error("Add at least one room.");
  }
  const autoReturns: DraftRegister[] =
    returns.length > 0
      ? returns
      : [
          {
            room: largest.name,
            wall: nearestWall(largest, input.unit),
            kind: "return",
          },
        ];
  if (supplies.length === 0) {
    warnings.push("No supplies were given, so each room got one supply on the wall farthest from the air handler.");
  }
  if (returns.length === 0) {
    warnings.push(`No return was given, so one return was placed in ${largest.name}.`);
  }

  const supplyShare = new Map<string, number>();
  for (const room of rooms) {
    supplyShare.set(room.name, (totalCfm * room.widthFt * room.lengthFt) / totalArea);
  }
  const explicitSupply = autoSupplies.some((register) => register.cfm !== undefined);
  if (explicitSupply) {
    warnings.push("Supply CFM you set is kept. Other supplies still split the remaining air by floor area.");
  }

  const placedSupplies = placeKind(autoSupplies, byName, supplyShare, warnings);
  const explicitReturn = autoReturns.reduce((sum, register) => sum + (register.cfm ?? 0), 0);
  const openReturns = autoReturns.filter((register) => register.cfm === undefined).length;
  const returnRemainder = openReturns === 0 ? 0 : Math.max(totalCfm - explicitReturn, 0) / openReturns;
  const returnPool = new Map<string, number>();
  for (const room of rooms) {
    const inRoom = autoReturns.filter((register) => register.room === room.name);
    const claimed = inRoom.reduce((sum, register) => sum + (register.cfm ?? 0), 0);
    const open = inRoom.filter((register) => register.cfm === undefined).length;
    returnPool.set(room.name, claimed + returnRemainder * open);
  }
  const placedReturns = placeKind(
    autoReturns.map((register) => ({ ...register, kind: "return" as const })),
    byName,
    returnPool,
    warnings,
  );
  if (explicitReturn > totalCfm + 1) {
    warnings.push("The return CFM you set is higher than the system CFM.");
  }
  if (autoReturns.length > 1 && openReturns === autoReturns.length) {
    warnings.push("Return air is split evenly across the returns you listed.");
  }

  for (const room of rooms) {
    if (!placedSupplies.some((register) => register.room === room.name)) {
      warnings.push(`${room.name} has no supply.`);
    }
  }

  const registers = [...placedSupplies, ...placedReturns];
  const runs = style === "trunk" ? trunkRuns(input, unitLabel, totalCfm, registers, warnings) : homeRuns(unitLabel, input.unit, registers);

  for (const [a, b] of roomPairs(rooms)) {
    if (overlaps(a, b)) {
      warnings.push(`${a.name} overlaps ${b.name}. Check the x and y corners.`);
    }
  }
  if (distanceToRooms(input.unit, rooms) > 80) {
    warnings.push("The air handler is more than 80 ft from the rooms. Check the coordinates.");
  }
  warnings.push("Run lengths are straight-line distances, not the path around joists.");

  const roomTakeoff: RoomTakeoff[] = rooms.map((room) => ({
    name: room.name,
    areaSqFt: round1(room.widthFt * room.lengthFt),
    supplyCfm: round1(
      placedSupplies.filter((register) => register.room === room.name).reduce((sum, register) => sum + register.cfm, 0),
    ),
    returnCfm: round1(
      placedReturns.filter((register) => register.room === room.name).reduce((sum, register) => sum + register.cfm, 0),
    ),
  }));

  return {
    style,
    totalCfm: round1(totalCfm),
    tonsEquivalent: round1(totalCfm / CFM_PER_TON),
    cfmBasis,
    branchFpm: BRANCH_FPM,
    trunkFpm: TRUNK_FPM,
    rooms: roomTakeoff,
    registers,
    runs,
    warnings,
    disclaimer: FIELD_DISCLAIMER,
    svg: renderSvg(input, unitLabel, registers, runs, style),
  };
}

function placeKind(
  registers: DraftRegister[],
  byName: Map<string, RoomInput>,
  share: Map<string, number>,
  warnings: string[],
): PlacedRegister[] {
  const counts = new Map<string, number>();
  for (const register of registers) {
    counts.set(register.room, (counts.get(register.room) ?? 0) + (register.cfm === undefined ? 1 : 0));
  }
  const explicit = new Map<string, number>();
  for (const register of registers) {
    if (register.cfm !== undefined) {
      explicit.set(register.room, (explicit.get(register.room) ?? 0) + register.cfm);
    }
  }
  const warned = new Set<string>();
  return registers.map((register) => {
    const room = byName.get(register.room);
    if (room === undefined) {
      throw new Error(`Register room "${register.room}" is not in the room list.`);
    }
    const roomShare = share.get(room.name) ?? 0;
    const claimed = explicit.get(room.name) ?? 0;
    const openCount = counts.get(room.name) ?? 0;
    const cfm =
      register.cfm ??
      (openCount === 0 ? 0 : Math.max(roomShare - claimed, 0) / openCount);
    if (register.kind === "supply" && claimed > roomShare + 1 && !warned.has(room.name)) {
      warned.add(room.name);
      warnings.push(`${room.name} supply CFM is higher than its area share.`);
    }
    const sized = roundDuctInches(cfm, BRANCH_FPM);
    if (sized.capped) {
      warnings.push(
        `A ${register.kind} in ${room.name} needs more than 24 in round at ${BRANCH_FPM} fpm. Split it.`,
      );
    }
    const point = wallPoint(room, register.wall);
    return {
      room: room.name,
      wall: register.wall,
      kind: register.kind,
      cfm: round1(cfm),
      diameterIn: sized.inches,
      xFt: round1(point.x),
      yFt: round1(point.y),
    };
  });
}

function homeRuns(
  unitLabel: string,
  unit: { xFt: number; yFt: number },
  registers: PlacedRegister[],
): DuctRun[] {
  return registers.map((register) => ({
    kind: register.kind,
    from: unitLabel,
    to: `${register.room} ${register.kind}`,
    cfm: register.cfm,
    diameterIn: register.diameterIn,
    lengthFt: round1(distance(unit, { x: register.xFt, y: register.yFt })),
  }));
}

function trunkRuns(
  input: LayoutInput,
  unitLabel: string,
  totalCfm: number,
  registers: PlacedRegister[],
  warnings: string[],
): DuctRun[] {
  const box = roomBox(input.rooms);
  const trunkY = clamp(input.unit.yFt, box.minY, box.maxY);
  const x0 = Math.min(input.unit.xFt, box.minX);
  const x1 = Math.max(input.unit.xFt, box.maxX);
  const sized = roundDuctInches(totalCfm, TRUNK_FPM);
  if (sized.capped) {
    warnings.push(`The trunk needs more than 24 in round at ${TRUNK_FPM} fpm for the full system. Split the system.`);
  }
  warnings.push("The trunk is sized for full system CFM. A real trunk is smaller past each takeoff. This sketch does not taper.");
  const trunk: DuctRun = {
    kind: "trunk",
    from: unitLabel,
    to: "main trunk",
    cfm: round1(totalCfm),
    diameterIn: sized.inches,
    lengthFt: round1(Math.abs(x1 - x0)),
  };
  const branches: DuctRun[] = registers.map((register) => ({
    kind: register.kind,
    from: "main trunk",
    to: `${register.room} ${register.kind}`,
    cfm: register.cfm,
    diameterIn: register.diameterIn,
    lengthFt: round1(Math.abs(register.yFt - trunkY)),
  }));
  return [trunk, ...branches];
}

function renderSvg(
  input: LayoutInput,
  unitLabel: string,
  registers: PlacedRegister[],
  runs: DuctRun[],
  style: DuctStyle,
): string {
  const scale = 18;
  const pad = 36;
  const box = roomBox(input.rooms);
  const points: Point[] = [
    { x: input.unit.xFt, y: input.unit.yFt },
    ...registers.map((register) => ({ x: register.xFt, y: register.yFt })),
  ];
  let minX = box.minX;
  let minY = box.minY;
  let maxX = box.maxX;
  let maxY = box.maxY;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  const width = (maxX - minX) * scale + pad * 2;
  const height = (maxY - minY) * scale + pad * 2 + 78;
  const mapX = (x: number) => pad + (x - minX) * scale;
  const mapY = (y: number) => pad + 22 + (maxY - y) * scale;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${round1(width)}" height="${round1(height)}" viewBox="0 0 ${round1(width)} ${round1(height)}" role="img">`,
  );
  parts.push(`<title>Duckworks field sketch</title>`);
  parts.push(`<rect width="100%" height="100%" fill="#f7f4ee"/>`);
  parts.push(
    `<text x="${pad}" y="22" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" fill="#1c1917">Duckworks field sketch — not an engineered plan</text>`,
  );

  if (style === "trunk") {
    const trunk = runs.find((run) => run.kind === "trunk");
    const trunkY = clamp(input.unit.yFt, box.minY, box.maxY);
    const x0 = Math.min(input.unit.xFt, box.minX);
    const x1 = Math.max(input.unit.xFt, box.maxX);
    parts.push(
      `<line x1="${mapX(input.unit.xFt)}" y1="${mapY(input.unit.yFt)}" x2="${mapX(input.unit.xFt)}" y2="${mapY(trunkY)}" stroke="#14532d" stroke-width="3"/>`,
    );
    parts.push(
      `<line x1="${mapX(x0)}" y1="${mapY(trunkY)}" x2="${mapX(x1)}" y2="${mapY(trunkY)}" stroke="#44403c" stroke-width="6" stroke-linecap="round"/>`,
    );
    if (trunk !== undefined) {
      parts.push(
        `<text x="${mapX((x0 + x1) / 2)}" y="${mapY(trunkY) - 8}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" fill="#44403c">${trunk.diameterIn} in trunk</text>`,
      );
    }
  }

  for (const room of input.rooms) {
    const x = mapX(room.xFt);
    const y = mapY(room.yFt + room.lengthFt);
    const w = room.widthFt * scale;
    const h = room.lengthFt * scale;
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fffdf8" stroke="#1c1917" stroke-width="1.5"/>`);
    parts.push(
      `<text x="${x + 8}" y="${y + 16}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#1c1917">${xml(room.name)}</text>`,
    );
    parts.push(
      `<text x="${x + 8}" y="${y + 30}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10" fill="#57534e">${room.widthFt} × ${room.lengthFt} ft</text>`,
    );
  }

  for (const register of registers) {
    const color = register.kind === "supply" ? "#c2410c" : "#1d4ed8";
    if (style === "home-run") {
      parts.push(
        `<line x1="${mapX(input.unit.xFt)}" y1="${mapY(input.unit.yFt)}" x2="${mapX(register.xFt)}" y2="${mapY(register.yFt)}" stroke="${color}" stroke-width="2"/>`,
      );
    } else {
      const trunkY = clamp(input.unit.yFt, box.minY, box.maxY);
      parts.push(
        `<line x1="${mapX(register.xFt)}" y1="${mapY(register.yFt)}" x2="${mapX(register.xFt)}" y2="${mapY(trunkY)}" stroke="${color}" stroke-width="2"/>`,
      );
    }
    parts.push(`<circle cx="${mapX(register.xFt)}" cy="${mapY(register.yFt)}" r="5" fill="${color}"/>`);
    parts.push(
      `<text x="${mapX(register.xFt) + 7}" y="${mapY(register.yFt) - 6}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10" fill="${color}">${register.diameterIn} in ${register.kind} ${register.cfm} cfm</text>`,
    );
  }

  parts.push(
    `<rect x="${mapX(input.unit.xFt) - 7}" y="${mapY(input.unit.yFt) - 7}" width="14" height="14" fill="#14532d"/>`,
  );
  parts.push(
    `<text x="${mapX(input.unit.xFt) + 12}" y="${mapY(input.unit.yFt) + 4}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" fill="#14532d">${xml(unitLabel)}</text>`,
  );

  const legendY = height - 28;
  parts.push(
    `<circle cx="${pad + 6}" cy="${legendY}" r="5" fill="#c2410c"/>`,
  );
  parts.push(
    `<text x="${pad + 16}" y="${legendY + 4}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" fill="#1c1917">supply</text>`,
  );
  parts.push(`<circle cx="${pad + 78}" cy="${legendY}" r="5" fill="#1d4ed8"/>`);
  parts.push(
    `<text x="${pad + 88}" y="${legendY + 4}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" fill="#1c1917">return</text>`,
  );
  parts.push(`<rect x="${pad + 146}" y="${legendY - 6}" width="12" height="12" fill="#14532d"/>`);
  parts.push(
    `<text x="${pad + 164}" y="${legendY + 4}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" fill="#1c1917">air handler</text>`,
  );
  parts.push(`</svg>`);
  return parts.join("");
}

function wallPoint(room: RoomInput, wall: Wall): Point {
  if (wall === "n") {
    return { x: room.xFt + room.widthFt / 2, y: room.yFt + room.lengthFt };
  }
  if (wall === "s") {
    return { x: room.xFt + room.widthFt / 2, y: room.yFt };
  }
  if (wall === "e") {
    return { x: room.xFt + room.widthFt, y: room.yFt + room.lengthFt / 2 };
  }
  return { x: room.xFt, y: room.yFt + room.lengthFt / 2 };
}

function farthestWall(room: RoomInput, unit: { xFt: number; yFt: number }): Wall {
  let best: Wall = "n";
  let bestD = -1;
  for (const wall of WALLS) {
    const point = wallPoint(room, wall);
    const d = (point.x - unit.xFt) ** 2 + (point.y - unit.yFt) ** 2;
    if (d > bestD) {
      best = wall;
      bestD = d;
    }
  }
  return best;
}

function nearestWall(room: RoomInput, unit: { xFt: number; yFt: number }): Wall {
  let best: Wall = "s";
  let bestD = Infinity;
  for (const wall of WALLS) {
    const point = wallPoint(room, wall);
    const d = (point.x - unit.xFt) ** 2 + (point.y - unit.yFt) ** 2;
    if (d < bestD) {
      best = wall;
      bestD = d;
    }
  }
  return best;
}

function roomBox(rooms: RoomInput[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const room of rooms) {
    minX = Math.min(minX, room.xFt);
    minY = Math.min(minY, room.yFt);
    maxX = Math.max(maxX, room.xFt + room.widthFt);
    maxY = Math.max(maxY, room.yFt + room.lengthFt);
  }
  return { minX, minY, maxX, maxY };
}

function distanceToRooms(unit: { xFt: number; yFt: number }, rooms: RoomInput[]): number {
  const box = roomBox(rooms);
  const x = clamp(unit.xFt, box.minX, box.maxX);
  const y = clamp(unit.yFt, box.minY, box.maxY);
  return distance(unit, { x, y });
}

function overlaps(a: RoomInput, b: RoomInput): boolean {
  const gap = 0.05;
  return (
    a.xFt < b.xFt + b.widthFt - gap &&
    a.xFt + a.widthFt > b.xFt + gap &&
    a.yFt < b.yFt + b.lengthFt - gap &&
    a.yFt + a.lengthFt > b.yFt + gap
  );
}

function roomPairs(rooms: RoomInput[]): Array<[RoomInput, RoomInput]> {
  const pairs: Array<[RoomInput, RoomInput]> = [];
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const left = rooms[i];
      const right = rooms[j];
      if (left !== undefined && right !== undefined) {
        pairs.push([left, right]);
      }
    }
  }
  return pairs;
}

function distance(a: { xFt: number; yFt: number } | Point, b: Point): number {
  const ax = "xFt" in a ? a.xFt : a.x;
  const ay = "xFt" in a ? a.yFt : a.y;
  return Math.hypot(ax - b.x, ay - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function xml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
