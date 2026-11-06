import { projectHref } from '../../core/paths.js';
import { groupSchoolsByYear, shuffle, uniquePhotos } from './model.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function photoHtml(photo, alt, loading = 'lazy', reveal = false) {
  const dimensions = photo.width && photo.height
    ? ` width="${photo.width}" height="${photo.height}"`
    : '';
  const revealClass = reveal ? ' reveal' : '';
  return `
    <div class="gallery-item${revealClass}">
      <img src="${projectHref(photo.thumbnailPath)}" data-full-src="${projectHref(photo.fullPath)}" alt="${escapeHtml(alt)}" class="foto-zoom" loading="${loading}" decoding="async"${dimensions}>
    </div>`;
}

export function renderFilters(container, events) {
  const categories = [...new Set(events.map(event => event.category))];
  container.innerHTML = [
    '<button class="btn-filtro active" type="button" data-filter="todos" aria-pressed="true">Todos</button>',
    ...categories.map(category => (
      `<button class="btn-filtro" type="button" data-filter="${escapeHtml(category)}" aria-pressed="false">${escapeHtml(events.find(event => event.category === category).categoryTitle)}</button>`
    ))
  ].join('');
}

function renderAll(events) {
  const photos = shuffle(uniquePhotos(events));
  return `
    <div id="grid-todos" class="gallery-view reveal" data-gallery-view="todos">
      <div class="gallery-grid">
        ${photos.map((photo, index) => photoHtml(photo, photo.alt, index < 12 ? 'eager' : 'lazy')).join('')}
      </div>
    </div>`;
}

function renderSchools(events) {
  const groups = groupSchoolsByYear(events);
  const years = [...groups.entries()].map(([year, photos]) => {
    const buttonId = `botao-escolas-${year}`;
    const regionId = `galeria-escolas-${year}`;
    return `
      <div class="acordeao-ano-container">
        <button class="acordeao-ano-btn" type="button" id="${buttonId}" data-action="toggle-school-year" aria-expanded="false" aria-controls="${regionId}">
          <span class="acordeao-ano-label">Turma de ${escapeHtml(year)}</span>
          <span class="acordeao-icone" aria-hidden="true">+</span>
        </button>
        <div class="acordeao-ano-galeria" id="${regionId}" role="region" aria-labelledby="${buttonId}" hidden>
          <div class="gallery-grid">
            ${shuffle(photos).map(photo => photoHtml(photo, `Projeto Escolas ${year}`, 'lazy', true)).join('')}
          </div>
        </div>
      </div>`;
  }).join('');

  return `<div id="container-acordeao-escolas" class="acordeao-escolas gallery-view" data-gallery-view="escolas" hidden>${years}</div>`;
}

function renderTimeline(events) {
  return events
    .filter(event => !['escola', 'escolas'].includes(event.category))
    .map(event => `
      <div class="timeline-item reveal gallery-view" data-gallery-view="${escapeHtml(event.category)}" hidden>
        <div class="timeline-marcador"></div>
        <div class="timeline-conteudo">
          <span class="evento-data">${escapeHtml(event.formattedDate)}</span>
          <h3 class="evento-titulo">${escapeHtml(event.categoryTitle)}</h3>
          <div class="gallery-grid">
            ${event.photos.map(photo => photoHtml(photo, `Foto do evento ${event.categoryTitle} em ${event.formattedDate}`)).join('')}
          </div>
        </div>
      </div>`)
    .join('');
}

export function renderGallery(container, events) {
  container.innerHTML = renderAll(events) + renderSchools(events) + renderTimeline(events);
  container.classList.add('no-timeline');
}

export function renderMessage(container, message, type = 'empty') {
  container.innerHTML = `<p class="gallery-message gallery-message--${type}" role="status">${escapeHtml(message)}</p>`;
}
