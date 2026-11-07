import test from 'node:test';
import assert from 'node:assert/strict';
import { init, groupMembers } from '../js/pages/team.js';

test('a professora permanece primeiro e as demais integrantes podem aparecer em ordens diferentes', () => {
  const professor = { name: 'Luciana' };
  const members = ['Julia', 'Laryssa', 'Marilu', 'Sonally'].map(name => ({ name }));
  function render(random) {
    const grid = {
      children: [professor, ...members],
      querySelectorAll: () => members,
      append(...nodes) {
        this.children = this.children.filter(node => !nodes.includes(node)).concat(nodes);
      }
    };
    init({ querySelector: () => grid }, random);
    return grid.children;
  }

  const first = render(() => 0);
  const second = render(() => 0.99);
  for (const result of [first, second]) {
    assert.equal(result[0], professor);
    assert.equal(result.length, members.length + 1);
    assert.deepEqual(new Set(result.slice(1)), new Set(members));
  }
  assert.notDeepEqual(first, second);
});

test('inicialização não falha quando a grade da equipe está ausente', () => {
  assert.doesNotThrow(() => init({ querySelector: () => null }));
});

test('agrupa bios de tamanhos próximos em duas ou três colunas, sem perder integrantes', () => {
  const members = [400, 0, 210, 0, 420, 200, 0, 410].map(length => ({
    length,
    querySelector: () => length ? { textContent: 'a'.repeat(length) } : null
  }));
  for (const columns of [2, 3]) {
    const result = groupMembers(members, columns, () => 0.5);
    assert.deepEqual(new Set(result), new Set(members));
    assert.equal(result.length, members.length);
    assert.ok(result.slice(0, columns - 1).every(member => member.length === 0));
    // As posições iniciais da primeira linha pertencem à professora e às bios curtas.
    const remaining = result.slice(columns - 1);
    for (let index = 0; index < remaining.length; index += columns) {
      const row = remaining.slice(index, index + columns).map(member => member.length);
      assert.ok(Math.max(...row) - Math.min(...row) <= 210);
    }
  }
});

test('reagrupa a equipe quando muda a quantidade de colunas', () => {
  const members = [400, 410, 0, 0, 200].map(length => ({
    querySelector: () => ({ textContent: 'a'.repeat(length) })
  }));
  let columns = '220px 220px 220px';
  let onResize;
  let arrangements = 0;
  const grid = {
    querySelectorAll: () => members,
    append() { arrangements += 1; }
  };
  init({
    querySelector: () => grid,
    defaultView: {
      getComputedStyle: () => ({ gridTemplateColumns: columns }),
      ResizeObserver: class {
        constructor(callback) { onResize = callback; }
        observe() {}
      }
    }
  });
  assert.equal(arrangements, 1);
  onResize();
  assert.equal(arrangements, 1);
  columns = '220px 220px';
  onResize();
  assert.equal(arrangements, 2);
});
