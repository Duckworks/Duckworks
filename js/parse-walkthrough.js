const ROOM_LINE =
  /^(?:room\s*[:\-]\s*)?([a-z][\w .'+-]{0,48}?)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|')?(.*)$/i;

export const SAMPLE_WALKTHROUGH = `Living room 18 x 14
Kitchen 12 x 10 open to living room
Primary bedroom 14 x 13
Bedroom 11 x 11
Hall bath 8 x 5
Garage 20 x 22
3 ton heat pump
Air handler in the garage
Condenser on the east side
Return in the living room
`;

export function parseWalkthrough(raw) {
  const warnings = [];
  const rooms = [];
  let tons = null;
  let handlerRoom = null;
  let condenserSide = null;
  let returnRoom = null;

  for (const rawLine of String(raw ?? '').split(/\n+/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const room = line.match(ROOM_LINE);
    if (room && Number(room[2]) >= 3 && Number(room[3]) >= 3) {
      const open = room[4].match(/open(?:ing)? to\s+([a-z0-9][a-z0-9 '.-]*)/i);
      rooms.push({
        name: tidyName(room[1]),
        w: Number(room[2]),
        d: Number(room[3]),
        openTo: open ? tidyName(open[1]) : null,
      });
      continue;
    }

    const ton = line.match(/(\d+(?:\.\d+)?)\s*[- ]?\s*tons?\b/i);
    if (ton) tons = Number(ton[1]);

    const handler = line.match(
      /(?:air handler|airhandler|ahu|furnace|fan coil)\b(?:.*?\b(?:in|inside)\b\s+(?:the\s+)?)([a-z0-9][a-z0-9 '.-]*)/i,
    );
    if (handler) handlerRoom = tidyName(handler[1].replace(/\b(on|along|against)\b[\s\S]*$/i, ''));

    const side = line.match(
      /(?:condenser|outdoor unit|condensing unit)\b[\s\S]*\b(north|south|east|west)\b/i,
    );
    if (side) condenserSide = side[1].toLowerCase();

    const ret = line.match(/\breturns?\b(?:.*?\b(?:in|inside)\b\s+(?:the\s+)?)([a-z0-9][a-z0-9 '.-]*)/i);
    if (ret && !/^air\b/i.test(line)) {
      returnRoom = tidyName(ret[1].replace(/\b(on|along|against)\b[\s\S]*$/i, ''));
    }
  }

  if (!rooms.length) {
    warnings.push('Name each room with the feet, like "Living room 18 x 14".');
  }
  return { rooms, tons, handlerRoom, condenserSide, returnRoom, warnings };
}

function tidyName(value) {
  return String(value)
    .replace(/[.,;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
