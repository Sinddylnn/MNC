import { isInSubfolder, corrigirCaminhos } from './utils.js';

/* ========================================================================
   INTERFACE DO USUÁRIO - ES6 MODULE
   ======================================================================== */

/**
 * Carrega um componente HTML e injeta o conteúdo no DOM.
 * @param {string} elementId - ID do elemento alvo
 * @param {string} fileName - Nome do arquivo HTML
 * @param {Function|null} callback - Callback após injeção
 */
export function carregarComponente(elementId, fileName, callback = null) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  const fetchPath = isInSubfolder ? `../${fileName}` : fileName;

  fetch(fetchPath)
    .then(response => {
      if (!response.ok) throw new Error(`Erro ao carregar ${fileName}`);
      return response.text();
    })
    .then(htmlContent => {
      elemento.innerHTML = htmlContent;
      if (isInSubfolder) corrigirCaminhos(elemento);
      if (callback) callback();
    })
    .catch(error => console.error(error));
}

/**
 * Inicializa dependências que precisam do cabeçalho injetado no DOM.
 */
export function inicializarDependenciasDoCabecalho() {
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const novoTema = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', novoTema);
      localStorage.setItem('mnc-theme', novoTema);
    });
  }

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

/**
 * Observa elementos com a classe .reveal para disparar animação ao entrar na viewport.
 * @param {ParentNode} root - Elemento raiz onde buscar elementos reveal
 */
export function observarReveals(root = document) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  root.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/**
 * Inicializa a interface global da aplicação.
 */
export function inicializarUI() {
  carregarComponente('main-header', 'header.html', inicializarDependenciasDoCabecalho);
  carregarComponente('main-footer', 'footer.html');
  observarReveals();
}
