// tui/draw.js — primitives ported from mv/engine.js, font.js, art.js, bg.js, hud.js.
(function () {
  'use strict';
  const { Grid, hash, clamp, gch } = window.RavenTUI;
  const P = Grid.prototype;
  const BX = { s: '┌┐└┘─│', d: '╔╗╚╝═║', r: '╭╮╰╯─│', h: '┏┓┗┛━┃' };
  const F5 = { A: [14,17,31,17,17], B: [30,17,30,17,30], C: [15,16,16,16,15], D: [30,17,17,17,30], E: [31,16,30,16,31], F: [31,16,30,16,16], G: [15,16,19,17,15], H: [17,17,31,17,17], I: [31,4,4,4,31], K: [17,18,28,18,17], L: [16,16,16,16,31], M: [17,27,21,17,17], N: [17,25,21,19,17], O: [14,17,17,17,14], P: [30,17,30,16,16], R: [30,17,30,18,17], S: [15,16,14,1,30], T: [31,4,4,4,4], U: [17,17,17,17,14], V: [17,17,17,10,4], W: [17,17,21,27,17], X: [17,10,4,10,17], Y: [17,10,4,4,4], Z: [31,2,4,8,31], '0': [14,19,21,25,14], '1': [4,12,4,4,14], '2': [30,1,14,16,31], '3': [30,1,6,1,30], '/': [1,2,4,8,16], '.': [0,0,0,0,4], '_': [0,0,0,0,31], '-': [0,0,14,0,0], ' ': [0,0,0,0,0], '>': [8,4,2,4,8] };
  const px5 = (g, r, c) => r < 5 && (g[r] >> (4 - c)) & 1;
  const RAMP = '.,-~:;=!*#$@';
  const BM = [[1, 8], [2, 16], [4, 32], [64, 128]];

  P.box = function (x, y, w, h, f, title, st, bg) {
    const k = BX[st || 's']; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (w < 2 || h < 2) return;
    if (bg != null) this.fill(x + 1, y + 1, w - 2, h - 2, 32, f, bg);
    for (let i = 1; i < w - 1; i++) { this.set(x + i, y, k[4], f); this.set(x + i, y + h - 1, k[4], f); }
    for (let j = 1; j < h - 1; j++) { this.set(x, y + j, k[5], f); this.set(x + w - 1, y + j, k[5], f); }
    this.set(x, y, k[0], f); this.set(x + w - 1, y, k[1], f); this.set(x, y + h - 1, k[2], f); this.set(x + w - 1, y + h - 1, k[3], f);
    if (title && w > 6) this.txt(x + 2, y, (' ' + title + ' ').slice(0, w - 4), f);
  };
  // Big 5x5 font. k=0 half-block (6 cols x 3 rows per char); k>=1 pixel = 2k x k cells.
  P.bigW = (s, k) => (k ? s.length * 12 * k - 2 * k : s.length * 6 - 1);
  P.bigH = (k) => (k ? 5 * k : 3);
  P.big = function (x, y, s, k, colf, shadow, reveal) {
    s = String(s).toUpperCase(); x = Math.round(x); y = Math.round(y);
    const cf = typeof colf === 'function' ? colf : () => colf;
    const n = reveal == null ? s.length : reveal;
    for (let i = 0; i < s.length && i < n; i++) {
      const g = F5[s[i]] || F5[' '];
      if (k) {
        const ox = x + i * 12 * k;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (px5(g, r, c))
          for (let a = 0; a < k; a++) for (let b = 0; b < 2 * k; b++) {
            const X = ox + c * 2 * k + b, Y = y + r * k + a;
            if (shadow != null) this.set(X + 1, Y + 1, 0x2591, shadow);
          }
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (px5(g, r, c))
          for (let a = 0; a < k; a++) for (let b = 0; b < 2 * k; b++) {
            const X = ox + c * 2 * k + b, Y = y + r * k + a; this.set(X, Y, 0x2588, cf(i, X, Y));
          }
      } else {
        const ox = x + i * 6;
        for (let R = 0; R < 3; R++) for (let c = 0; c < 5; c++) {
          const u = px5(g, R * 2, c), d = px5(g, R * 2 + 1, c);
          if (u || d) this.set(ox + c, y + R, u && d ? 0x2588 : u ? 0x2580 : 0x2584, cf(i, ox + c, y + R));
        }
      }
    }
  };
  P.bigc = function (y, s, k, colf, shadow, reveal) { this.big(Math.round((this.W - this.bigW(String(s), k)) / 2), y, s, k, colf, shadow, reveal); };
  // Scramble-in text (mv scram).
  P.scram = function (x, y, s, lt, f, spd) {
    const n = lt * (spd || 60);
    for (let i = 0; i < s.length; i++) {
      if (s[i] === ' ') continue;
      if (i < n - 5) this.set(x + i, y, s.charCodeAt(i), f); else if (i < n) this.set(x + i, y, gch(i * 7 + Math.floor(lt * 40)), 4);
    }
  };
  P.scramc = function (y, s, lt, f, spd) { this.scram(Math.round((this.W - s.length) / 2), y, s, lt, f, spd); };
  // Z-buffered donut.c torus written into cells (mv art.js).
  P.donut = function (A, B, cx, cy, sx, sy, cols) {
    const { W, H, CC, CF, ZB } = this; ZB.fill(0);
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    for (let j = 0; j < 6.283; j += .06) {
      const ct = Math.cos(j), st = Math.sin(j);
      for (let i = 0; i < 6.283; i += .018) {
        const sp = Math.sin(i), cp = Math.cos(i), h = ct + 2, D = 1 / (sp * h * sA + st * cA + 5), tt = sp * h * cA - st * sA;
        const x = Math.round(cx + sx * D * (cp * h * cB - tt * sB)), y = Math.round(cy + sy * D * (cp * h * sB + tt * cB));
        if (y < 0 || y >= H || x < 0 || x >= W) continue;
        const o = y * W + x; if (D <= ZB[o]) continue; ZB[o] = D;
        const L = (st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB, l = clamp(L / 1.42, 0, 1);
        CC[o] = RAMP.charCodeAt(Math.floor(l * 11.99));
        CF[o] = cols ? cols[Math.min(cols.length - 1, Math.floor(l * cols.length))] : l > .7 ? 3 : l > .35 ? 2 : 1;
      }
    }
  };
  // Braille sub-pixel layer.
  P.bdot = function (px, py, f) {
    px = Math.round(px); py = Math.round(py);
    if (px < 0 || py < 0 || px >= this.W * 2 || py >= this.H * 4) return;
    const i = (py >> 2) * this.W + (px >> 1); this.BB[i] |= BM[py & 3][px & 1]; this.BF[i] = f;
  };
  P.bline = function (x0, y0, x1, y1, f) { const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)); for (let i = 0; i <= n; i++) { const u = i / n; this.bdot(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, f); } };
  P.bflush = function () { for (let i = 0; i < this.N; i++) if (this.BB[i]) { this.CC[i] = 0x2800 + this.BB[i]; this.CF[i] = this.BF[i]; } this.BB.fill(0); };
  window.RavenTUI.F5 = F5;
})();
