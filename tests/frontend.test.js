import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { navigationTarget } from '../js/features/page-transition.js';

test('navegação trata links relativos e absolutos igualmente em uma subpasta', () => {
  const current = 'https://example.com/MNC/index.html';
  const link = (href, target = '', download = false) => ({
    target, getAttribute: () => href, hasAttribute: () => download
  });
  const expected = 'https://example.com/MNC/paginas/equipe.html';
  assert.equal(navigationTarget(link('./paginas/equipe.html'), current), expected);
  assert.equal(navigationTarget(link(expected), current), expected);
  for (const excluded of [
    link('#conteudo'), link(current + '#conteudo'), link('mailto:equipe@example.com'),
    link('https://instagram.com/'), link(expected, '_blank'), link(expected, '', true)
  ]) assert.equal(navigationTarget(excluded, current), null);
});

test('tema inicial é válido mesmo quando armazenamento está bloqueado', async () => {
  const code = await readFile(new URL('../js/core/theme-preload.js', import.meta.url), 'utf8');
  for (const [saved, expected] of [['light', 'light'], ['dark', 'dark'], ['invalid', 'dark'], [null, 'dark'], [new Error('blocked'), 'dark']]) {
    let theme;
    runInNewContext(code, {
      localStorage: { getItem() { if (saved instanceof Error) throw saved; return saved; } },
      document: { documentElement: { setAttribute: (_, value) => { theme = value; } } }
    });
    assert.equal(theme, expected);
  }
});

test('todas as páginas têm título principal, destino de teclado e tema compartilhado', async () => {
  const pages = ['index.html', 'paginas/programa.html', 'paginas/equipe.html', 'paginas/galeria.html', 'paginas/publicacoes.html', 'paginas/parcerias.html', 'paginas/quero-participar.html'];
  for (const file of pages) {
    const html = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, file);
    assert.match(html, /<main id="conteudo" tabindex="-1">/, file);
    assert.match(html, /<script src="[^" ]*js\/core\/theme-preload.js"><\/script>/, file);
    assert.doesNotMatch(html, /localStorage|class="(?:btn-teal|btn-ghost|pdf-btn)"/, file);
  }
});
