/* ========================================================================
   ANIMAÇÕES PCB - ES6 MODULE
   ======================================================================== */

/**
 * Inicializa a transição de página em Canvas estilo circuito impresso.
 * Esta função configura interceptores de link e evento pageshow.
 */
export function inicializarAnimacoes() {
  const _ov = document.getElementById('circuitOverlay');
  const _cv = document.getElementById('circuitCanvas');

  if (!_ov || !_cv) return;

  const _cx = _cv.getContext('2d');
  const _T = '#ABD6CD';
  const _L = '#C088B8';
  const _P = '#8773A4';
  let _W, _H, _segs, _pads, _vias, _raf2;

  function _rnd(a, b) {
    return a + Math.random() * (b - a);
  }

  function _pick(...a) {
    return a[Math.floor(Math.random() * a.length)];
  }

  function _eio(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function _build() {
    _W = _cv.width = window.innerWidth;
    _H = _cv.height = window.innerHeight;
    _segs = [];
    _pads = [];
    _vias = [];

    const GRID = 40;
    const snap = v => Math.round(v / GRID) * GRID;
    const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const nT = Math.floor((_W * _H) / 40000) + 15;

    for (let t = 0; t < nT; t++) {
      const color = _pick(_T, _L, _P);
      const width = 2;
      const delay = _rnd(0, 0.3);
      let x = snap(_rnd(GRID, _W - GRID));
      let y = snap(_rnd(GRID, _H - GRID));
      let [dx, dy] = _pick(...DIRS);
      const nS = Math.floor(_rnd(2, 4));
      let pts = [{ x, y }];

      for (let s = 0; s < nS; s++) {
        if (s > 0) {
          const turn = Math.random() < 0.5 ? 1 : -1;
          [dx, dy] = [-dy * turn, dx * turn];
        }
        const len = snap(_rnd(100, 350));
        x = snap(Math.max(GRID, Math.min(_W - GRID, x + dx * len)));
        y = snap(Math.max(GRID, Math.min(_H - GRID, y + dy * len)));
        pts.push({ x, y });
      }

      for (let i = 0; i < pts.length - 1; i++) {
        _segs.push({
          x1: pts[i].x,
          y1: pts[i].y,
          x2: pts[i + 1].x,
          y2: pts[i + 1].y,
          color,
          width,
          delay: delay + i * 0.06,
          len: Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y)
        });
      }

      _vias.push({ x: pts[0].x, y: pts[0].y, r: 4, color, delay });
      _vias.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, r: 4, color, delay: delay + nS * 0.06 });
    }
  }

  function _drawFrame(p) {
    _cx.clearRect(0, 0, _W, _H);

    for (const s of _segs) {
      const sp = Math.max(0, Math.min(1, (p - s.delay) / 0.46));
      if (sp <= 0) continue;

      const lx = s.x1 + (s.x2 - s.x1) * _eio(sp);
      const ly = s.y1 + (s.y2 - s.y1) * _eio(sp);
      _cx.beginPath();
      _cx.moveTo(s.x1, s.y1);
      _cx.lineTo(lx, ly);
      _cx.strokeStyle = s.color;
      _cx.lineWidth = s.width;
      _cx.globalAlpha = 0.55 * _eio(Math.min(1, sp * 2));
      _cx.stroke();

      if (sp < 0.97) {
        _cx.beginPath();
        _cx.arc(lx, ly, s.width + 1.2, 0, Math.PI * 2);
        _cx.fillStyle = s.color;
        _cx.globalAlpha = 0.9;
        _cx.fill();
      }
    }

    for (const vi of _vias) {
      const vp = Math.max(0, Math.min(1, (p - vi.delay) / 0.2));
      if (vp <= 0) continue;

      _cx.beginPath();
      _cx.arc(vi.x, vi.y, vi.r + 3, 0, Math.PI * 2);
      _cx.strokeStyle = vi.color;
      _cx.lineWidth = 1.5;
      _cx.globalAlpha = vp * 0.6;
      _cx.stroke();

      _cx.beginPath();
      _cx.arc(vi.x, vi.y, vi.r, 0, Math.PI * 2);
      _cx.strokeStyle = vi.color;
      _cx.lineWidth = 0.8;
      _cx.globalAlpha = vp * 0.9;
      _cx.stroke();

      _cx.beginPath();
      _cx.arc(vi.x, vi.y, vi.r * 0.42, 0, Math.PI * 2);
      _cx.fillStyle = '#0C1018';
      _cx.globalAlpha = 1;
      _cx.fill();
    }

    _cx.globalAlpha = 1;
  }

  function _runPCB(cb) {
    _build();
    _ov.classList.add('active');
    const dur = 700;
    const t0 = performance.now();

    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      _drawFrame(_eio(p));
      if (p < 1) {
        _raf2 = requestAnimationFrame(tick);
      } else {
        if (cb) cb();
      }
    }

    requestAnimationFrame(tick);
  }

  function _exitPCB() {
    const dur = 360;
    const t0 = performance.now();

    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      _ov.style.opacity = 1 - _eio(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        _ov.classList.remove('active');
        _ov.style.opacity = '';
      }
    }

    requestAnimationFrame(tick);
  }

  function goTo(url) {
    if (_raf2) cancelAnimationFrame(_raf2);
    _runPCB(() => { window.location.href = url; });
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;

    e.preventDefault();
    goTo(href);
  });

  window.addEventListener('pageshow', () => {
    setTimeout(_exitPCB, 80);
  });
}
