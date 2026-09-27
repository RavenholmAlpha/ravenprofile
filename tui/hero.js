// tui/hero.js — mv-style cell-grid backdrop for the hero: synthwave floor, star drift, HUD corners.
// No sun: it sat behind the centered title. The floor horizon is measured to stay below all hero text.
// The original #donut canvas (site.js) stays untouched and is layered above this, centered behind the title.
(function () {
  'use strict';
  const T = window.RavenTUI;
  const canvas = document.getElementById('hero-tui');
  if (!T || !canvas) return;
  const { Grid } = T;
  const ctx = canvas.getContext('2d');
  const g = new Grid(120, 40);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, visible = true, last = -1e9, horizon = 0, cmd = './donut.c';
  // site.js announces the active hero shape; mirror its command in the HUD tag.
  addEventListener('ravenshape', (e) => { cmd = e.detail.cmd; if (reduced) frame(1800); });
  // Dimmed palette so the backdrop never competes with the title.
  const PAL = T.PAL.map((c, i) => (i === 0 ? 'transparent' : c));

  function fit() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = r.width < 640 ? 10 : 14;
    g.resize(Math.max(30, Math.floor(r.width / (cell * .6))), Math.max(20, Math.floor(r.height / cell)));
    w = r.width; h = r.height;
    // Horizon row = first row fully below the hero copy (title, creed, bio, links).
    const copy = document.querySelector('.hero-copy');
    const cellH = r.height / g.H;
    const bottom = copy ? copy.getBoundingClientRect().bottom - r.top : r.height * .7;
    horizon = Math.min(g.H - 3, Math.max(Math.round(g.H * .6), Math.ceil(bottom / cellH) + 1));
  }
  function frame(ms) {
    const t = ms / 1000, W = g.W, hz = horizon || Math.round(g.H * .8);
    g.cls();
    g.bgStars(t, .35, 9);
    g.bgGrid(t * .6, 5, hz, 15);
    // HUD corners (mv hud.js language)
    g.box(1, 1, Math.min(34, W - 2), 4, 1, 'sys.raven', 'r');
    g.txt(3, 2, 'pid 0x52A  uptime ' + Math.floor(t) + 's', 9);
    g.txt(3, 3, 'cpu [' + '|'.repeat(4 + Math.floor((Math.sin(t * 2) + 1) * 4)).padEnd(12, '.') + ']', 2);
    const tag = 'root@ravenhash:~# ' + cmd;
    if (W > 70) g.txt(W - tag.length - 2, 2, tag, 1);
    g.bflush();
    if (Math.floor(t * 1.3) % 9 === 0) g.glitch(.12, t);
    g.paint(ctx, w, h, PAL);
  }
  function loop(ms) {
    if (!reduced) requestAnimationFrame(loop);
    if (!visible || document.hidden || ms - last < 50) return;
    last = ms; if (!w) fit(); frame(ms);
  }
  addEventListener('resize', () => { w = 0; if (reduced) { fit(); frame(1800); } }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  fit(); frame(1800);
  if (document.fonts) document.fonts.ready.then(() => { w = 0; });
  requestAnimationFrame(loop);
  window.RavenHeroFX = { grid: g };
})();
