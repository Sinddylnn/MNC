export function initFilters(filterContainer, galleryContainer) {
  if (!filterContainer || !galleryContainer) return;

  filterContainer.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button || !filterContainer.contains(button)) return;

    filterContainer.querySelectorAll('[data-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });

    const filter = button.dataset.filter.toLowerCase();
    galleryContainer.querySelectorAll('[data-gallery-view]').forEach(view => {
      const viewName = view.dataset.galleryView;
      const visible = filter === 'todos'
        ? viewName === 'todos'
        : ['escola', 'escolas'].includes(filter)
          ? viewName === 'escolas'
          : viewName === filter;
      view.hidden = !visible;
    });

    galleryContainer.classList.toggle('no-timeline', filter === 'todos' || ['escola', 'escolas'].includes(filter));
  });
}
