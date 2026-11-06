export function initAccordion(container) {
  if (!container) return;

  container.addEventListener('click', event => {
    const button = event.target.closest('[data-action="toggle-school-year"]');
    if (!button || !container.contains(button)) return;

    const region = document.getElementById(button.getAttribute('aria-controls'));
    if (!region) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.classList.toggle('ativo', !expanded);
    button.setAttribute('aria-expanded', String(!expanded));
    region.hidden = expanded;
  });
}
