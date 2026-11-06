import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveFragmentPaths, loadIncludes } from '../js/core/includes.js';
import { projectHref } from '../js/core/paths.js';

test('fragmentos resolvem links e imagens pela raiz e preservam destinos externos', () => {
  const values = ['./paginas/quero-participar.html', './imagens/logos/logo_completa.png', 'mailto:mnc.uepb@gmail.com', 'https://example.com', '#contato'];
  const elements = values.map((value, index) => {
    const attrs = { [index === 1 ? 'src' : 'href']: value };
    return { attrs, getAttribute: key => attrs[key], setAttribute: (key, next) => { attrs[key] = next; } };
  });
  resolveFragmentPaths({ querySelectorAll: () => elements });
  assert.equal(elements[0].attrs.href, projectHref('paginas/quero-participar.html'));
  assert.equal(elements[1].attrs.src, projectHref('imagens/logos/logo_completa.png'));
  for (let i = 2; i < values.length; i++) assert.equal(elements[i].attrs.href, values[i]);
});

test('todas as páginas usam os mesmos fragmentos, sem duplicar menu e rodapé', async () => {
  for (const file of ['index.html', 'paginas/programa.html', 'paginas/equipe.html', 'paginas/galeria.html', 'paginas/publicacoes.html', 'paginas/parcerias.html', 'paginas/quero-participar.html']) {
    const html = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    assert.match(html, /<header id="main-header" data-include="header.html"><\/header>/);
    assert.match(html, /<footer id="main-footer" class="site-footer" data-include="footer.html"><\/footer>/);
    assert.doesNotMatch(html, /id="main-nav"|class="footer-top"/);
  }
});

test('falha no header não impede o footer e mostra link de recuperação', async () => {
  const originals = { document: globalThis.document, fetch: globalThis.fetch, error: console.error };
  const containers = ['header.html', 'footer.html'].map(file => ({
    dataset: { include: file }, replaceChildren(value) { this.child = value; }
  }));
  const content = { querySelectorAll: () => [] };
  try {
    globalThis.document = {
      querySelectorAll: () => containers,
      createElement: tag => tag === 'template' ? { content } : {}
    };
    globalThis.fetch = async url => ({ ok: !url.href.endsWith('header.html'), status: 404, text: async () => '<p>Rodapé</p>' });
    console.error = () => {};
    await loadIncludes();
    assert.equal(containers[0].child.href, projectHref('index.html'));
    assert.equal(containers[1].child, content);
  } finally {
    globalThis.document = originals.document;
    globalThis.fetch = originals.fetch;
    console.error = originals.error;
  }
});
