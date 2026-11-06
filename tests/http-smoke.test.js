import assert from 'node:assert/strict';
import test from 'node:test';

const baseUrl = process.env.SITE_URL;
const pages = [
  '/',
  '/paginas/programa.html',
  '/paginas/equipe.html',
  '/paginas/galeria.html',
  '/paginas/artigos.html',
  '/paginas/parcerias.html',
  '/paginas/quero-participar.html'
];

test('todas as páginas publicadas referenciam o layout compartilhado', { skip: !baseUrl }, async () => {
  for (const path of pages) {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 200, `${path} deve responder com HTTP 200`);
    const html = await response.text();
    assert.match(html, /<header id="main-header" data-include="header.html"><\/header>/);
    assert.match(html, /<footer id="main-footer" class="site-footer" data-include="footer.html"><\/footer>/);
    assert.match(html, /<script type="module" src="[^\"]+js\/main\.js"><\/script>/);
  }
});

test('recursos compartilhados respondem por HTTP', { skip: !baseUrl }, async () => {
  for (const path of ['/header.html', '/footer.html', '/js/core/includes.js', '/js/main.js', '/data/timeline.json', '/css/base.css']) {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 200, `${path} deve responder com HTTP 200`);
  }
});
