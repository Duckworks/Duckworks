import { el, clear } from './dom.js';
import { searchKnowledge } from './knowledge.js';

export function mountAnswers(root) {
  const input = el('input', {
    id: 'answer-query',
    class: 'search',
    type: 'search',
    placeholder: 'capacitor, frozen coil, float switch…',
    'aria-label': 'Ask a question',
    autocomplete: 'off',
  });
  const list = el('div', { class: 'answer-list', role: 'listbox', 'aria-label': 'Matching notes' });
  const detail = el('article', { class: 'answer', 'aria-live': 'polite' });

  root.append(
    el('p', { class: 'lede' }, 'Ask it the way you would ask the lead. Short answer first, then the checks, in order.'),
    input,
    el('div', { class: 'answer-layout' }, list, detail),
  );

  let selected = null;

  input.addEventListener('input', () => draw(input.value));
  draw('');

  function draw(query) {
    const results = searchKnowledge(query);
    if (!results.some((result) => result.item.id === selected)) {
      selected = results[0]?.item.id ?? null;
    }
    clear(list);
    if (!results.length) {
      list.append(el('p', { class: 'empty' }, 'Nothing in the notes matches that. Try the symptom, not the part number.'));
      clear(detail);
      return;
    }
    for (const result of results) {
      const button = el(
        'button',
        {
          type: 'button',
          class: result.item.id === selected ? 'hit current' : 'hit',
          role: 'option',
          'aria-selected': result.item.id === selected ? 'true' : 'false',
          onClick: () => {
            selected = result.item.id;
            draw(input.value);
          },
        },
        el('span', { class: 'hit-title' }, result.item.title),
        el('span', { class: 'hit-tags' }, result.item.tags.slice(0, 3).join(' · ')),
      );
      list.append(button);
    }
    const entry = results.find((result) => result.item.id === selected)?.item;
    show(entry);
  }

  function show(entry) {
    clear(detail);
    if (!entry) return;
    detail.append(
      el('h2', null, entry.title),
      el('p', { class: 'lead' }, entry.lead),
      el('h3', null, 'Checks'),
      el(
        'ol',
        null,
        entry.checks.map((check) => el('li', null, check)),
      ),
      el('h3', null, 'Safety'),
      el('p', null, entry.safety),
      el('h3', null, 'Stop and write it up'),
      el('p', null, entry.stop),
    );
  }
}
