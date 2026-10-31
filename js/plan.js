import { el, clear, remember, recall } from './dom.js';
import { parseWalkthrough, SAMPLE_WALKTHROUGH } from './parse-walkthrough.js';
import { buildPlan } from './layout.js';
import { renderPlanSvg } from './plan-svg.js';

const NOTES_KEY = 'duckworks.notes';

export function mountPlan(root) {
  let mode = 'notes';
  let traced = [];
  let draft = null;

  const notes = el('textarea', {
    id: 'walkthrough-notes',
    class: 'paste',
    rows: '9',
    spellcheck: 'false',
    'aria-label': 'Walkthrough notes',
    placeholder: 'Living room 18 x 14\nKitchen 12 x 10 open to living room\nAir handler in the garage\n3 ton heat pump',
  });
  notes.value = recall(NOTES_KEY) ?? '';

  const sketchInput = el('input', { type: 'file', accept: 'image/*', hidden: true });
  const videoInput = el('input', { type: 'file', accept: 'video/*', hidden: true });
  const sketchImg = el('img', { class: 'underlay', alt: 'Uploaded sketch', hidden: true });
  const canvas = el('canvas', { width: '720', height: '420', 'aria-label': 'Trace rooms on the sketch' });
  const video = el('video', { class: 'walkthrough', controls: true, hidden: true });
  video.setAttribute('playsinline', '');

  const nameField = field('Room name', 'room-name');
  const widthField = field('Width, feet', 'room-width', 'number');
  const depthField = field('Depth, feet', 'room-depth', 'number');
  const tonsField = field('Tons', 'plan-tons', 'number');
  const handlerField = field('Air handler room', 'plan-handler');
  const returnField = field('Return room', 'plan-return');
  const sideField = el(
    'label',
    { class: 'field' },
    'Condenser side',
    el(
      'select',
      { id: 'plan-side' },
      el('option', { value: 'east' }, 'East'),
      el('option', { value: 'west' }, 'West'),
      el('option', { value: 'north' }, 'North'),
      el('option', { value: 'south' }, 'South'),
    ),
  );

  const roomList = el('ul', { class: 'room-list' });
  const pinNote = el('p', { class: 'muted pin-note' });
  const warnings = el('div', { class: 'warnings' });
  const frame = el('div', { class: 'plan-frame' });
  const tableWrap = el('div', { class: 'table-wrap' });
  const result = el('div', { class: 'plan-result' }, warnings, frame, tableWrap);

  const notesPane = el('div', { class: 'pane', 'data-pane': 'notes' }, notes);
  const sketchPane = el(
    'div',
    { class: 'pane', 'data-pane': 'sketch', hidden: true },
    el('p', { class: 'hint' }, 'Upload the napkin sketch, drag a box around each room, then type the feet. The box marks the sketch. The feet size the duct.'),
    el('div', { class: 'row' }, el('button', { type: 'button', class: 'btn', onClick: () => sketchInput.click() }, 'Upload a sketch')),
    sketchInput,
    el('div', { class: 'stage' }, sketchImg, canvas),
  );
  const videoPane = el(
    'div',
    { class: 'pane', 'data-pane': 'video', hidden: true },
    el('p', { class: 'hint' }, 'Play the walkthrough. When the camera is in a room, name it and add the feet. The pin keeps the timestamp.'),
    el('div', { class: 'row' }, el('button', { type: 'button', class: 'btn', onClick: () => videoInput.click() }, 'Open a walkthrough video')),
    videoInput,
    video,
    pinNote,
  );

  const extra = el(
    'div',
    { class: 'extras', hidden: true },
    el('div', { class: 'grid-fields' }, tonsField.label, handlerField.label, returnField.label, sideField),
  );
  const roomForm = el(
    'div',
    { class: 'room-form', hidden: true },
    el('div', { class: 'grid-fields' }, nameField.label, widthField.label, depthField.label),
    el(
      'div',
      { class: 'row' },
      el('button', { type: 'button', class: 'btn', onClick: addRoom }, 'Add this room'),
    ),
    roomList,
  );

  root.append(
    el('p', { class: 'lede' }, 'Walk the house out loud. Name the room and the feet. Duckworks turns that into a supply layout and a round-pipe starting size.'),
    el(
      'div',
      { class: 'segment', role: 'tablist', 'aria-label': 'How you captured the house' },
      segment('Notes', 'notes'),
      segment('Sketch', 'sketch'),
      segment('Video', 'video'),
    ),
    el(
      'div',
      { class: 'row' },
      el('button', { type: 'button', class: 'btn primary', onClick: build }, 'Build the plan'),
      el('button', { type: 'button', class: 'btn', onClick: loadSample }, 'Load a sample house'),
      el('button', { type: 'button', class: 'btn', onClick: download, id: 'download-plan' }, 'Download SVG'),
    ),
    notesPane,
    sketchPane,
    videoPane,
    extra,
    roomForm,
    result,
  );

  sketchInput.addEventListener('change', () => {
    const file = sketchInput.files?.[0];
    if (!file) return;
    sketchImg.src = URL.createObjectURL(file);
    sketchImg.hidden = false;
  });
  videoInput.addEventListener('change', () => {
    const file = videoInput.files?.[0];
    if (!file) return;
    video.src = URL.createObjectURL(file);
    video.hidden = false;
  });
  video.addEventListener('timeupdate', () => {
    pinNote.textContent = video.src ? `Pinned times use ${formatTime(video.currentTime)}.` : '';
  });

  bindDrawing(canvas);

  if (notes.value.trim()) build();

  function segment(label, id) {
    return el(
      'button',
      {
        type: 'button',
        class: id === 'notes' ? 'seg current' : 'seg',
        'data-mode': id,
        role: 'tab',
        'aria-selected': id === 'notes' ? 'true' : 'false',
        onClick: () => setMode(id),
      },
      label,
    );
  }

  function setMode(next) {
    mode = next;
    for (const button of root.querySelectorAll('.seg')) {
      const on = button.dataset.mode === next;
      button.classList.toggle('current', on);
      button.setAttribute('aria-selected', on ? 'true' : 'false');
    }
    notesPane.hidden = next !== 'notes';
    sketchPane.hidden = next !== 'sketch';
    videoPane.hidden = next !== 'video';
    extra.hidden = next === 'notes';
    roomForm.hidden = next === 'notes';
  }

  function loadSample() {
    setMode('notes');
    notes.value = SAMPLE_WALKTHROUGH;
    remember(NOTES_KEY, notes.value);
    build();
  }

  function addRoom() {
    const name = nameField.input.value.trim();
    const w = Number(widthField.input.value);
    const d = Number(depthField.input.value);
    if (!name || !(w >= 3) || !(d >= 3)) {
      showWarnings(['Name the room and give the width and depth in feet.']);
      return;
    }
    const stamp = mode === 'video' && video.src ? formatTime(video.currentTime || 0) : null;
    traced.push({ name, w, d, stamp });
    nameField.input.value = '';
    widthField.input.value = '';
    depthField.input.value = '';
    draft = null;
    drawSketch();
    paintRooms();
  }

  function paintRooms() {
    clear(roomList);
    traced.forEach((room, index) => {
      const label = room.stamp
        ? `${room.name} · ${room.w} × ${room.d} ft · ${room.stamp}`
        : `${room.name} · ${room.w} × ${room.d} ft`;
      roomList.append(
        el(
          'li',
          null,
          el('span', null, label),
          el(
            'button',
            {
              type: 'button',
              class: 'btn ghost',
              onClick: () => {
                traced.splice(index, 1);
                paintRooms();
              },
            },
            'Remove',
          ),
        ),
      );
    });
  }

  function build() {
    let model;
    if (mode === 'notes') {
      remember(NOTES_KEY, notes.value);
      model = parseWalkthrough(notes.value);
    } else {
      model = {
        rooms: traced.map(({ name, w, d }) => ({ name, w, d, openTo: null })),
        tons: Number(tonsField.input.value) || null,
        handlerRoom: handlerField.input.value.trim() || null,
        returnRoom: returnField.input.value.trim() || null,
        condenserSide: sideField.querySelector('select').value,
        warnings: traced.length ? [] : ['Add a room before building the plan.'],
      };
    }
    const plan = buildPlan(model);
    showWarnings(plan.warnings);
    frame.innerHTML = renderPlanSvg(plan);
    paintTable(plan);
    frame.dataset.ready = plan.rooms.length ? 'yes' : 'no';
  }

  function showWarnings(items) {
    clear(warnings);
    for (const warning of items) warnings.append(el('p', { class: 'warning' }, warning));
  }

  function paintTable(plan) {
    clear(tableWrap);
    if (!plan.rooms.length) return;
    const rows = plan.rooms.map((room) =>
      el(
        'tr',
        null,
        el('td', null, room.name),
        el('td', null, `${room.w} × ${room.d}`),
        el('td', null, room.conditioned ? String(room.cfm) : '—'),
        el('td', null, room.duct ? `${room.duct}"` : '—'),
      ),
    );
    tableWrap.append(
      el(
        'table',
        null,
        el(
          'caption',
          null,
          plan.tons
            ? `${plan.tons}-ton starting point, ${plan.totalCfm} CFM across the conditioned rooms. Branches near 600 ft/min, trunk near 900.`
            : `${plan.totalCfm} CFM from floor area. Branches near 600 ft/min, trunk near 900.`,
        ),
        el(
          'thead',
          null,
          el('tr', null, el('th', null, 'Room'), el('th', null, 'Feet'), el('th', null, 'CFM'), el('th', null, 'Round pipe')),
        ),
        el('tbody', null, rows),
      ),
      el(
        'p',
        { class: 'hint' },
        'Yellow marks are supplies. The brown grille is the return. AHU is the air handler, CU is the condenser. This is a talk-through sketch, not a permit drawing.',
      ),
    );
  }

  function download() {
    const svg = frame.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = el('a', { href: url, download: 'duckworks-duct-plan.svg' });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bindDrawing(surface) {
    const ctx = surface.getContext('2d');
    let start = null;
    const point = (event) => {
      const rect = surface.getBoundingClientRect();
      const scaleX = surface.width / rect.width;
      const scaleY = surface.height / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };
    surface.addEventListener('pointerdown', (event) => {
      surface.setPointerCapture(event.pointerId);
      start = point(event);
    });
    surface.addEventListener('pointermove', (event) => {
      if (!start) return;
      draft = { a: start, b: point(event) };
      drawSketch();
    });
    surface.addEventListener('pointerup', () => {
      start = null;
    });
    drawSketch(ctx);
  }

  function drawSketch() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e4d3a';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    if (!draft) return;
    const x = Math.min(draft.a.x, draft.b.x);
    const y = Math.min(draft.a.y, draft.b.y);
    const w = Math.abs(draft.a.x - draft.b.x);
    const h = Math.abs(draft.a.y - draft.b.y);
    ctx.strokeRect(x, y, w, h);
  }
}

function field(label, id, type = 'text') {
  const input = el('input', { id, type, inputmode: type === 'number' ? 'decimal' : 'text' });
  if (type === 'number') {
    input.min = '0';
    input.step = '0.5';
  }
  return { input, label: el('label', { class: 'field', for: id }, label, input) };
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${String(remain).padStart(2, '0')}`;
}
