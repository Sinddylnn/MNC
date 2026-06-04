import { inicializarUI } from './ui.js';
import { inicializarAnimacoes } from './animacoes.js';
import { carregarGaleriaTimeline } from './galeria.js';
import { toggleSummary } from './utils.js';

/* ========================================================================
   MAIN ENTRYPOINT - ES6 MODULE
   ======================================================================== */

window.toggleSummary = toggleSummary;

/**
 * Inicializa a aplicação assim que o DOM estiver pronto.
 */
document.addEventListener('DOMContentLoaded', () => {
  inicializarUI();
  inicializarAnimacoes();
  carregarGaleriaTimeline();
});
