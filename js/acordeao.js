import { embaralharArray, obterDadosFotoGaleria } from './utils.js';

/* ========================================================================
   ACORDEÃO ESCOLAS - ES6 MODULE
   ======================================================================== */

/**
 * Agrupa fotos da categoria "escolas" por ano.
 * @param {Array} dadosTimeline
 * @returns {Object}
 */
export function agruparEscolasPorAno(dadosTimeline) {
  const escolasPorAno = {};

  dadosTimeline.forEach(evento => {
    const categoria = evento.categoria ? evento.categoria.toLowerCase() : '';
    if (categoria !== 'escola' && categoria !== 'escolas') return;

    const ano = evento.data.substring(0, 4);
    if (!escolasPorAno[ano]) escolasPorAno[ano] = [];

    const fotosEvento = Array.isArray(evento.fotos) ? evento.fotos : [];
    fotosEvento.forEach(foto => {
      escolasPorAno[ano].push(obterDadosFotoGaleria(evento, foto));
    });
  });

  const anosOrdenados = Object.keys(escolasPorAno)
    .sort((a, b) => parseInt(b) - parseInt(a));

  const resultado = {};
  anosOrdenados.forEach(ano => {
    resultado[ano] = escolasPorAno[ano];
  });

  return resultado;
}

/**
 * Gera o HTML do acordeão agrupado por ano para a aba de escolas.
 * @param {Object} escolasPorAno
 * @returns {string}
 */
export function gerarHTMLAcordeao(escolasPorAno) {
  let htmlAcordeao = '<div id="container-acordeao-escolas" class="acordeao-escolas">';

  Object.entries(escolasPorAno).forEach(([ano, fotos]) => {
    const idBotao = `botao-escolas-${ano}`;
    const idGaleria = `galeria-escolas-${ano}`;
    const fotosEmbaralhadas = embaralharArray([...fotos]);
    const htmlFotos = fotosEmbaralhadas.map(foto => {
      const dimensoes = foto.largura && foto.altura
        ? ` width="${foto.largura}" height="${foto.altura}"`
        : '';
      return `
        <div class="gallery-item reveal">
          <img src="${foto.srcMiniatura}" data-full-src="${foto.srcCompleta}" alt="Projeto Escolas ${ano}" loading="lazy" decoding="async"${dimensoes} class="foto-zoom">
        </div>
      `;
    }).join('');

    htmlAcordeao += `
      <div class="acordeao-ano-container">
        <button class="acordeao-ano-btn" id="${idBotao}" data-ano="${ano}" aria-expanded="false" aria-controls="${idGaleria}">
          <span class="acordeao-ano-label">Turma de ${ano}</span>
          <span class="acordeao-icone" aria-hidden="true">+</span>
        </button>
        <div class="acordeao-ano-galeria" id="${idGaleria}" role="region" aria-labelledby="${idBotao}" hidden>
          <div class="gallery-grid">
            ${htmlFotos}
          </div>
        </div>
      </div>
    `;
  });

  htmlAcordeao += '</div>';
  return htmlAcordeao;
}

/**
 * Inicializa os event listeners do acordeão de escolas.
 * @param {HTMLElement} containerAcordeao
 */
export function inicializarAcordeaoEscolas(containerAcordeao) {
  if (!containerAcordeao) return;

  const botoesAcordeao = containerAcordeao.querySelectorAll('.acordeao-ano-btn');

  botoesAcordeao.forEach(botao => {
    botao.addEventListener('click', () => {
      const galeria = botao.nextElementSibling;
      const estaAberto = botao.classList.contains('ativo');

      if (estaAberto) {
        botao.classList.remove('ativo');
        botao.setAttribute('aria-expanded', 'false');
        galeria.hidden = true;
      } else {
        botao.classList.add('ativo');
        botao.setAttribute('aria-expanded', 'true');
        galeria.hidden = false;
      }
    });
  });
}
