import { embaralharArray, obterDadosFotoGaleria } from './utils.js';
import { agruparEscolasPorAno, gerarHTMLAcordeao, inicializarAcordeaoEscolas } from './acordeao.js';
import { observarReveals } from './ui.js';

/* ========================================================================
   GALERIA DINÂMICA - ES6 MODULE
   ======================================================================== */

/**
 * Cria o modal de zoom e gerencia o comportamento do lightbox.
 */
function configurarLightbox() {
  if (!document.getElementById('lightbox')) {
    const lightboxHTML = `
      <div id="lightbox" class="lightbox-modal" role="dialog" aria-modal="true" aria-label="Visualização ampliada da foto" aria-hidden="true" inert>
        <button class="lightbox-fechar" type="button" aria-label="Fechar imagem ampliada">&times;</button>
        <img src="" alt="" id="lightbox-img">
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const btnFechar = lightbox.querySelector('.lightbox-fechar');
  const fotos = document.querySelectorAll('.foto-zoom');
  let fotoAtiva = null;
  let overflowAnterior = '';

  const abrirModal = foto => {
    fotoAtiva = foto;
    overflowAnterior = document.body.style.overflow;
    lightboxImg.src = foto.dataset.fullSrc || foto.currentSrc || foto.src;
    lightboxImg.alt = foto.alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.inert = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => btnFechar.focus());
  };

  const fecharModal = () => {
    if (!lightbox.classList.contains('active')) return;

    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.inert = true;
    document.body.style.overflow = overflowAnterior;

    if (fotoAtiva?.isConnected) fotoAtiva.focus();
    fotoAtiva = null;
  };

  fotos.forEach(foto => {
    foto.tabIndex = 0;
    foto.setAttribute('role', 'button');
    foto.setAttribute('aria-label', `Ampliar: ${foto.alt || 'foto da galeria'}`);
    foto.addEventListener('click', () => abrirModal(foto));
    foto.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        abrirModal(foto);
      }
    });
  });

  btnFechar.addEventListener('click', fecharModal);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) fecharModal();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') fecharModal();
    if (e.key === 'Tab') {
      e.preventDefault();
      btnFechar.focus();
    }
  });
}

/**
 * Carrega e renderiza a galeria de timeline a partir do JSON.
 */
export async function carregarGaleriaTimeline() {
  const containerTimeline = document.getElementById('container-timeline');
  const containerFiltros = document.getElementById('container-filtros');

  if (!containerTimeline) return;
  if (!containerFiltros) {
    containerTimeline.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Erro: container de filtros não encontrado.</p>';
    return;
  }

  try {
    const resposta = await fetch('../data/timeline.json');
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

    const dadosTimeline = await resposta.json();
    containerTimeline.innerHTML = '';
    containerFiltros.innerHTML = '';

    if (!Array.isArray(dadosTimeline) || dadosTimeline.length === 0) {
      containerTimeline.innerHTML = '<p style="color: var(--teal); text-align: center;">Nenhuma memória encontrada ainda.</p>';
      return;
    }

    const categoriasUnicas = [...new Set(dadosTimeline.map(evento => evento.categoria).filter(Boolean))];
    let filtrosHTML = `<button class="btn-filtro active" data-filtro="todos" aria-pressed="true">Todos</button>`;

    categoriasUnicas.forEach(categoria => {
      const nomeFormatado = categoria.split('-').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');
      filtrosHTML += `<button class="btn-filtro" data-filtro="${categoria}" aria-pressed="false">${nomeFormatado}</button>`;
    });
    containerFiltros.innerHTML = filtrosHTML;

    let todasAsImagens = [];
    let blocosTimelineHTML = '';
    
    // Trava de segurança para impedir imagens duplicadas na aba Todos
    const linksAdicionados = new Set(); 

    dadosTimeline.forEach(evento => {
      const categoria = evento.categoria ? evento.categoria.toLowerCase() : 'sem categoria';
      const tituloCategoria = categoria.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      let dataFormatada = evento.data;
      
      try {
        const dataObj = new Date(evento.data + 'T12:00:00');
        if (!Number.isNaN(dataObj.getTime())) {
          dataFormatada = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(dataObj);
          dataFormatada = dataFormatada.replace(' de ', ' DE ').replace(' de ', ', ').toUpperCase();
        }
      } catch (err) {}

      const fotosEvento = Array.isArray(evento.fotos) ? evento.fotos : [];

      // 1º PASSO: Coleta e Randomização sem Repetições
      fotosEvento.forEach(foto => {
        const dadosFoto = obterDadosFotoGaleria(evento, foto);
        if (!linksAdicionados.has(dadosFoto.srcCompleta)) {
            linksAdicionados.add(dadosFoto.srcCompleta); // Memoriza que esta foto já existe
            todasAsImagens.push({
              ...dadosFoto,
              alt: `Foto do evento: ${tituloCategoria} em ${dataFormatada}`
            });
        }
      });

      // 2º PASSO: Monta a Timeline Vertical (Apenas se NÃO for escola)
      if (categoria !== 'escola' && categoria !== 'escolas') {
        const fotosHTML = fotosEvento.map(foto => {
          const dadosFoto = obterDadosFotoGaleria(evento, foto);
          const dimensoes = dadosFoto.largura && dadosFoto.altura
            ? ` width="${dadosFoto.largura}" height="${dadosFoto.altura}"`
            : '';
          return `
            <div class="gallery-item">
              <img src="${dadosFoto.srcMiniatura}" data-full-src="${dadosFoto.srcCompleta}" alt="Foto do evento ${tituloCategoria} em ${dataFormatada}" loading="lazy" decoding="async"${dimensoes} class="foto-zoom">
            </div>`;
        }).join('');

        blocosTimelineHTML += `
          <div class="timeline-item reveal" data-categoria="${categoria}" style="display: none;">
            <div class="timeline-marcador"></div>
            <div class="timeline-conteudo">
              <span class="evento-data">${dataFormatada}</span>
              <h3 class="evento-titulo">${tituloCategoria}</h3>
              <div class="gallery-grid">
                ${fotosHTML}
              </div>
            </div>
          </div>`;
      }
    });

    const escolasPorAno = agruparEscolasPorAno(dadosTimeline);
    const blocoEscolasHTML = gerarHTMLAcordeao(escolasPorAno);

const imagensEmbaralhadas = embaralharArray(todasAsImagens); 

    let htmlFotosAleatorias = imagensEmbaralhadas.map((item, index) => {
      const carregamento = index < 12 ? 'eager' : 'lazy';
      const dimensoes = item.largura && item.altura
        ? ` width="${item.largura}" height="${item.altura}"`
        : '';

      return `
    <div class="gallery-item">
      <img src="${item.srcMiniatura}" data-full-src="${item.srcCompleta}" alt="${item.alt}" class="foto-zoom" loading="${carregamento}" decoding="async"${dimensoes}>
    </div>
    `;
    }).join('');

    const blocoTodosHTML = `
      <div id="grid-todos" class="reveal" style="display: block;">
        <div class="gallery-grid">
          ${htmlFotosAleatorias}
        </div>
      </div>
    `;

    // Injeta tudo no DOM
    containerTimeline.innerHTML = blocoTodosHTML + blocoEscolasHTML + blocosTimelineHTML;
    containerTimeline.classList.add('no-timeline');

    const botoesFiltro = containerFiltros.querySelectorAll('.btn-filtro');
    const eventosTimeline = containerTimeline.querySelectorAll('.timeline-item');
    const containerTodos = document.getElementById('grid-todos');
    const containerAcordeaoEscolas = document.getElementById('container-acordeao-escolas');

    // Inicializa o acordeão mas força ele a começar ESCONDIDO
    if (containerAcordeaoEscolas) {
        containerAcordeaoEscolas.style.display = 'none';
    }

    botoesFiltro.forEach(botao => {
      botao.addEventListener('click', () => {
        botoesFiltro.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        botao.classList.add('active');
        botao.setAttribute('aria-pressed', 'true');

        const filtroEscolhido = botao.getAttribute('data-filtro').toLowerCase();

        containerTodos.style.display = 'none';
        if (containerAcordeaoEscolas) containerAcordeaoEscolas.style.display = 'none';
        eventosTimeline.forEach(evento => evento.style.display = 'none');

        if (filtroEscolhido === 'todos') {
          containerTodos.style.display = 'block';
          containerTimeline.classList.add('no-timeline');
        } else if (filtroEscolhido === 'escola' || filtroEscolhido === 'escolas') {
          if (containerAcordeaoEscolas) containerAcordeaoEscolas.style.display = 'block';
          containerTimeline.classList.add('no-timeline');
        } else {
          containerTimeline.classList.remove('no-timeline');
          eventosTimeline.forEach(evento => {
            if (evento.getAttribute('data-categoria').toLowerCase() === filtroEscolhido) {
              evento.style.display = 'block';
            }
          });
        }
      });
    });

    inicializarAcordeaoEscolas(containerAcordeaoEscolas);
    configurarLightbox();
    observarReveals(document);

    // TRUQUE FINAL: Clica automaticamente no botão "Todos" para garantir que o layout comece limpo
    const botaoAbaTodos = containerFiltros.querySelector('[data-filtro="todos"]');
    if (botaoAbaTodos) {
        botaoAbaTodos.click();
    }

  } catch (erro) {
    console.error('Erro ao carregar o timeline.json:', erro);
  }
}
