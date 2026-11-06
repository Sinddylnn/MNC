import { projectHref, projectUrl } from './paths.js';

/** Os caminhos nos fragmentos são relativos à raiz, inclusive no GitHub Pages. */
export function resolveFragmentPaths(fragment) {
  for (const element of fragment.querySelectorAll('[href], [src]')) {
    for (const attribute of ['href', 'src']) {
      const value = element.getAttribute(attribute);
      if (!value || /^(?:#|\/\/|[a-z][a-z\d+.-]*:)/i.test(value)) continue;
      element.setAttribute(attribute, projectHref(value));
    }
  }
}

export async function loadIncludes() {
  await Promise.all([...document.querySelectorAll('[data-include]')].map(async container => {
    const file = container.dataset.include;
    try {
      const response = await fetch(projectUrl(file));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      if (!html.trim()) throw new Error('Fragmento vazio');
      const template = document.createElement('template');
      template.innerHTML = html;
      resolveFragmentPaths(template.content);
      container.replaceChildren(template.content);
    } catch (error) {
      console.error(`Não foi possível carregar ${file}:`, error);
      const link = document.createElement('a');
      link.href = projectHref('index.html');
      link.textContent = 'Não foi possível carregar esta seção. Voltar ao início';
      container.replaceChildren(link);
    }
  }));
}
