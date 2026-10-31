import { escapeXml } from './escape.js';

export function renderPlanSvg(plan) {
  if (!plan?.rooms?.length) return '';
  const pad = 1.6;
  const minX = plan.bounds.minX - pad;
  const minY = plan.bounds.minY - pad;
  const width = plan.bounds.maxX - plan.bounds.minX + pad * 2;
  const height = plan.bounds.maxY - plan.bounds.minY + pad * 2 + 2.4;
  const title = planTitle(plan);
  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" role="img" aria-labelledby="duckworks-plan-title">`,
  );
  parts.push(`<title id="duckworks-plan-title">${escapeXml(title)}</title>`);
  parts.push('<rect x="' + minX + '" y="' + minY + '" width="' + width + '" height="' + height + '" fill="#efe8d8"/>');
  parts.push('<defs>');
  plan.rooms.forEach((room, index) => {
    parts.push(
      `<clipPath id="room-clip-${index}"><rect x="${room.x}" y="${room.y}" width="${room.w}" height="${room.d}"/></clipPath>`,
    );
  });
  parts.push('</defs>');

  plan.rooms.forEach((room) => {
    const fill = room.conditioned ? '#fffdf8' : '#e7e0d2';
    const dash = room.conditioned ? '' : ' stroke-dasharray="0.45 0.28"';
    parts.push(
      `<rect x="${room.x}" y="${room.y}" width="${room.w}" height="${room.d}" fill="${fill}" stroke="#1c1915" stroke-width="0.12"${dash}/>`,
    );
  });

  for (const opening of plan.openings) {
    parts.push(
      `<line x1="${opening.x1}" y1="${opening.y1}" x2="${opening.x2}" y2="${opening.y2}" stroke="#efe8d8" stroke-width="0.42" stroke-linecap="butt"/>`,
    );
  }

  if (plan.trunk) {
    parts.push(
      `<line x1="${plan.trunk.x1}" y1="${plan.trunk.y}" x2="${plan.trunk.x2}" y2="${plan.trunk.y}" stroke="#143528" stroke-width="0.34" stroke-linecap="round"/>`,
    );
    parts.push(
      `<text x="${(plan.trunk.x1 + plan.trunk.x2) / 2}" y="${plan.trunk.y - 0.35}" text-anchor="middle" font-size="0.95" fill="#143528" font-family="ui-sans-serif, sans-serif">Trunk ${plan.trunk.duct}&quot; · ${plan.trunk.cfm} CFM</text>`,
    );
  }

  for (const duct of plan.ducts) {
    const color = duct.kind === 'return' ? '#8f3d1d' : '#1e4d3a';
    const stroke = duct.kind === 'riser' ? 0.28 : duct.kind === 'return' ? 0.2 : 0.16;
    const dash = duct.kind === 'return' ? ' stroke-dasharray="0.35 0.28"' : '';
    parts.push(
      `<polyline points="${duct.path.map((point) => `${point.x},${point.y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`,
    );
  }

  plan.rooms.forEach((room, index) => {
    const compact = room.d < 7 || room.w < 11;
    parts.push(`<g clip-path="url(#room-clip-${index})">`);
    parts.push(
      `<text x="${room.x + 0.5}" y="${room.y + 1.3}" font-size="1.05" font-weight="700" fill="#1c1915" font-family="ui-sans-serif, sans-serif">${escapeXml(room.name)}</text>`,
    );
    if (!compact) {
      parts.push(
        `<text x="${room.x + 0.5}" y="${room.y + 2.45}" font-size="0.8" fill="#5c564c" font-family="ui-sans-serif, sans-serif">${room.w} × ${room.d} ft</text>`,
      );
      if (room.conditioned) {
        parts.push(
          `<text x="${room.x + 0.5}" y="${room.y + 3.45}" font-size="0.8" fill="#1e4d3a" font-family="ui-sans-serif, sans-serif">${room.cfm} cfm · ${room.duct}&quot;</text>`,
        );
      }
    }
    parts.push('</g>');
  });

  for (const supply of plan.supplies) {
    parts.push(
      `<circle cx="${supply.x}" cy="${supply.y}" r="0.62" fill="#f0b429" stroke="#1c1915" stroke-width="0.08"/>`,
    );
    parts.push(
      `<path d="M ${supply.x - 0.34} ${supply.y} H ${supply.x + 0.34} M ${supply.x} ${supply.y - 0.34} V ${supply.y + 0.34}" stroke="#1c1915" stroke-width="0.08"/>`,
    );
    parts.push(
      `<text x="${supply.x - 0.8}" y="${supply.y - 0.75}" text-anchor="end" font-size="0.72" fill="#1c1915" font-family="ui-sans-serif, sans-serif">${supply.duct}&quot;</text>`,
    );
  }

  for (const ret of plan.returns) {
    parts.push(
      `<rect x="${ret.x - 0.7}" y="${ret.y - 0.45}" width="1.4" height="0.9" fill="#fffdf8" stroke="#8f3d1d" stroke-width="0.08"/>`,
    );
    parts.push(
      `<text x="${ret.x + 0.9}" y="${ret.y + 0.2}" font-size="0.75" fill="#8f3d1d" font-family="ui-sans-serif, sans-serif">RA ${ret.duct}&quot;</text>`,
    );
  }

  if (plan.handler) {
    parts.push(
      `<rect x="${plan.handler.x - 1.15}" y="${plan.handler.y - 0.7}" width="2.3" height="1.4" rx="0.15" fill="#1e4d3a" stroke="#143528" stroke-width="0.08"/>`,
    );
    parts.push(
      `<text x="${plan.handler.x}" y="${plan.handler.y + 0.28}" text-anchor="middle" font-size="0.72" fill="#f3efe4" font-family="ui-sans-serif, sans-serif">AHU</text>`,
    );
  }

  if (plan.condenser && plan.handler) {
    parts.push(
      `<line x1="${plan.handler.x}" y1="${plan.handler.y}" x2="${plan.condenser.x}" y2="${plan.condenser.y}" stroke="#5c564c" stroke-width="0.08" stroke-dasharray="0.3 0.22"/>`,
    );
    parts.push(
      `<circle cx="${plan.condenser.x}" cy="${plan.condenser.y}" r="1.15" fill="#1c1915"/>`,
    );
    parts.push(
      `<text x="${plan.condenser.x}" y="${plan.condenser.y + 0.28}" text-anchor="middle" font-size="0.7" fill="#f3efe4" font-family="ui-sans-serif, sans-serif">CU</text>`,
    );
  }

  const scaleY = plan.bounds.maxY + 1.5;
  const scaleX = plan.bounds.minX;
  parts.push(
    `<line x1="${scaleX}" y1="${scaleY}" x2="${scaleX + 10}" y2="${scaleY}" stroke="#1c1915" stroke-width="0.1"/>`,
  );
  parts.push(
    `<text x="${scaleX}" y="${scaleY + 1}" font-size="0.8" fill="#1c1915" font-family="ui-sans-serif, sans-serif">10 ft</text>`,
  );

  parts.push('</svg>');
  return parts.join('');
}

function planTitle(plan) {
  const trunk = plan.trunk ? `Trunk ${plan.trunk.duct} inch, ${plan.trunk.cfm} CFM.` : '';
  return `Duct schematic for ${plan.rooms.length} rooms. ${trunk}`.trim();
}
