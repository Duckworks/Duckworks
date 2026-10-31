import { remember, recall } from './dom.js';
import { mountBrief } from './brief.js';
import { mountPlan } from './plan.js';
import { mountAnswers } from './answers.js';

const tabs = ['morning', 'plan', 'answers'];

mountBrief(document.querySelector('#panel-morning'));
mountPlan(document.querySelector('#panel-plan'));
mountAnswers(document.querySelector('#panel-answers'));

document.querySelector('.tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  show(button.dataset.tab);
});

window.addEventListener('hashchange', () => show(currentTab()));
show(currentTab());

function currentTab() {
  const name = location.hash.replace('#', '').split('/')[0];
  if (tabs.includes(name)) return name;
  const saved = recall('duckworks.tab');
  return tabs.includes(saved) ? saved : 'morning';
}

function show(name) {
  for (const tab of tabs) {
    document.querySelector(`#panel-${tab}`).hidden = tab !== name;
    const button = document.querySelector(`[data-tab="${tab}"]`);
    button.setAttribute('aria-selected', tab === name ? 'true' : 'false');
  }
  remember('duckworks.tab', name);
  const hashed = location.hash.replace('#', '').split('/')[0];
  if (hashed !== name) history.replaceState(null, '', `#${name}`);
}
