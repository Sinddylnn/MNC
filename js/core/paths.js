const projectRoot = new URL('../../', import.meta.url);

/** Resolve um caminho interno a partir da raiz do projeto. */
export function projectUrl(path = '') {
  const normalizedPath = String(path).replace(/^\.\//, '').replace(/^\//, '');
  return new URL(normalizedPath, projectRoot);
}

/** Retorna a URL absoluta de um recurso interno. */
export function projectHref(path = '') {
  return projectUrl(path).href;
}
