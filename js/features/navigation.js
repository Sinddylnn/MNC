const pageNavigation = {
  home: 'nav-index',
  program: 'nav-programa',
  team: 'nav-equipe',
  gallery: 'nav-galeria',
  publications: 'nav-publicacoes',
  partnerships: 'nav-parcerias',
  participation: 'nav-quero-participar'
};

export function initNavigation(page = document.body.dataset.page) {
  const menuButton = document.getElementById('menuToggle');
  const menu = document.getElementById('main-nav');

  const activeLink = document.getElementById(pageNavigation[page]);
  if (activeLink) {
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }

  if (!menuButton || !menu) return;

  const closeMenu = (returnFocus = false) => {
    menu.classList.remove('open');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
    if (returnFocus) menuButton.focus();
  };

  const openMenu = () => {
    menu.classList.add('open');
    menuButton.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('menu-open');
    menu.querySelector('a')?.focus();
  };

  menuButton.addEventListener('click', () => {
    if (menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    else openMenu();
  });

  menu.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
    }
  });

  window.matchMedia('(min-width: 1201px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  // Só recolhe a navegação depois que seus controles estiverem prontos.
  menu.closest('header')?.classList.add('navigation-ready');
}
