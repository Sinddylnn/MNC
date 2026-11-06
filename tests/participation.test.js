import test from 'node:test';
import assert from 'node:assert/strict';
import { init } from '../js/pages/participation.js';

test('contato confirma respostas positivas e preserva a mensagem quando o envio falha', async () => {
  const originals = { document: globalThis.document, FormData: globalThis.FormData, fetch: globalThis.fetch };
  const button = { disabled: false };
  const status = { textContent: '' };
  let submit;
  let resets = 0;
  let busy = false;
  const fields = new Map([
    ['nome', ' Visitante '], ['telefone', ' 83999999999 '], ['mensagem', ' Quero participar! '], ['_honey', '']
  ]);
  const form = {
    querySelector: () => button,
    reportValidity: () => true,
    addEventListener: (_, handler) => { submit = handler; },
    setAttribute: () => { busy = true; },
    removeAttribute: () => { busy = false; },
    reset: () => { resets++; }
  };
  try {
    globalThis.document = { getElementById: id => id === 'contact-form' ? form : status };
    globalThis.FormData = class { constructor() { return fields; } };
    init();
    for (const success of [false, 'false', true, 'true']) {
      const before = resets;
      globalThis.fetch = async (_, options) => {
        assert.equal(button.disabled, true);
        assert.equal(busy, true);
        const body = JSON.parse(options.body);
        assert.equal(body.nome, 'Visitante');
        assert.equal(body.telefone, '83999999999');
        assert.equal(body.mensagem, 'Quero participar!');
        return { ok: true, json: async () => ({ success }) };
      };
      await submit({ preventDefault() {} });
      assert.equal(resets, before + (success === true || success === 'true' ? 1 : 0));
      assert.equal(button.disabled, false);
      assert.equal(busy, false);
    }
    globalThis.fetch = async () => { throw new Error('offline'); };
    const before = resets;
    await submit({ preventDefault() {} });
    assert.equal(resets, before);
    assert.match(status.textContent, /Sua mensagem foi mantida/);
    assert.equal(button.disabled, false);
  } finally {
    Object.assign(globalThis, originals);
  }
});
