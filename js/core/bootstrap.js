import { initNavigation } from '../features/navigation.js';
import { observeReveals } from '../features/reveal.js';
import { initTheme } from '../features/theme.js';
import { initPageTransition } from '../features/page-transition.js';
import { loadIncludes } from './includes.js';

const pageInitializers = {
  participation: () => import('../pages/participation.js'),
  publications: () => import('../pages/publications.js'),
  gallery: () => import('../pages/gallery/index.js'),
  team: () => import('../pages/team.js')
};

export async function bootstrap() {
  await loadIncludes();
  initTheme();
  initNavigation();
  observeReveals();
  initPageTransition();

  const loadPage = pageInitializers[document.body.dataset.page];
  if (!loadPage) return;

  try {
    const pageModule = await loadPage();
    await pageModule.init?.();
  } catch (error) {
    console.error('Não foi possível inicializar a página:', error);
  }
}
