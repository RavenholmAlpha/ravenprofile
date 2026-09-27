// tui/core.js — terminal cell grid ported from mv/engine.js + mv/render.js (instanced, no globals).
(function (root) {
  'use strict';
  const PAL = ['#05070a', '#0e4a33', '#20a36b', '#48ffb0', '#3ad7ff', '#ff5ad9', '#ff3348', '#ffd34d', '#f4fff9', '#5d6a78', '#3a78ff', '#ff8c3a', '#a57dff', '#141a22', '#5a0f1a', '#4a1640'];
  const hash = (n) => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (p) => { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); };
  const GL = '01<>{}[]/\\|=+*#%&$@;:ABCDEFabcdefx';
  const gch = (s) => GL.charCodeAt((hash(s) * GL.length) | 0);
  // Box-drawing glyphs are drawn as rects so borders stay seamless at any cell size.
  const BD = {};
  const def = (chars, segs, kind) => [...chars].forEach((c, i) => { BD[c.charCodeAt(0)] = [segs[i], kind]; });
  def('─│┌┐└┘╭╮╰╯', ['lr', 'ud', 'rd', 'ld', 'ru', 'lu', 'rd', 'ld', 'ru', 'lu'], 1);
  def('━┃┏┓┗┛', ['lr', 'ud', 'rd', 'ld', 'ru', 'lu'], 2);
  def('═║╔╗╚╝', ['lr', 'ud', 'rd', 'ld', 'ru', 'lu'], 3);
  const BITS = [1, 2, 4, 64, 8, 16, 32, 128];

  class Grid {
    constructor(W, H) { this.resize(W, H); }
    resize(W, H) {
      this.W = W; this.H = H; const N = W * H; this.N = N;
      this.CC = new Uint16Array(N); this.CF = new Uint8Array(N); this.CB = new Uint8Array(N);
      this.ZB = new Float32Array(N); this.BB = new Uint8Array(N); this.BF = new Uint8Array(N);
      this.cls();
    }
    cls() { this.CC.fill(32); this.CF.fill(2); this.CB.fill(0); }
    set(x, y, c, f, b) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= this.W || y >= this.H) return;
      const i = y * this.W + x;
      this.CC[i] = typeof c === 'number' ? c : c.charCodeAt(0);
      if (f != null) this.CF[i] = f;
      if (b != null) this.CB[i] = b;
    }
    txt(x, y, s, f, b) { s = String(s); for (let i = 0; i < s.length; i++) this.set(x + i, y, s.charCodeAt(i), f, b); }
    txtc(y, s, f, b) { s = String(s); this.txt(Math.round((this.W - s.length) / 2), y, s, f, b); }
    fill(x, y, w, h, c, f, b) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c, f, b); }
    // Paint to a 2D context sized in CSS px. Background index 0 is transparent.
    paint(ctx, width, height, pal) {
      pal = pal || PAL;
      const { W, H, CC, CF, CB } = this, cw = width / W, ch = height / H;
      ctx.clearRect(0, 0, width, height);
      for (let y = 0; y < H; y++) {
        let x = 0;
        while (x < W) {
          const b = CB[y * W + x], s = x;
          while (x < W && CB[y * W + x] === b) x++;
          if (b) { ctx.fillStyle = pal[b]; ctx.fillRect(s * cw, y * ch, (x - s) * cw + .5, ch + .5); }
        }
      }
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.font = Math.max(5, ch * .9) + 'px "Cascadia Mono", Consolas, monospace';
      let last = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, c = CC[i];
        if (c === 32) continue;
        const f = CF[i];
        if (f !== last) { ctx.fillStyle = pal[f]; last = f; }
        const X = x * cw, Y = y * ch;
        if (c === 0x2588) { ctx.fillRect(X, Y, cw + .5, ch + .5); continue; }
        if (c === 0x2580) { ctx.fillRect(X, Y, cw + .5, ch / 2 + .5); continue; }
        if (c === 0x2584) { ctx.fillRect(X, Y + ch / 2, cw + .5, ch / 2 + .5); continue; }
        if (c >= 0x2591 && c <= 0x2593) { ctx.globalAlpha *= (c - 0x2590) * .25; ctx.fillRect(X, Y, cw + .5, ch + .5); ctx.globalAlpha /= (c - 0x2590) * .25; continue; }
        if (c >= 0x2800 && c <= 0x28ff) {
          const m = c - 0x2800, dw = cw / 2, dh = ch / 4, r = Math.max(.6, dw * .34);
          for (let k = 0; k < 8; k++) if (m & BITS[k]) { const col = k < 4 ? 0 : 1, row = k < 4 ? k : k - 4; ctx.fillRect(X + col * dw + dw / 2 - r, Y + row * dh + dh / 2 - r, r * 2, r * 2); }
          continue;
        }
        const bd = BD[c];
        if (bd) { drawBox(ctx, X, Y, cw, ch, bd[0], bd[1]); continue; }
        ctx.fillText(String.fromCharCode(c), X + cw / 2, Y + ch * .54);
      }
    }
  }
  function drawBox(ctx, X, Y, cw, ch, segs, kind) {
    const t = kind === 2 ? Math.max(2, cw * .22) : Math.max(1, cw * .11);
    const offs = kind === 3 ? [-t * 1.3, t * 1.3] : [0];
    const mx = X + cw / 2, my = Y + ch / 2;
    for (const o of offs) {
      if (segs.includes('l')) ctx.fillRect(X, my + o - t / 2, cw / 2 + t / 2, t);
      if (segs.includes('r')) ctx.fillRect(mx - t / 2, my + o - t / 2, cw / 2 + t / 2 + .5, t);
      if (segs.includes('u')) ctx.fillRect(mx + o - t / 2, Y, t, ch / 2 + t / 2);
      if (segs.includes('d')) ctx.fillRect(mx + o - t / 2, my - t / 2, t, ch / 2 + t / 2 + .5);
    }
  }
  root.RavenTUI = { Grid, PAL, hash, clamp, ease, gch, GL };
})(window);
