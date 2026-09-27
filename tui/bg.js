// tui/bg.js — full-grid backgrounds + post glitch, ported from mv/bg.js and mv/hud.js.
(function () {
  'use strict';
  const { Grid, hash, clamp, gch } = window.RavenTUI;
  const P = Grid.prototype;
  const SHADE = ' .:-=+*#%@';
  const shade = (v) => SHADE.charCodeAt(clamp((v * 9.99) | 0, 0, 9));

  P.bgRain = function (t, dens, hc, tc, kick) {
    const { W, H } = this;
    if (!this._rain || this._rain.length !== W) this._rain = Array.from({ length: W }, (_, i) => ({ y: hash(i) * -H, v: .25 + hash(i * 3) * .8, l: 4 + (hash(i * 7) * 14 | 0) }));
    for (let x = 0; x < W; x++) {
      const c = this._rain[x]; if (hash(x * 1.3) > dens) continue;
      c.y += c.v * (1 + (kick || 0) * 1.5); if (c.y - c.l > H) c.y = -hash(x + t) * 20;
      for (let k = 0; k < c.l; k++) {
        const y = Math.floor(c.y) - k; if (y < 0 || y >= H) continue;
        this.set(x, y, gch(x * 31 + y + (k === 0 ? Math.floor(t * 8) : 0)), k === 0 ? (hc || 8) : k < 3 ? (tc || 3) : k < c.l * .6 ? 2 : 1);
      }
    }
  };
  P.bgStars = function (t, sp, col) {
    const { W, H } = this, cx = W / 2, cy = H / 2;
    for (let i = 0; i < 260; i++) {
      const a = hash(i) * 6.283; let z = (hash(i * 2.1) - t * sp * .1) % 1; if (z < 0) z += 1; z = z * .95 + .05;
      const r = (.05 + hash(i * 5.3)) / z * (H * .4);
      this.set(cx + Math.cos(a) * r * 2, cy + Math.sin(a) * r, z < .2 ? '*' : z < .5 ? '+' : '.', z < .3 ? (col || 8) : z < .6 ? 4 : 1);
    }
  };
  P.bgTunnel = function (t, col, sp, kick) {
    const { W, H } = this, cx = W / 2, cy = H / 2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = (x - cx) / 2, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy) + .01;
      if (d < 2.5) continue;
      const u = 12 / d + t * (sp || 2), v = Math.atan2(dy, dx) / 3.1416 * 4 + t * .3;
      if (((Math.floor(u) + Math.floor(v * 2)) & 1) && hash(Math.floor(u) * 3 + Math.floor(v * 2)) > .3) {
        const s = clamp(d / (H * .6), 0, 1); this.set(x, y, shade(s * .8 + (kick || 0) * .2), s > .6 ? (col || 2) : 1);
      }
    }
  };
  P.bgPlasma = function (t, cols, thr) {
    cols = cols || [1, 2, 3]; thr = thr || .25; const { W, H } = this, cx = W / 2, cy = H / 2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v = Math.sin(x * .09 + t) + Math.sin(y * .21 - t * 1.3) + Math.sin(x * .05 + y * .12 + t * .7) + Math.sin(Math.sqrt((x - cx) * (x - cx) * .25 + (y - cy) * (y - cy)) * .35 - t * 2);
      v = (v + 4) / 8; if (v < thr) continue; const n = (v - thr) / (1 - thr);
      this.set(x, y, shade(n), cols[Math.min(cols.length - 1, (n * cols.length) | 0)]);
    }
  };
  // Synthwave floor (mv bgGrid) from horizon hz to bottom.
  P.bgGrid = function (t, col, hz, dim) {
    const { W, H } = this, cx = W / 2;
    for (let y = hz + 1; y < H; y++) {
      const z = (y - hz) / (H - hz), zz = 1 / z;
      if (Math.abs(((zz * 2 - t * 4) % 2 + 2) % 2) < .3 * z + .08) for (let x = 0; x < W; x++) this.set(x, y, '─', z > .5 ? col : dim);
      for (let k = -18; k <= 18; k++) this.set(cx + k * 8 * z * 2.2, y, k < 0 ? '/' : k > 0 ? '\\' : '│', z > .4 ? col : dim);
    }
    for (let x = 0; x < W; x++) this.set(x, hz, '━', col);
  };
  P.bgSun = function (cx, cy, r) {
    for (let y = -r; y <= 0; y++) for (let x = -r * 2; x <= r * 2; x++) {
      if ((x * x / 4 + y * y) / (r * r) > 1) continue; if (y > -r * .6 && (-y) % 3 === 0) continue;
      this.set(cx + x, cy + y, 0x2588, y < -r * .5 ? 7 : y < -r * .25 ? 11 : 5);
    }
  };
  P.bgHex = function (t, col, sp) {
    for (let y = 0; y < this.H; y++) {
      const ln = Math.floor(t * (sp || 6)) + y; let s = (ln * 16).toString(16).padStart(8, '0') + '  ';
      for (let k = 0; k < 16; k++) s += Math.floor(hash(ln * 16 + k) * 256).toString(16).padStart(2, '0') + ' ';
      this.txt(2, y, s, col || 1);
    }
  };
  // Horizontal slice displacement + glyph sparks (mv hud.js post).
  P.glitch = function (g, t) {
    if (g <= .02) return; const { W, H, CC, CF } = this, s = Math.floor(t * 24);
    for (let k = 0; k < Math.ceil(g * 10); k++) {
      const y = Math.floor(hash(s * 13.1 + k) * H), hh = 1 + Math.floor(hash(k * 5 + s) * 3), off = Math.round((hash(s * 7.7 + k * 3) - .5) * 36 * g), tint = hash(k + s * .3) < .35;
      for (let yy = y; yy < Math.min(H, y + hh); yy++) {
        const o = yy * W, rc = CC.slice(o, o + W), rf = CF.slice(o, o + W);
        for (let x = 0; x < W; x++) { const sx = (x - off + W * 4) % W; CC[o + x] = rc[sx]; CF[o + x] = tint && rc[sx] !== 32 ? 5 : rf[sx]; }
      }
    }
    for (let k = 0; k < g * 70; k++) { const i = Math.floor(hash(s * 3.3 + k * 1.7) * this.N); CC[i] = gch(k + s); CF[i] = hash(k * 9 + s) < .5 ? 5 : 4; }
  };
  window.RavenTUI.shade = shade;
})();
