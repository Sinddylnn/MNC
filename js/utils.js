/* ========================================================================
   UTILIDADES GENÉRICAS - ES6 MODULE
   ======================================================================== */

/**
 * Detecta se a página atual está dentro da subpasta '/paginas/'.
 * Isso é usado para ajustar caminhos relativos em subpáginas.
 * @returns {boolean}
 */
export const isInSubfolder = window.location.pathname.includes('/paginas/');

/**
 * Embaralha um array usando o algoritmo Fisher-Yates.
 * @param {Array} array - Array a ser embaralhado
 * @returns {Array} O mesmo array embaralhado
 */
export function embaralharArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Resolve a imagem completa, a miniatura e as dimensões registradas na timeline.
 * Mantém compatibilidade com arquivos JSON antigos, que possuem apenas o nome.
 * @param {Object} evento
 * @param {string|Object} foto
 * @returns {{arquivo: string, srcCompleta: string, srcMiniatura: string, largura: number|null, altura: number|null}}
 */
export function obterDadosFotoGaleria(evento, foto) {
  const arquivo = typeof foto === 'string' ? foto : foto?.arquivo;
  const metadados = typeof foto === 'object' && foto !== null
    ? foto
    : evento.metadados?.[arquivo] || {};
  const caminhoRelativo = `${evento.caminho_relativo}/${arquivo}`;
  const largura = Number(metadados.largura) || null;
  const altura = Number(metadados.altura) || null;

  return {
    arquivo,
    srcCompleta: `../imagens/galeria/${caminhoRelativo}`,
    srcMiniatura: metadados.miniatura
      ? `../imagens/miniaturas/${metadados.miniatura}`
      : `../imagens/galeria/${caminhoRelativo}`,
    largura,
    altura
  };
}

/**
 * Ajusta caminhos de imagens e links quando carregados de páginas filhas.
 * @param {HTMLElement} container - Elemento que contém imagens e links
 */
export function corrigirCaminhos(container) {
  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('./')) {
      img.src = '../' + src.substring(2);
    }
  });

  container.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href === 'index.html') {
      link.href = '../index.html';
    } else if (href.startsWith('./paginas/')) {
      link.href = './' + href.replace('./paginas/', '');
    }
  });
}

/**
 * Expande ou encolhe o texto do resumo de um card de artigo.
 * Exposto aqui para manter acesso em páginas que usam onclick inline.
 * @param {HTMLElement} button - O botão clicado
 */
export function toggleSummary(button) {
  const card = button.closest('.article-card');
  const summary = card.querySelector('.article-summary');

  if (summary.style.display === 'none' || summary.style.display === '') {
    summary.style.display = 'block';
    button.textContent = 'Ler menos';
  } else {
    summary.style.display = 'none';
    button.textContent = 'Ler mais';
  }
}
