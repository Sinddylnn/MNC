export function init() {
  const list = document.querySelector('.publications-list');
  if (!list) return;

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-action="toggle-summary"]');
    if (!button || !list.contains(button)) return;

    const summary = button.closest('.article-card')?.querySelector('.article-summary');
    if (!summary) return;

    const expanded = button.getAttribute('aria-expanded') === 'true';
    summary.hidden = expanded;
    button.setAttribute('aria-expanded', String(!expanded));
    button.textContent = expanded ? 'Ler mais' : 'Ler menos';
  });
}
