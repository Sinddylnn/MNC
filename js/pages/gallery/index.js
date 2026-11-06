import { observeReveals } from '../../features/reveal.js';
import { initAccordion } from './accordion.js';
import { loadTimeline } from './data.js';
import { initFilters } from './filters.js';
import { initLightbox } from './lightbox.js';
import { normalizeTimeline } from './model.js';
import { renderFilters, renderGallery, renderMessage } from './render.js';

export async function init() {
  const galleryContainer = document.getElementById('container-timeline');
  const filterContainer = document.getElementById('container-filtros');
  if (!galleryContainer || !filterContainer) return;

  try {
    const events = normalizeTimeline(await loadTimeline());
    if (events.length === 0) {
      renderMessage(galleryContainer, 'Nenhuma memória encontrada ainda.');
      return;
    }

    renderFilters(filterContainer, events);
    renderGallery(galleryContainer, events);
    initFilters(filterContainer, galleryContainer);
    initAccordion(document.getElementById('container-acordeao-escolas'));
    initLightbox(galleryContainer);
    observeReveals(galleryContainer);
  } catch (error) {
    console.error('Erro ao carregar a galeria:', error);
    renderMessage(galleryContainer, 'Não foi possível carregar as memórias.', 'error');
  }
}
