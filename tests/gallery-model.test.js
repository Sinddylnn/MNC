import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatDate,
  groupSchoolsByYear,
  normalizeTimeline,
  uniquePhotos
} from '../js/pages/gallery/model.js';

const rawTimeline = [
  {
    categoria: 'encontros',
    data: '2025-03-15',
    caminho_relativo: 'encontros/2025-03-15',
    fotos: ['foto.webp', 'foto.webp'],
    metadados: {
      'foto.webp': { largura: 1200, altura: 800, miniatura: 'encontros/2025-03-15/foto.webp' }
    }
  },
  {
    categoria: 'escolas',
    data: '2024',
    caminho_relativo: 'escolas/2024',
    fotos: ['turma.webp'],
    metadados: {
      'turma.webp': { largura: 800, altura: 600, miniatura: 'escolas/2024/turma.webp' }
    }
  }
];

test('formata datas completas e preserva anos', () => {
  assert.equal(formatDate('2024'), '2024');
  assert.equal(formatDate('2025-03-15'), '15 DE MARÇO, 2025');
  assert.equal(formatDate('data-inválida'), 'data-inválida');
});

test('normaliza eventos e metadados de fotos sem acessar o DOM', () => {
  const events = normalizeTimeline(rawTimeline);
  assert.equal(events[0].categoryTitle, 'Encontros');
  assert.equal(events[0].photos[0].width, 1200);
  assert.equal(events[0].photos[0].thumbnailPath, 'imagens/miniaturas/encontros/2025-03-15/foto.webp');
});

test('remove fotos duplicadas da visão geral', () => {
  const photos = uniquePhotos(normalizeTimeline(rawTimeline));
  assert.equal(photos.length, 2);
});

test('agrupa escolas por ano em ordem decrescente', () => {
  const events = normalizeTimeline([
    rawTimeline[1],
    { ...rawTimeline[1], data: '2026', caminho_relativo: 'escolas/2026' }
  ]);
  assert.deepEqual([...groupSchoolsByYear(events).keys()], ['2026', '2024']);
});
