// tui/sections.js — mv-style scene banners for each chapter (hex dump / plasma / tunnel / rain + block title).
(function () {
  'use strict';
  const T = window.RavenTUI;
  if (!T) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAL = T.PAL.map((c, i) => (i === 0 ? 'transparent' : c));
  const scenes = {
    agent: (g, t) => { g.bgHex(t, 1, 5); return [3, 8]; },
    smooth: (g, t) => { g.bgPlasma(t * 1.2, [15, 12, 5], .38); return [12, 8]; },
    protocol: (g, t) => { g.bgTunnel(t, 4, 2.5, 0); return [4, 8]; },
    contact: (g, t) => { g.bgRain(t, .5, 8, 3, 0); return [3, 8]; },
  };
  const items = [...document.querySelectorAll('canvas.tui-banner')].map((canvas) => ({
    canvas, ctx: canvas.getContext('2d'), g: new T.Grid(120, 12), w: 0, h: 0, visible: false,
    scene: scenes[canvas.dataset.scene] || scenes.agent, label: canvas.dataset.label || '', sub: canvas.dataset.sub || '',
  }));
  if (!items.length) return;

  function fit(it) {
    const r = it.canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return;
    it.canvas.width = Math.round(r.width * dpr); it.canvas.height = Math.round(r.height * dpr);
    it.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = r.width < 640 ? 9 : 12;
    it.g.resize(Math.max(30, Math.floor(r.width / (cell * .6))), Math.max(8, Math.floor(r.height / cell)));
    it.w = r.width; it.h = r.height;
  }
  function draw(it, t, lt) {
    const g = it.g; g.cls();
    const [hi, ink] = it.scene(g, t);
    // Pick the largest block-font size whose label fits; clear a panel behind it.
    const k = g.bigW(it.label, 1) <= g.W - 8 && g.H >= 9 ? 1 : 0;
    const bw = g.bigW(it.label, k), bh = g.bigH(k), x = Math.round((g.W - bw) / 2), y = Math.round((g.H - bh) / 2) - (it.sub ? 1 : 0);
    g.fill(x - 3, y - 1, bw + 6, bh + (it.sub ? 4 : 2), 32, 2, 0);
    g.box(x - 3, y - 1, bw + 6, bh + (it.sub ? 4 : 2), hi, it.canvas.dataset.scene + '.sys', 'd');
    g.big(x, y, it.label, k, (i, X, Y) => ((X + Y + Math.floor(t * 10)) % 13 < 2 ? hi : ink), 15, Math.floor(lt * 14));
    if (it.sub) g.scramc(y + bh + 1, it.sub, lt - .4, 9, 40);
    g.bflush();
    g.glitch(lt < .3 ? .7 : 0, t);
    g.paint(it.ctx, it.w, it.h, PAL);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const it = items.find((i) => i.canvas === e.target);
      if (e.isIntersecting && !it.visible) it.start = performance.now();
      it.visible = e.isIntersecting;
    }), { threshold: .15 });
    items.forEach((it) => io.observe(it.canvas));
  }
  addEventListener('resize', () => items.forEach((it) => { it.w = 0; }), { passive: true });
  let last = 0;
  function loop(ms) {
    if (!reduced) requestAnimationFrame(loop);
    if (!reduced && ms - last < 50) return; last = ms;
    for (const it of items) {
      if (!reduced && (!it.visible || document.hidden)) continue;
      if (!it.w) fit(it);
      draw(it, ms / 1000, reduced ? 9 : (ms - (it.start || ms)) / 1000);
    }
  }
  requestAnimationFrame(loop);
  window.RavenSectionFX = { items };
})();
