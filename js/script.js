/* ==========================================================================
   CARREGAMENTO DINÂMICO (HEADER E FOOTER)
   ========================================================================== */

// Verifica se a página atual está dentro da subpasta '/paginas/'
const isInSubfolder = window.location.pathname.includes('/paginas/');

// Função genérica para buscar o HTML e injetar na página
function carregarComponente(elementId, fileName, callback = null) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  // Ajusta o caminho do arquivo caso o usuário esteja em uma subpasta
  const fetchPath = isInSubfolder ? `../${fileName}` : fileName;

  fetch(fetchPath)
    .then(response => {
      if (!response.ok) throw new Error(`Erro ao carregar ${fileName}`);
      return response.text();
    })
    .then(htmlContent => {
      elemento.innerHTML = htmlContent; // Injeta o código na página
      
      // Se estiver numa subpasta, corrige os links relativos do componente injetado
      if (isInSubfolder) corrigirCaminhos(elemento);

      // Executa scripts dependentes (como Tema e Menu Ativo) após a injeção
      if (callback) callback();
    })
    .catch(error => console.error(error));
}

// Função para ajustar caminhos de imagens e links em páginas filhas
function corrigirCaminhos(container) {
  container.querySelectorAll("img").forEach(img => {
    const src = img.getAttribute("src");
    if (src && src.startsWith("./")) img.src = "../" + src.substring(2);
  });

  container.querySelectorAll("a").forEach(link => {
    const href = link.getAttribute("href");
    if (href) {
      if (href === "index.html") link.href = "../index.html";
      else if (href.startsWith("./paginas/")) link.href = "./" + href.replace("./paginas/", "");
    }
  });
}

/* ==========================================================================
   FUNÇÕES DEPENDENTES DO CABEÇALHO (RODAM APÓS O FETCH)
   ========================================================================== */

function inicializarDependenciasDoCabecalho() {
  
  /* ── Tema ── */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', n);
      localStorage.setItem('mnc-theme', n);
    });
  }

  /* ── Nav ativo ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  
  const navMap = {
    'index.html': 'nav-index',
    'programa.html': 'nav-programa',
    'equipe.html': 'nav-equipe',
    'galeria.html': 'nav-galeria',
    'artigos.html': 'nav-artigos',
    'inscricao.html': 'nav-inscricao'
  };
  
  const navEl = document.getElementById(navMap[page] || 'nav-index');
  if (navEl) navEl.classList.add('active');
}

// Inicia o carregamento assim que o DOM básico estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  carregarComponente("main-header", "header.html", inicializarDependenciasDoCabecalho);
  carregarComponente("main-footer", "footer.html");
});

/* ==========================================================================
   TRANSIÇÃO PCB (ANIMAÇÃO EM CANVAS)
   ========================================================================== */

const _ov = document.getElementById('circuitOverlay');
const _cv = document.getElementById('circuitCanvas');

if (_ov && _cv) {
  const _cx = _cv.getContext('2d');
  const _T = '#ABD6CD', _L = '#C088B8', _P = '#8773A4';
  let _W, _H, _segs, _pads, _vias, _raf2;

  function _rnd(a,b){return a+Math.random()*(b-a);}
  function _pick(...a){return a[Math.floor(Math.random()*a.length)];}
  function _eio(t){return t<.5?2*t*t:-1+(4-2*t)*t;}

  function _build(){
    _W = _cv.width = window.innerWidth; 
    _H = _cv.height = window.innerHeight;
    _segs = []; _pads = []; _vias = [];
    
    const GRID = 40; 
    const snap = v => Math.round(v / GRID) * GRID;
    const DIRS = [[1,0], [0,1], [-1,0], [0,-1]];
    const nT = Math.floor((_W * _H) / 40000) + 15; 
    
    for(let t=0; t<nT; t++){
      const color = _pick(_T,_L,_P);
      const width = 2; 
      const delay = _rnd(0, .3);
      
      let x = snap(_rnd(GRID, _W - GRID));
      let y = snap(_rnd(GRID, _H - GRID));
      
      let [dx,dy] = _pick(...DIRS);
      const nS = Math.floor(_rnd(2, 4)); 
      let pts = [{x,y}];
      
      for(let s=0; s<nS; s++){
        if(s > 0) {
          const turn = Math.random() < 0.5 ? 1 : -1;
          [dx, dy] = [-dy * turn, dx * turn];
        }
        const len = snap(_rnd(100, 350)); 
        x = snap(Math.max(GRID, Math.min(_W - GRID, x + dx * len)));
        y = snap(Math.max(GRID, Math.min(_H - GRID, y + dy * len)));
        pts.push({x,y});
      }
      
      for(let i=0; i<pts.length-1; i++){
        _segs.push({
          x1:pts[i].x, y1:pts[i].y, x2:pts[i+1].x, y2:pts[i+1].y,
          color, width, delay: delay + i*.06,
          len: Math.hypot(pts[i+1].x-pts[i].x, pts[i+1].y-pts[i].y)
        });
      }
      
      _vias.push({x: pts[0].x, y: pts[0].y, r: 4, color: color, delay: delay});
      _vias.push({x: pts[pts.length-1].x, y: pts[pts.length-1].y, r: 4, color: color, delay: delay + nS*0.06});
    }
  }

  function _drawFrame(p){
    _cx.clearRect(0,0,_W,_H);
    for(const s of _segs){
      const sp = Math.max(0,Math.min(1,(p-s.delay)/.46));
      if(sp<=0)continue;
      const lx=s.x1+(s.x2-s.x1)*_eio(sp), ly=s.y1+(s.y2-s.y1)*_eio(sp);
      _cx.beginPath(); _cx.moveTo(s.x1,s.y1); _cx.lineTo(lx,ly);
      _cx.strokeStyle=s.color; _cx.lineWidth=s.width;
      _cx.globalAlpha=.55*_eio(Math.min(1,sp*2)); _cx.stroke();
      if(sp<.97){
        _cx.beginPath(); _cx.arc(lx,ly,s.width+1.2,0,Math.PI*2);
        _cx.fillStyle=s.color; _cx.globalAlpha=.9; _cx.fill();
      }
    }
    for(const pd of _pads){
      const pp = Math.max(0,Math.min(1,(p-pd.delay)/.22));
      if(pp<=0)continue;
      _cx.save(); _cx.translate(pd.x,pd.y); _cx.rotate(pd.angle);
      _cx.globalAlpha=pp*.85; _cx.fillStyle=pd.color;
      _cx.fillRect(-pd.w/2,-pd.h/2,pd.w*pp,pd.h); _cx.restore();
    }
    for(const vi of _vias){
      const vp = Math.max(0,Math.min(1,(p-vi.delay)/.2));
      if(vp<=0)continue;
      _cx.beginPath(); _cx.arc(vi.x,vi.y,vi.r+3,0,Math.PI*2);
      _cx.strokeStyle=vi.color; _cx.lineWidth=1.5; _cx.globalAlpha=vp*.6; _cx.stroke();
      _cx.beginPath(); _cx.arc(vi.x,vi.y,vi.r,0,Math.PI*2);
      _cx.strokeStyle=vi.color; _cx.lineWidth=.8; _cx.globalAlpha=vp*.9; _cx.stroke();
      _cx.beginPath(); _cx.arc(vi.x,vi.y,vi.r*.42,0,Math.PI*2);
      _cx.fillStyle='#0C1018'; _cx.globalAlpha=1; _cx.fill();
    }
    _cx.globalAlpha=1;
  }

  function _runPCB(cb){
    _build();
    _ov.classList.add('active');
    const dur=700, t0=performance.now();
    function tick(now){
      const p=Math.min(1,(now-t0)/dur);
      _drawFrame(_eio(p));
      if(p<1){_raf2=requestAnimationFrame(tick);} else{cb&&cb();}
    }
    requestAnimationFrame(tick);
  }

  function _exitPCB(){
    const dur=360, t0=performance.now();
    function tick(now){
      const p=Math.min(1,(now-t0)/dur);
      _ov.style.opacity=1-_eio(p);
      if(p<1){requestAnimationFrame(tick);}
      else{_ov.classList.remove('active'); _ov.style.opacity='';}
    }
    requestAnimationFrame(tick);
  }

  function goTo(url){
    if(_raf2)cancelAnimationFrame(_raf2);
    _runPCB(() => { window.location.href=url; });
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return; 

    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;

    e.preventDefault(); 
    goTo(href); 
  });

  window.addEventListener('pageshow', () => { setTimeout(_exitPCB,80); });
}

/* ==========================================================================
   FUNÇÕES AUXILIARES (LER MAIS)
   ========================================================================== */

function toggleSummary(button) {
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

/* ==========================================================================
   REVEAL ON SCROLL
   ========================================================================== */

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, {threshold: .1});

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));