/* ==========================================================================
   CARREGAMENTO DINÂMICO (HEADER E FOOTER)
   ========================================================================== */

// Verifica se a página atual está dentro da subpasta '/paginas/'
// Isso é crucial para ajustar os caminhos relativos de imagens e links depois.
const isInSubfolder = window.location.pathname.includes('/paginas/');

/**
 * Função genérica para buscar um arquivo HTML e injetar seu conteúdo na página.
 * @param {string} elementId - ID da tag onde o HTML será injetado (ex: 'main-header').
 * @param {string} fileName - Nome do arquivo a ser carregado (ex: 'header.html').
 * @param {Function} callback - Função opcional a ser executada após o carregamento.
 */
function carregarComponente(elementId, fileName, callback = null) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return; // Se o elemento não existir na página, encerra a função.

  // Ajusta o caminho do arquivo: adiciona '../' se o usuário estiver em uma subpasta.
  const fetchPath = isInSubfolder ? `../${fileName}` : fileName;

  // Realiza a requisição assíncrona para pegar o conteúdo do arquivo
  fetch(fetchPath)
    .then(response => {
      if (!response.ok) throw new Error(`Erro ao carregar ${fileName}`);
      return response.text();
    })
    .then(htmlContent => {
      // Injeta o código HTML dentro do elemento alvo na página
      elemento.innerHTML = htmlContent; 
      
      // Se estiver numa subpasta, corrige os links relativos do componente que acabou de ser injetado
      if (isInSubfolder) corrigirCaminhos(elemento);

      // Executa scripts dependentes (como Tema e Menu Ativo) após a injeção, se houver um callback
      if (callback) callback();
    })
    .catch(error => console.error(error));
}

/**
 * Função auxiliar para ajustar caminhos de imagens e links quando carregados de páginas filhas.
 * Impede que links quebrem ao navegar a partir de uma subpasta.
 */
function corrigirCaminhos(container) {
  // Corrige os caminhos das imagens
  container.querySelectorAll("img").forEach(img => {
    const src = img.getAttribute("src");
    // Se o caminho começar com './', troca por '../' para subir um nível no diretório
    if (src && src.startsWith("./")) img.src = "../" + src.substring(2);
  });

  // Corrige os caminhos dos links
  container.querySelectorAll("a").forEach(link => {
    const href = link.getAttribute("href");
    if (href) {
      // Se aponta para a raiz, volta uma pasta
      if (href === "index.html") link.href = "../index.html";
      // Se aponta para uma subpasta, remove o '/paginas/' para ficar relativo à própria subpasta
      else if (href.startsWith("./paginas/")) link.href = "./" + href.replace("./paginas/", "");
    }
  });
}

/* ==========================================================================
   FUNÇÕES DEPENDENTES DO CABEÇALHO (RODAM APÓS O FETCH)
   ========================================================================== */

/**
 * Inicializa lógicas que dependem dos elementos do cabeçalho já estarem na tela.
 */
function inicializarDependenciasDoCabecalho() {
  
  /* ── Alternador de Tema (Dark/Light) ── */
  const root = document.documentElement; // A tag <html>
  const themeBtn = document.getElementById('themeToggle'); // O botão de trocar o tema
  
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      // Verifica o tema atual e inverte
      const n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', n);
      // Salva a preferência no navegador do usuário para manter entre as páginas
      localStorage.setItem('mnc-theme', n);
    });
  }

  /* ── Identificador de Menu Ativo ── */
  // Pega o nome do arquivo atual (ex: 'equipe.html'). Se estiver vazio (ex: site.com/), assume 'index.html'
  const page = location.pathname.split('/').pop() || 'index.html';
  
  // Mapeia o nome do arquivo para o ID do item de menu correspondente
  const navMap = {
    'index.html': 'nav-index',
    'programa.html': 'nav-programa',
    'equipe.html': 'nav-equipe',
    'galeria.html': 'nav-galeria',
    'artigos.html': 'nav-artigos',
    'inscricao.html': 'nav-inscricao'
  };
  
  // Adiciona a classe 'active' ao link correspondente para destacá-lo no menu
  const navEl = document.getElementById(navMap[page] || 'nav-index');
  if (navEl) navEl.classList.add('active');
}

// Inicia o carregamento assim que a estrutura básica (DOM) da página estiver montada
document.addEventListener("DOMContentLoaded", () => {
  // Carrega o header e, quando terminar, inicializa o tema e o menu ativo
  carregarComponente("main-header", "header.html", inicializarDependenciasDoCabecalho);
  // Carrega o footer (não tem callback porque não possui lógica complexa)
  carregarComponente("main-footer", "footer.html");
});

/* ==========================================================================
   TRANSIÇÃO PCB (ANIMAÇÃO EM CANVAS ESTILO CIRCUITO IMPRESSO)
   ========================================================================== */

const _ov = document.getElementById('circuitOverlay'); // Camada sobreposta
const _cv = document.getElementById('circuitCanvas'); // Elemento canvas da animação

// Só executa se o HTML possuir os elementos da animação
if (_ov && _cv) {
  const _cx = _cv.getContext('2d');
  // Cores utilizadas no circuito (Trilhas, Linhas e Pads)
  const _T = '#ABD6CD', _L = '#C088B8', _P = '#8773A4';
  let _W, _H, _segs, _pads, _vias, _raf2;

  // Funções matemáticas auxiliares
  function _rnd(a,b){ return a+Math.random()*(b-a); } // Número aleatório entre a e b
  function _pick(...a){ return a[Math.floor(Math.random()*a.length)]; } // Escolhe item aleatório de um array
  function _eio(t){ return t<.5 ? 2*t*t : -1+(4-2*t)*t; } // Função de Easing (suavização de movimento) ease-in-out

  // Constrói a matemática geométrica dos circuitos para preencher a tela atual
  function _build(){
    _W = _cv.width = window.innerWidth; 
    _H = _cv.height = window.innerHeight;
    _segs = []; _pads = []; _vias = []; // Arrays para guardar trilhas, pads e vias
    
    const GRID = 40; // Tamanho da malha para o circuito parecer organizado
    const snap = v => Math.round(v / GRID) * GRID; // Arredonda posições para a grade
    const DIRS = [[1,0], [0,1], [-1,0], [0,-1]]; // Direções permitidas (cima, baixo, esquerda, direita)
    
    // Calcula a quantidade de trilhas com base no tamanho da tela
    const nT = Math.floor((_W * _H) / 40000) + 15; 
    
    // Gera as rotas (caminhos) para cada trilha
    for(let t=0; t<nT; t++){
      const color = _pick(_T,_L,_P);
      const width = 2; 
      const delay = _rnd(0, .3); // Atraso inicial para a trilha começar a crescer
      
      // Ponto de origem sorteado na tela
      let x = snap(_rnd(GRID, _W - GRID));
      let y = snap(_rnd(GRID, _H - GRID));
      
      let [dx,dy] = _pick(...DIRS); // Escolhe uma direção
      const nS = Math.floor(_rnd(2, 4)); // Quantas dobras/segmentos essa trilha terá
      let pts = [{x,y}];
      
      // Constrói os segmentos e as dobras em 90 graus
      for(let s=0; s<nS; s++){
        if(s > 0) {
          const turn = Math.random() < 0.5 ? 1 : -1;
          [dx, dy] = [-dy * turn, dx * turn]; // Faz a curva de 90 graus
        }
        const len = snap(_rnd(100, 350)); // Comprimento do segmento
        x = snap(Math.max(GRID, Math.min(_W - GRID, x + dx * len))); // Mantém dentro dos limites da tela
        y = snap(Math.max(GRID, Math.min(_H - GRID, y + dy * len)));
        pts.push({x,y});
      }
      
      // Salva os segmentos finais no array global
      for(let i=0; i<pts.length-1; i++){
        _segs.push({
          x1:pts[i].x, y1:pts[i].y, x2:pts[i+1].x, y2:pts[i+1].y,
          color, width, delay: delay + i*.06,
          len: Math.hypot(pts[i+1].x-pts[i].x, pts[i+1].y-pts[i].y)
        });
      }
      
      // Adiciona "vias" (os furinhos redondos de solda do circuito) nas pontas
      _vias.push({x: pts[0].x, y: pts[0].y, r: 4, color: color, delay: delay});
      _vias.push({x: pts[pts.length-1].x, y: pts[pts.length-1].y, r: 4, color: color, delay: delay + nS*0.06});
    }
  }

  // Renderiza um único quadro da animação com base no tempo de progresso (p)
  function _drawFrame(p){
    _cx.clearRect(0,0,_W,_H); // Limpa o quadro anterior
    
    // Desenha as linhas do circuito
    for(const s of _segs){
      const sp = Math.max(0,Math.min(1,(p-s.delay)/.46)); // Progresso deste segmento
      if(sp<=0)continue;
      
      const lx=s.x1+(s.x2-s.x1)*_eio(sp), ly=s.y1+(s.y2-s.y1)*_eio(sp);
      _cx.beginPath(); _cx.moveTo(s.x1,s.y1); _cx.lineTo(lx,ly);
      _cx.strokeStyle=s.color; _cx.lineWidth=s.width;
      _cx.globalAlpha=.55*_eio(Math.min(1,sp*2)); _cx.stroke();
      
      // Desenha o "ponteiro" brilhante crescendo na ponta da linha
      if(sp<.97){
        _cx.beginPath(); _cx.arc(lx,ly,s.width+1.2,0,Math.PI*2);
        _cx.fillStyle=s.color; _cx.globalAlpha=.9; _cx.fill();
      }
    }
    
    // Desenha as Vias (furos redondos nas extremidades das trilhas)
    for(const vi of _vias){
      const vp = Math.max(0,Math.min(1,(p-vi.delay)/.2));
      if(vp<=0)continue;
      
      _cx.beginPath(); _cx.arc(vi.x,vi.y,vi.r+3,0,Math.PI*2);
      _cx.strokeStyle=vi.color; _cx.lineWidth=1.5; _cx.globalAlpha=vp*.6; _cx.stroke();
      _cx.beginPath(); _cx.arc(vi.x,vi.y,vi.r,0,Math.PI*2);
      _cx.strokeStyle=vi.color; _cx.lineWidth=.8; _cx.globalAlpha=vp*.9; _cx.stroke();
      _cx.beginPath(); _cx.arc(vi.x,vi.y,vi.r*.42,0,Math.PI*2);
      _cx.fillStyle='#0C1018'; _cx.globalAlpha=1; _cx.fill(); // Miolo escuro
    }
    _cx.globalAlpha=1;
  }

  // Roda a animação de entrada do circuito (antes de sair da página atual)
  function _runPCB(cb){
    _build(); // Prepara as formas matemáticas
    _ov.classList.add('active'); // Mostra o canvas overlay
    const dur=700, t0=performance.now(); // Duração da animação em milissegundos
    
    function tick(now){
      const p=Math.min(1,(now-t0)/dur);
      _drawFrame(_eio(p)); // Desenha suavizado
      if(p<1){
        _raf2=requestAnimationFrame(tick); // Continua animando
      } else {
        cb&&cb(); // Ao terminar a animação (p=1), executa o callback (mudar de página)
      }
    }
    requestAnimationFrame(tick);
  }

  // Roda a animação de saída (quando a nova página abre)
  function _exitPCB(){
    const dur=360, t0=performance.now();
    function tick(now){
      const p=Math.min(1,(now-t0)/dur);
      _ov.style.opacity=1-_eio(p); // Some gradualmente
      if(p<1){
        requestAnimationFrame(tick);
      } else {
        _ov.classList.remove('active'); _ov.style.opacity=''; // Reseta estilos
      }
    }
    requestAnimationFrame(tick);
  }

  // Intercepta e gerencia o processo de ir para outra URL
  function goTo(url){
    if(_raf2)cancelAnimationFrame(_raf2); // Para animações pendentes
    _runPCB(() => { window.location.href=url; }); // Roda o circuito e MUDA a URL no final
  }

  // Interceptador de cliques em links (`<a>`)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return; 

    const href = a.getAttribute('href');
    // Ignora: links vazios, âncoras na mesma página (#), emails e links externos (http/https)
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;

    e.preventDefault(); // Impede o link de abrir direto
    goTo(href); // Manda rodar nossa função customizada com animação
  });

  // Escuta o evento de show da página (quando ela carrega ou é resgatada do cache "Voltar" do navegador)
  window.addEventListener('pageshow', () => { setTimeout(_exitPCB,80); });
}

/* ==========================================================================
   FUNÇÕES AUXILIARES (LER MAIS / LER MENOS)
   ========================================================================== */

/**
 * Expande ou encolhe o texto do resumo de um card de artigo.
 * @param {HTMLElement} button - O botão clicado, recebido via 'this' no HTML.
 */
function toggleSummary(button) {
  // Encontra o card pai que contém o botão clicado
  const card = button.closest('.article-card');
  const summary = card.querySelector('.article-summary'); // Encontra o bloco de texto
  
  // Alterna o estilo CSS de visualização e o texto do botão
  if (summary.style.display === 'none' || summary.style.display === '') {
    summary.style.display = 'block';
    button.textContent = 'Ler menos';
  } else {
    summary.style.display = 'none';
    button.textContent = 'Ler mais';
  }
}

/* ==========================================================================
   REVEAL ON SCROLL (APARECER AO ROLAR)
   ========================================================================== */

// Cria um observador de intersecção. Ele "observa" quando elementos entram na tela
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      // Quando o elemento passa a estar na viewport, adiciona a classe .visible (onde ocorre a animação no CSS)
      e.target.classList.add('visible');
      obs.unobserve(e.target); // Para de observar após aparecer a primeira vez (performance)
    }
  });
}, {threshold: .1}); // Exige que ao menos 10% do elemento esteja visível para disparar

// Aplica o observador a todos os elementos com a classe .reveal
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ==========================================================================
   GALERIA DINÂMICA (TIMELINE)
   ========================================================================== */

/**
 * Função para carregar um JSON externo e criar automaticamente a estrutura 
 * HTML da galeria estilo "linha do tempo".
 */
// Função para carregar e renderizar a galeria automaticamente
async function carregarGaleriaTimeline() {
  const containerTimeline = document.getElementById('container-timeline');
  const containerFiltros = document.getElementById('container-filtros');

  if (!containerTimeline) return;
  if (!containerFiltros) {
    containerTimeline.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Erro: container de filtros não encontrado.</p>';
    return;
  }

  try {
    const resposta = await fetch('../data/timeline.json');
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}: ${resposta.statusText}`);

    const dadosTimeline = await resposta.json();

    containerTimeline.innerHTML = '';
    containerFiltros.innerHTML = '';

    if (!Array.isArray(dadosTimeline) || dadosTimeline.length === 0) {
      containerTimeline.innerHTML = '<p style="color: var(--teal); text-align: center;">Nenhuma memória encontrada ainda.</p>';
      return;
    }

    const categoriasUnicas = [...new Set(dadosTimeline.map(evento => evento.categoria).filter(Boolean))];

    let filtrosHTML = `<button class="btn-filtro active" data-filtro="todos">Todos</button>`;
    categoriasUnicas.forEach(categoria => {
      const nomeFormatado = categoria.split('-').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');
      filtrosHTML += `<button class="btn-filtro" data-filtro="${categoria}">${nomeFormatado}</button>`;
    });
    containerFiltros.innerHTML = filtrosHTML;

    const formatadorData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    dadosTimeline.forEach(evento => {
      const categoria = evento.categoria || 'sem categoria';
      const tituloCategoria = categoria.split('-').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');

      // Pega a data do JSON e força hora ao meio-dia para evitar bug de fuso horário
      let dataFormatada = evento.data;
      try {
        const dataObj = new Date(evento.data + 'T12:00:00');
        if (!Number.isNaN(dataObj.getTime())) {
          dataFormatada = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }).format(dataObj);

          // Ajusta para o padrão de design: "11 DE MAIO, 2026"
          dataFormatada = dataFormatada.replace(' de ', ' DE ').replace(' de ', ', ').toUpperCase();
        }
      } catch (err) {
        console.warn('Formato de data inválido:', evento.data);
      }

      const fotosHTML = (Array.isArray(evento.fotos) ? evento.fotos : []).map(foto => {
        const src = `../imagens/galeria/${evento.caminho_relativo}/${foto}`;
        return `
          <div class="gallery-item">
            <img src="${src}" alt="Foto ${tituloCategoria}" loading="lazy">
          </div>`;
      }).join('');

      const blocoHTML = `
        <div class="timeline-item reveal" data-categoria="${categoria}">
          <div class="timeline-marcador"></div>
          <div class="timeline-conteudo">
            <span class="evento-data">${dataFormatada}</span>
            <h3 class="evento-titulo">${tituloCategoria}</h3>
            <div class="gallery-grid">
              ${fotosHTML}
            </div>
          </div>
        </div>`;

      containerTimeline.insertAdjacentHTML('beforeend', blocoHTML);
    });

    const botoesFiltro = containerFiltros.querySelectorAll('.btn-filtro');
    const eventosTimeline = containerTimeline.querySelectorAll('.timeline-item');

    botoesFiltro.forEach(botao => {
      botao.addEventListener('click', () => {
        botoesFiltro.forEach(b => b.classList.remove('active'));
        botao.classList.add('active');

        const filtroEscolhido = botao.getAttribute('data-filtro');
        eventosTimeline.forEach(evento => {
          const categoriaEvento = evento.getAttribute('data-categoria');
          evento.style.display = (filtroEscolhido === 'todos' || categoriaEvento === filtroEscolhido) ? '' : 'none';
        });
      });
    });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  } catch (erro) {
    console.error('Erro ao carregar o timeline.json:', erro);
    containerTimeline.innerHTML = `<p style="color: red; text-align: center; padding: 2rem;">Erro ao carregar a galeria de memórias.<br>${erro.name}: ${erro.message}</p>`;
  }
}

// Inicia o carregamento dinâmico da Galeria assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  carregarGaleriaTimeline();
});