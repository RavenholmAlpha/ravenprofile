// tui/intro.js — boot sequence rendered in a terminal cell grid (mv style).
// RAVENHASH sits centered in the big block font with the donut.c torus behind it.
(function () {
  'use strict';
  const T = window.RavenTUI;
  const { Grid, clamp, ease, hash } = T;
  const canvas = document.getElementById('intro-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const g = new Grid(120, 45);
  let cw = 0, chh = 0, kick = 0, lastBeat = -1;
  const BOOT = ['[  OK  ] bootloader.mount(/dev/raven)', '[  OK  ] operator = "Raven"', '[  OK  ] alias    = "RavenHASH"', '[ .... ] permissions.request(root)', '[  OK  ] donut.c --z-buffer'];

  function fit() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return false;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Largest cell (<=15px) that still fits the k=1 wordmark: RAVENHASH (106 cols) or RAVEN (58 cols).
    const need = r.width >= 1000 ? 110 : 62;
    const cellH = Math.max(7, Math.min(15, r.width / (need * .6)));
    const W = Math.max(40, Math.floor(r.width / (cellH * .6))), H = Math.max(24, Math.floor(r.height / cellH));
    if (W !== g.W || H !== g.H) g.resize(W, H);
    cw = r.width; chh = r.height; return true;
  }
  addEventListener('resize', () => { cw = 0; }, { passive: true });

  // Pick the largest wordmark layout that fits the grid.
  function wordmark() {
    const W = g.W - 4;
    if (g.bigW('RAVENHASH', 1) <= W) return { k: 1, lines: ['RAVENHASH'] };
    if (g.bigW('RAVEN', 1) <= W) return { k: 1, lines: ['RAVEN', 'HASH'] };
    return { k: 0, lines: ['RAVEN', 'HASH'] };
  }
  function drawWordmark(cy, t, reveal) {
    const L = wordmark(), hh = g.bigH(L.k) + 1, y0 = Math.round(cy - (L.lines.length * hh - 1) / 2);
    let used = 0;
    L.lines.forEach((ln, i) => {
      const x = Math.round((g.W - g.bigW(ln, L.k)) / 2), n = clamp(reveal - used, 0, ln.length);
      g.big(x, y0 + i * hh, ln, L.k, (ci, X, Y) => {
        const gi = used + ci;
        if (gi >= 5) return (X + Y + Math.floor(t * 12)) % 11 < 2 ? 4 : 3; // HASH: green with cyan sweep
        return (X - Y + Math.floor(t * 9)) % 17 < 1 ? 3 : 8;
      }, 15, n);
      used += ln.length;
    });
    return { y0, h: L.lines.length * hh - 1 };
  }
  function donutBehind(t, cy, cols) {
    const s = Math.min(g.W * .42, g.H * .62 / .6 * .72);
    g.donut(.4 + t * 1.15, .3 + t * .55, g.W / 2, cy, s * 1.9, s * 1.9 * .55, cols);
  }

  function draw(ms) {
    if (!cw && !fit()) return;
    const t = ms / 1000, W = g.W, H = g.H, cy = Math.round(H * .46);
    const beat = Math.floor(t * 2.1); if (beat !== lastBeat) { lastBeat = beat; kick = 1; } kick *= .86;
    g.cls();
    let glitch = 0;
    if (ms < 1400) {
      g.bgRain(t, .35, 8, 3, kick);
      const bw = Math.min(W - 6, 48), bx = 3, by = 2;
      g.box(bx, by, bw, BOOT.length + 3, 3, 'boot.log', 'r', 13);
      BOOT.forEach((l, i) => { const lt = t - i * .22; if (lt > 0) g.txt(bx + 2, by + 1 + i, l.slice(0, Math.min(bw - 4, Math.floor(lt * 60))), l.includes('OK') ? 2 : 7, 13); });
      const p = ease(ms / 1300), n = Math.min(40, W - 10);
      g.txtc(cy + 2, '[' + '█'.repeat(Math.round(p * n)) + '░'.repeat(n - Math.round(p * n)) + ']', 3);
      g.scramc(cy, 'LOCATING OPERATOR', t, 8, 30);
    } else if (ms < 2900) {
      const lt = (ms - 1400) / 1000;
      g.bgTunnel(t, 3, 3 + lt * 6, kick);
      g.fill(Math.round(W / 2 - 22), cy - 2, 44, 5, 32, 2, 0);
      g.box(Math.round(W / 2 - 22), cy - 2, 44, 5, 4, 'auth', 'h', 0);
      g.scramc(cy, 'RAVEN // RAVENHASH', lt, 8, 22);
      if (lt > 1.1) g.txtc(cy + 1, '> ACCESS VERIFIED', 3);
      if (lt < .2) glitch = .9;
    } else {
      const lt = (ms - 2900) / 1000;
      if (ms > 4800) { g.bgGrid(t, 5, Math.round(H * .8), 15); }
      if (ms > 6600) g.bgStars(t, 2, 8); else g.bgRain(t, .18, 1, 1, 0);
      donutBehind(t, cy, [1, 2, 4, 3, 8]);
      const wm = drawWordmark(cy, t, Math.floor(lt * 10));
      const below = wm.y0 + wm.h + 2;
      if (lt > 1) g.scramc(Math.min(H - 3, below), '> ./donut.c --z-buffer --realtime  // PROCESS ALIVE', lt - 1, 9, 50);
      if (ms > 4800) {
        const l = 'AGENT SYSTEMS', r = 'INFORMATION FREEDOM', y = Math.max(1, wm.y0 - 3), pad = Math.max(2, Math.round(W * .08));
        g.scram(pad, y, '[01] ' + l, (ms - 4800) / 1000, 3, 40);
        g.scram(W - pad - r.length - 5, y, '[02] ' + r, (ms - 4800) / 1000, 4, 40);
      }
      if (ms > 6600) { const m = 'ACCESS GRANTED // WELCOME, RAVEN'; g.fill(Math.round((W - m.length) / 2) - 2, H - 5, m.length + 4, 3, 32, 8, 3); g.txtc(H - 4, m, 0, 3); }
      if (lt < .25 || Math.abs(ms - 4800) < 140 || Math.abs(ms - 6600) < 140) glitch = .8;
      if (kick > .9) glitch = Math.max(glitch, .12);
    }
    g.bflush();
    g.glitch(glitch, t);
    g.paint(ctx, cw, chh);
    canvas.dataset.glitch = glitch > .3 ? '1' : '0';
  }
  window.RavenIntroFX = { draw, grid: g, fit: () => { cw = 0; } };
})();
