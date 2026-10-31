// Branch ducts are sized near 600 ft/min and the trunk near 900 ft/min,
// then snapped to a standard round-pipe size. That is a house starting
// point, not a Manual D.
const BRANCH_FPM = 600;
const TRUNK_FPM = 900;
const SIZES = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24];
const ROW_WIDTH = 100;
const UNCONDITIONED = /garage|attic|closet|mechanical|lanai|patio|shop/i;

export function roundDuctInches(cfm, fpm) {
  if (!cfm || cfm <= 0 || !fpm) return null;
  const inches = 12 * Math.sqrt((4 * (cfm / fpm)) / Math.PI);
  let best = SIZES[0];
  let bestDiff = Infinity;
  for (const size of SIZES) {
    const diff = Math.abs(size - inches);
    if (diff < bestDiff) {
      best = size;
      bestDiff = diff;
    }
  }
  return best;
}

export function findRoom(rooms, query) {
  if (!query) return null;
  const needle = String(query)
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[.,;:]+$/g, '');
  if (!needle) return null;
  return (
    rooms.find((room) => room.name.toLowerCase() === needle) ||
    rooms.find((room) => {
      const name = room.name.toLowerCase();
      return name.includes(needle) || needle.includes(name);
    }) ||
    null
  );
}

export function buildPlan(input) {
  const warnings = [...(input?.warnings ?? [])];
  const sourceRooms = Array.isArray(input?.rooms) ? input.rooms : [];
  const accepted = [];
  for (const room of sourceRooms) {
    const w = Number(room.w);
    const d = Number(room.d);
    if (!room.name || !(w >= 3 && w <= 80) || !(d >= 3 && d <= 80)) {
      warnings.push(`Skipped "${room.name || 'a room'}" because the feet were missing or out of range.`);
      continue;
    }
    accepted.push({
      name: String(room.name).trim(),
      w,
      d,
      openTo: room.openTo || null,
      conditioned: !UNCONDITIONED.test(room.name),
    });
  }

  if (!accepted.length) {
    return emptyPlan(warnings.length ? warnings : ['Add at least one room with its feet.']);
  }

  const placed = pack(accepted);
  const conditioned = placed.filter((room) => room.conditioned);
  const tons = Number(input?.tons) > 0 ? Number(input.tons) : null;
  const conditionedArea = conditioned.reduce((sum, room) => sum + room.w * room.d, 0);
  let totalCfm = 0;
  if (conditionedArea > 0) {
    totalCfm = tons ? Math.round(tons * 400) : Math.round(conditionedArea);
    const shares = allocate(
      conditioned.map((room) => room.w * room.d),
      totalCfm,
    );
    conditioned.forEach((room, index) => {
      room.area = room.w * room.d;
      room.cfm = shares[index];
      room.duct = roundDuctInches(room.cfm, BRANCH_FPM);
    });
  }
  for (const room of placed) {
    if (room.conditioned) continue;
    room.area = room.w * room.d;
    room.cfm = 0;
    room.duct = null;
  }
  if (!tons && conditionedArea > 0) {
    warnings.push(
      'No tonnage given. Airflow is 1 CFM per square foot, a cooling starting point for a hot climate.',
    );
  }
  if (!conditioned.length) {
    warnings.push('Every room looks unconditioned, so there is no supply layout yet.');
  }

  const supplies = conditioned.map((room) => ({
    room: room.name,
    x: room.x + room.w - Math.min(1.6, room.w * 0.28),
    y: room.y + room.d - Math.min(1.5, room.d * 0.32),
    cfm: room.cfm,
    duct: room.duct,
  }));

  let returnRoom = findRoom(placed, input?.returnRoom);
  if (input?.returnRoom && !returnRoom) {
    warnings.push(`No room matches "${input.returnRoom}".`);
  }
  if (!returnRoom) {
    returnRoom = [...conditioned].sort((a, b) => b.area - a.area)[0] ?? null;
    if (returnRoom && input?.returnRoom) {
      warnings.push(`Return placed in ${returnRoom.name}.`);
    }
  }

  const returns = returnRoom
    ? [
        {
          room: returnRoom.name,
          x: returnRoom.x + returnRoom.w * 0.28,
          y: returnRoom.y + Math.min(returnRoom.d * 0.72, returnRoom.d - 1.2),
          cfm: totalCfm,
          duct: roundDuctInches(totalCfm, 500),
        },
      ]
    : [];

  let handlerRoom = findRoom(placed, input?.handlerRoom);
  if (input?.handlerRoom && !handlerRoom) {
    warnings.push(`No room matches "${input.handlerRoom}" for the air handler.`);
  }
  if (!handlerRoom) {
    handlerRoom =
      placed.find((room) => !room.conditioned) || placed[placed.length - 1];
    if (!input?.handlerRoom) {
      warnings.push(`Air handler placed in ${handlerRoom.name}. Say where it sits if that is wrong.`);
    }
  }
  const handler = {
    room: handlerRoom.name,
    x: handlerRoom.x + Math.min(2.2, handlerRoom.w * 0.25),
    y: handlerRoom.y + handlerRoom.d - Math.min(1.8, handlerRoom.d * 0.28),
  };

  const boundsOfRooms = boundsFor(placed);
  const condenser = placeCondenser(boundsOfRooms, input?.condenserSide || 'east');

  let trunk = null;
  const ducts = [];
  if (supplies.length) {
    const trunkY = boundsOfRooms.minY - 2.4;
    const xs = supplies.map((supply) => supply.x);
    const gutterX = boundsOfRooms.maxX + 1.8;
    const riserBlocked = crossesOtherRoom(handler.x, trunkY, handler.y, placed, handlerRoom);
    trunk = {
      cfm: totalCfm,
      duct: roundDuctInches(totalCfm, TRUNK_FPM),
      x1: Math.min(...xs, handler.x),
      x2: Math.max(...xs, handler.x, riserBlocked ? gutterX : handler.x),
      y: trunkY,
    };
    ducts.push({
      kind: 'riser',
      room: handler.room,
      duct: trunk.duct,
      cfm: totalCfm,
      path: riserBlocked
        ? [
            { x: handler.x, y: handler.y },
            { x: gutterX, y: handler.y },
            { x: gutterX, y: trunkY },
          ]
        : [
            { x: handler.x, y: handler.y },
            { x: handler.x, y: trunkY },
          ],
    });
    for (const supply of supplies) {
      ducts.push({
        kind: 'supply',
        room: supply.room,
        duct: supply.duct,
        cfm: supply.cfm,
        path: [
          { x: supply.x, y: trunkY },
          { x: supply.x, y: supply.y },
        ],
      });
    }
  }
  if (returns.length) {
    const ret = returns[0];
    ducts.push({
      kind: 'return',
      room: ret.room,
      duct: ret.duct,
      cfm: ret.cfm,
      path: [
        { x: ret.x, y: ret.y },
        { x: ret.x, y: handler.y },
        { x: handler.x, y: handler.y },
      ],
    });
  }

  const openings = findOpenings(placed);
  const bounds = boundsFor([
    ...placed.map((room) => ({ x: room.x, y: room.y, w: room.w, d: room.d })),
    trunk
      ? { x: trunk.x1, y: trunk.y, w: trunk.x2 - trunk.x1, d: 1.2 }
      : null,
    condenser ? { x: condenser.x - 1.5, y: condenser.y - 1.5, w: 3, d: 3 } : null,
  ].filter(Boolean));

  return {
    rooms: placed,
    supplies,
    returns,
    handler,
    condenser,
    ducts,
    trunk,
    openings,
    totalCfm,
    tons,
    warnings,
    bounds,
  };
}

function emptyPlan(warnings) {
  return {
    rooms: [],
    supplies: [],
    returns: [],
    handler: null,
    condenser: null,
    ducts: [],
    trunk: null,
    openings: [],
    totalCfm: 0,
    tons: null,
    warnings,
    bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
  };
}

function pack(rooms) {
  let x = 0;
  let y = 0;
  let rowDepth = 0;
  return rooms.map((room) => {
    if (x > 0 && x + room.w > ROW_WIDTH) {
      y += rowDepth;
      x = 0;
      rowDepth = 0;
    }
    const placed = { ...room, x, y, area: room.w * room.d };
    x += room.w;
    rowDepth = Math.max(rowDepth, room.d);
    return placed;
  });
}

function allocate(weights, total) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!sum) return weights.map(() => 0);
  const raw = weights.map((weight) => (total * weight) / sum);
  const base = raw.map((value) => Math.floor(value));
  let left = total - base.reduce((a, b) => a + b, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (let i = 0; i < order.length && left > 0; i += 1) {
    base[order[i].index] += 1;
    left -= 1;
  }
  return base;
}

function findOpenings(rooms) {
  const openings = [];
  for (const room of rooms) {
    if (!room.openTo) continue;
    const other = findRoom(rooms, room.openTo);
    if (!other || other === room) continue;
    const edge = sharedEdge(room, other);
    if (edge) openings.push(edge);
  }
  return openings;
}

function sharedEdge(a, b) {
  const vertical = touching(a.x + a.w, b.x) || touching(b.x + b.w, a.x);
  if (vertical) {
    const x = touching(a.x + a.w, b.x) ? b.x : a.x;
    const y1 = Math.max(a.y, b.y);
    const y2 = Math.min(a.y + a.d, b.y + b.d);
    if (y2 - y1 >= 2) {
      const inset = Math.min(1.4, (y2 - y1) / 5);
      return { x1: x, y1: y1 + inset, x2: x, y2: y2 - inset };
    }
  }
  const horizontal = touching(a.y + a.d, b.y) || touching(b.y + b.d, a.y);
  if (horizontal) {
    const y = touching(a.y + a.d, b.y) ? b.y : a.y;
    const x1 = Math.max(a.x, b.x);
    const x2 = Math.min(a.x + a.w, b.x + b.w);
    if (x2 - x1 >= 2) {
      const inset = Math.min(1.4, (x2 - x1) / 5);
      return { x1: x1 + inset, y1: y, x2: x2 - inset, y2: y };
    }
  }
  return null;
}

function touching(a, b) {
  return Math.abs(a - b) < 0.2;
}

function crossesOtherRoom(x, y1, y2, rooms, ownRoom) {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  return rooms.some((room) => {
    if (room === ownRoom) return false;
    const xInside = x >= room.x + 0.05 && x <= room.x + room.w - 0.05;
    const yOverlap = room.y < bottom - 0.05 && room.y + room.d > top + 0.05;
    return xInside && yOverlap;
  });
}

function placeCondenser(bounds, side) {
  const midY = (bounds.minY + bounds.maxY) / 2;
  const midX = (bounds.minX + bounds.maxX) / 2;
  if (side === 'north') return { side, x: midX, y: bounds.minY - 5.5 };
  if (side === 'south') return { side, x: midX, y: bounds.maxY + 4 };
  if (side === 'west') return { side, x: bounds.minX - 4.5, y: midY };
  return { side: 'east', x: bounds.maxX + 4.5, y: midY };
}

function boundsFor(boxes) {
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + (box.w ?? 0)));
  const maxY = Math.max(...boxes.map((box) => box.y + (box.d ?? 0)));
  return { minX, minY, maxX, maxY };
}
