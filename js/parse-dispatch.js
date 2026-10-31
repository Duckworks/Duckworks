const TIME_LINE =
  /^\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?(?:\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?)?\s*$/i;

const LABELS = [
  ['customer', /^(?:customer|homeowner|client|name)\s*[:\-]\s*(.+)$/i],
  ['phone', /^(?:phone|cell|mobile|tel)\s*[:\-]\s*(.+)$/i],
  ['address', /^(?:address|location|site|service address)\s*[:\-]\s*(.+)$/i],
  ['system', /^(?:system|equipment|unit|model)\s*[:\-]\s*(.+)$/i],
  ['complaint', /^(?:complaint|issue|problem|reason|symptom|call type)\s*[:\-]\s*(.+)$/i],
  ['access', /^(?:access|gate|gate code|notes?|pets?|arrival notes?)\s*[:\-]\s*(.+)$/i],
];

const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const ZIP_RE = /\b\d{5}(?:-\d{4})?\b/;

export const SAMPLE_DISPATCH = `Saturday route

7:30-8:30 AM
Customer: Maria Alvarez
Address: 418 Sample Ave, Largo, FL 33778
Phone: 727-555-0148
System: 2016 Carrier 3-ton heat pump
Complaint: No cool. Indoor fan runs, outdoor unit silent.
Access: Gate code 4451. Dog in the backyard.

10:00-11:30 AM
Customer: James Okonkwo
Address: 92 Harbor Sample Dr, Seminole, FL 33777
Phone: 727-555-0194
System: 2019 Rheem 4-ton split
Complaint: Maintenance tune-up, filter overdue.
Access: Lockbox 2214

1:15-2:30 PM
Customer: Priya Shah
Address: 1500 Example Blvd, Clearwater, FL 33764
Phone: 727-555-0172
System: 2012 Lennox heat pump, two zones
Complaint: Upstairs stays hot. Weak airflow at the bedroom supplies.
Access: Call on arrival. Attic pull-down in the garage.
`;

export function parseDispatch(raw, options = {}) {
  const text = extractBody(String(raw ?? ''));
  const jobs = splitJobs(text)
    .map((block, order) => parseJob(block, order))
    .filter(isJob)
    .sort((a, b) => {
      if (a.startMinutes == null && b.startMinutes == null) return a.order - b.order;
      if (a.startMinutes == null) return 1;
      if (b.startMinutes == null) return -1;
      return a.startMinutes - b.startMinutes || a.order - b.order;
    });

  const now = options.now instanceof Date ? options.now : new Date();
  return {
    dateLabel: now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
    jobs,
    summary: summarizeJobs(jobs),
    warnings: jobs.length
      ? []
      : ['No stops in that paste. Include a customer, an address, or the complaint.'],
  };
}

export function summarizeJobs(jobs) {
  const stages = [];
  const seen = new Set();
  for (const job of jobs) {
    for (const item of job.stage) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      stages.push(item);
    }
  }
  return {
    stops: jobs.length,
    first: jobs[0]?.window ?? null,
    stages,
  };
}

export function categorize(complaint) {
  const text = String(complaint ?? '').toLowerCase();
  if (/maintenance|tune[ -]?up|\bpm\b|check-?up|service agreement/.test(text)) return 'Maintenance';
  if (/install|change[- ]?out|replacement|new system/.test(text)) return 'Install';
  if (/water|leak|drain|overflow|condensate/.test(text)) return 'Water';
  if (/airflow|weak air|hot room|upstairs|duct|balance/.test(text)) return 'Airflow';
  if (/no heat|not heating|blows cool|blows cold|emergency heat/.test(text)) return 'No heat';
  if (/no cool|not cooling|warm air|won't cool|wont cool|a\/c|outdoor unit (?:is )?silent/.test(text)) {
    return 'No cool';
  }
  return 'Service';
}

export function stageList(category, complaint, system) {
  const text = `${complaint ?? ''} ${system ?? ''}`.toLowerCase();
  const items = [];
  if (category === 'No cool') {
    items.push('Meter', 'Capacitor matched to the nameplate', 'Contactor');
    if (/silent|dead|not running|won't start|wont start/.test(text)) {
      items.push('Outdoor disconnect and breaker, before any gauges');
    }
    if (/heat pump/.test(text)) items.push('Confirm the unit is not stuck in heat');
  } else if (category === 'No heat') {
    items.push('Meter', 'Thermostat in heat, not emergency heat by accident');
    items.push('Check whether strip heat is supposed to help this unit');
  } else if (category === 'Maintenance') {
    items.push('Filters in the sizes on the ticket', 'Coil cleaner', 'Fin comb');
    items.push('A rinse bottle for the drain');
  } else if (category === 'Airflow') {
    items.push('Filters', 'A way to read static pressure', 'Fin comb');
    items.push('Look at the duct before you touch the charge');
  } else if (category === 'Water') {
    items.push('Wet vac or a drain gun', 'Spare float switch', 'Towels');
  } else if (category === 'Install') {
    items.push('Disconnect and whip', 'Thermostat', 'Nitrogen');
    items.push('The permit packet and the line set the order calls for');
  } else {
    items.push('Meter', 'Filters');
  }
  items.push('Nameplate photo');
  return items;
}

export function extractBody(raw) {
  let text = String(raw ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const headerSplit = text.split(/\n\n/);
  if (
    headerSplit.length > 1 &&
    /^(?:from|subject|date|to|mime-version|content-type|content-transfer-encoding):/i.test(
      headerSplit[0],
    )
  ) {
    text = headerSplit.slice(1).join('\n\n');
  }
  const encoded = text.match(/=[0-9A-F]{2}/gi) || [];
  if (encoded.length >= 2) {
    text = text
      .replace(/=\n/g, '')
      .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
  if (/<\/?[a-z][^>]*>/i.test(text)) {
    text = text
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  }
  return text.trim();
}

function splitJobs(text) {
  const blocks = [];
  let current = [];
  const hasContent = () => current.some((line) => line.trim());
  for (const line of text.split('\n')) {
    const boundary =
      hasContent() &&
      (TIME_LINE.test(line) ||
        /^\s*(?:---+|\*\*\*+)\s*$/.test(line) ||
        /^\s*(?:job|wo|work order)\b/i.test(line));
    if (boundary && !/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
      blocks.push(current.join('\n'));
      current = [line];
      continue;
    }
    if (hasContent() && /^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
      blocks.push(current.join('\n'));
      current = [];
      continue;
    }
    current.push(line);
  }
  if (hasContent()) blocks.push(current.join('\n'));
  return blocks;
}

function parseJob(block, order) {
  const job = {
    order,
    customer: '',
    phone: '',
    address: '',
    system: '',
    complaint: '',
    access: '',
    window: '',
    startMinutes: null,
    category: 'Service',
    stage: [],
  };
  let lastField = null;
  for (const rawLine of block.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (TIME_LINE.test(line)) {
      job.window = clean(line);
      job.startMinutes = startMinutes(line);
      lastField = 'window';
      continue;
    }
    let matched = false;
    for (const [field, pattern] of LABELS) {
      const found = line.match(pattern);
      if (!found) continue;
      job[field] = append(job[field], clean(found[1]));
      lastField = field;
      matched = true;
      break;
    }
    if (matched) continue;
    if (!job.address && ZIP_RE.test(line) && /\d/.test(line)) {
      job.address = clean(line);
      lastField = 'address';
      continue;
    }
    if (lastField === 'complaint' || lastField === 'access' || lastField === 'system') {
      job[lastField] = append(job[lastField], clean(line));
    }
  }
  if (!job.phone) {
    const found = block.match(PHONE_RE);
    if (found) job.phone = found[0];
  }
  job.category = categorize(job.complaint);
  job.stage = stageList(job.category, job.complaint, job.system);
  return job;
}

function isJob(job) {
  return Boolean(job.address || job.customer || job.complaint);
}

function append(current, next) {
  if (!next) return current;
  if (!current) return next;
  return `${current} ${next}`;
}

function clean(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

export function startMinutes(line) {
  const match = String(line).trim().match(TIME_LINE);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const endHour = match[4] == null ? null : Number(match[4]);
  let meridian = normalizeMeridian(match[3]);
  const endMeridian = normalizeMeridian(match[6]);
  if (!meridian && endMeridian) {
    if (endMeridian === 'pm' && endHour != null && hour > endHour && hour >= 8) meridian = 'am';
    else meridian = endMeridian;
  }
  return toMinutes(hour, minute, meridian);
}

function normalizeMeridian(value) {
  if (!value) return null;
  return value.toLowerCase().startsWith('p') ? 'pm' : 'am';
}

function toMinutes(hour, minute, meridian) {
  let h = hour;
  if (meridian) {
    if (h === 12) h = meridian === 'pm' ? 12 : 0;
    else if (meridian === 'pm') h += 12;
  }
  if (h > 23 || minute > 59) return null;
  return h * 60 + minute;
}
