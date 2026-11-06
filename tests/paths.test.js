import assert from 'node:assert/strict';
import test from 'node:test';

import { projectUrl } from '../js/core/paths.js';

test('resolve recursos a partir da raiz do projeto', () => {
  const url = projectUrl('./data/timeline.json');
  assert.match(url.pathname.replaceAll('\\', '/'), /\/data\/timeline\.json$/);
});
