import { el, clear, remember, recall } from './dom.js';
import { parseDispatch, SAMPLE_DISPATCH } from './parse-dispatch.js';

const STORAGE_KEY = 'duckworks.dispatch';
const CHECK_KEY = 'duckworks.checks';

function loadChecks() {
  try {
    const parsed = JSON.parse(recall(CHECK_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function mountBrief(root) {
  const saved = recall(STORAGE_KEY);
  const state = {
    text: saved ?? '',
    checks: loadChecks(),
  };

  const date = el('p', { class: 'date', id: 'brief-date' });
  const lede = el(
    'p',
    { class: 'lede' },
    'Paste this morning’s dispatch. Duckworks pulls the stops, the complaint, and what to put on the truck.',
  );
  const banner = el('p', { class: 'banner', hidden: true });
  const textarea = el('textarea', {
    id: 'dispatch-text',
    class: 'paste',
    rows: '8',
    spellcheck: 'false',
    'aria-label': 'Dispatch email',
    placeholder:
      '7:30-8:30 AM\nCustomer: …\nAddress: …\nSystem: …\nComplaint: …\nAccess: …',
  });
  textarea.value = state.text;

  const board = el('div', { id: 'brief-board' });
  const warnings = el('div', { class: 'warnings' });

  const file = el('input', { type: 'file', accept: '.txt,.eml,.html,text/plain', hidden: true });

  root.append(
    date,
    lede,
    el(
      'div',
      { class: 'row' },
      el('button', { type: 'button', class: 'btn primary', onClick: () => render(textarea.value) }, 'Build the board'),
      el('button', { type: 'button', class: 'btn', onClick: () => render(SAMPLE_DISPATCH, { sample: true }) }, 'Load a sample route'),
      el('button', { type: 'button', class: 'btn', onClick: () => file.click() }, 'Open a file'),
      el('button', { type: 'button', class: 'btn ghost', onClick: clearBoard }, 'Clear'),
    ),
    file,
    banner,
    textarea,
    warnings,
    board,
  );

  textarea.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') render(textarea.value);
  });
  file.addEventListener('change', async () => {
    const picked = file.files?.[0];
    if (!picked) return;
    render(await picked.text());
    file.value = '';
  });
  root.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  root.addEventListener('drop', async (event) => {
    const dropped = event.dataTransfer?.files?.[0];
    if (!dropped) return;
    event.preventDefault();
    render(await dropped.text());
  });

  if (state.text.trim()) render(state.text);
  else showEmpty();

  function clearBoard() {
    textarea.value = '';
    state.checks.clear();
    persistChecks();
    remember(STORAGE_KEY, '');
    showEmpty();
  }

  function showEmpty() {
    date.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    banner.hidden = true;
    clear(warnings);
    clear(board);
    board.append(
      el(
        'div',
        { class: 'empty' },
        el('h2', null, 'Nothing on the board yet'),
        el(
          'p',
          null,
          'Drop the dispatch email, paste it, or load a sample Saturday route to see the shape of a morning.',
        ),
      ),
    );
  }

  function render(text, options = {}) {
    textarea.value = text;
    remember(STORAGE_KEY, text);
    const parsed = parseDispatch(text);
    date.textContent = parsed.dateLabel;
    banner.hidden = !options.sample && text.trim() !== SAMPLE_DISPATCH.trim();
    if (!banner.hidden) {
      banner.textContent = 'Sample route. It is not from your inbox. Paste today’s dispatch to replace it.';
    }
    clear(warnings);
    for (const warning of parsed.warnings) warnings.append(el('p', { class: 'warning' }, warning));
    clear(board);
    if (!parsed.jobs.length) {
      showEmpty();
      warnings.replaceChildren(...parsed.warnings.map((warning) => el('p', { class: 'warning' }, warning)));
      return;
    }
    board.append(summary(parsed), ...parsed.jobs.map((job) => jobCard(job)));
  }

  function summary(parsed) {
    const { summary: rollup } = parsed;
    return el(
      'section',
      { class: 'summary', 'aria-label': 'Morning heads-up' },
      el(
        'div',
        { class: 'facts' },
        fact('Stops', String(rollup.stops)),
        fact('First window', rollup.first || 'Not listed'),
        fact('To stage', String(rollup.stages.length)),
      ),
      el('h2', null, 'On the truck before the first stop'),
      el(
        'ul',
        { class: 'truck' },
        rollup.stages.map((item) => el('li', null, item)),
      ),
    );
  }

  function fact(label, value) {
    return el('div', { class: 'fact' }, el('span', null, label), el('strong', null, value));
  }

  function jobCard(job) {
    const slug = job.category.toLowerCase().replace(/\s+/g, '');
    return el(
      'article',
      { class: `card cat-${slug}` },
      el(
        'header',
        { class: 'card-head' },
        el('p', { class: 'window' }, job.window || 'Time not listed'),
        el('p', { class: `badge cat-${slug}` }, job.category),
      ),
      el('h2', null, job.customer || 'Customer not named'),
      job.address
        ? el(
            'a',
            {
              class: 'address',
              href: `https://maps.google.com/?q=${encodeURIComponent(job.address)}`,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            job.address,
          )
        : el('p', { class: 'muted' }, 'Address not listed'),
      job.phone
        ? el('a', { class: 'phone', href: `tel:${job.phone.replace(/[^\d+]/g, '')}` }, job.phone)
        : null,
      job.system ? el('p', { class: 'system' }, job.system) : null,
      job.complaint ? el('p', { class: 'complaint' }, job.complaint) : null,
      el('h3', null, 'Stage'),
      el(
        'ul',
        { class: 'checks' },
        job.stage.map((item) => checkItem(job, item)),
      ),
      job.access ? el('p', { class: 'access' }, el('strong', null, 'Access. '), job.access) : null,
    );
  }

  function checkItem(job, item) {
    const key = `${job.customer}|${job.address}|${item}`;
    const box = el('input', { type: 'checkbox' });
    box.checked = state.checks.has(key);
    box.addEventListener('change', () => {
      if (box.checked) state.checks.add(key);
      else state.checks.delete(key);
      persistChecks();
    });
    return el('li', null, el('label', null, box, el('span', null, item)));
  }

  function persistChecks() {
    remember(CHECK_KEY, JSON.stringify([...state.checks]));
  }
}
