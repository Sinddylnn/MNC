import { embaralharArray } from './utils.js';

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
      const urlFoto = `../imagens/galeria/${evento.caminho_relativo}/${foto}`;
      escolasPorAno[ano].push(urlFoto);
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

  Object.entries(escolasPorAno).forEach(([ano, fotosUrls]) => {
    const fotosEmbaralhadas = embaralharArray([...fotosUrls]);
    const htmlFotos = fotosEmbaralhadas.map(src => `
      <div class="gallery-item reveal">
        <img src="${src}" alt="Projeto Escolas ${ano}" loading="lazy" class="foto-zoom">
      </div>
    `).join('');

    htmlAcordeao += `
      <div class="acordeao-ano-container">
        <button class="acordeao-ano-btn" data-ano="${ano}">
          <span class="acordeao-ano-label">Turma de ${ano}</span>
          <span class="acordeao-icone">+</span>
        </button>
        <div class="acordeao-ano-galeria" role="region" aria-expanded="false">
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
        galeria.style.display = 'none';
        galeria.setAttribute('aria-expanded', 'false');
      } else {
        botao.classList.add('ativo');
        galeria.style.display = 'block';
        galeria.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
