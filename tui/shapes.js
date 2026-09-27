// tui/shapes.js — hero ASCII shapes. Each render(t, buf) writes into a z-buffered cell grid:
// buf = { W, H, depth: Float32Array, cells: Uint8Array, asp } ; cells hold ramp level 1..12 (0 = empty),
// depth holds 1/(camera distance) so larger is nearer. asp = cell width / cell height in pixels.
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const level = (l) => 1 + Math.min(11, Math.floor(clamp(l, 0, 1) * 11.99));
  const LX = .33, LY = .62, LZ = .71; // light direction (unit-ish)

  // Yaw around vertical (A), then pitch (B); perspective camera at distance 5.
  function view(buf, A, B, zoom) {
    const { W, H, depth, cells } = buf;
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    const KY = H * 1.9 * (zoom || 1), KX = KY / (buf.asp || 1);
    const o = [0, 0, 0];
    function rot(x, y, z) {
      const x1 = x * cA + z * sA, z1 = -x * sA + z * cA;
      o[0] = x1; o[1] = y * cB - z1 * sB; o[2] = y * sB + z1 * cB;
      return o;
    }
    // l < 0 means "shade by depth": nearer is brighter.
    function plot(x, y, z, l) {
      rot(x, y, z);
      const D = 1 / (5 - o[2]);
      const px = Math.round(W / 2 + o[0] * D * KX), py = Math.round(H / 2 - o[1] * D * KY);
      if (px < 0 || py < 0 || px >= W || py >= H) return;
      const i = py * W + px;
      if (D <= depth[i]) return;
      depth[i] = D;
      cells[i] = level(l < 0 ? .15 + .85 * clamp((o[2] + 1) / 2, 0, 1) : l);
    }
    return { rot, plot };
  }

  // Parametric surface with numeric normals and two-sided lighting. edge(u, v) -> true marks boundary.
  function surface(v, f, u0, u1, nu, v0, v1, nv, edge) {
    const e = 1e-3, p = [0, 0, 0], a = [0, 0, 0], b = [0, 0, 0];
    for (let i = 0; i <= nu; i++) {
      const u = u0 + (u1 - u0) * i / nu;
      for (let j = 0; j <= nv; j++) {
        const w = v0 + (v1 - v0) * j / nv;
        f(u, w, p); f(u + e, w, a); f(u, w + e, b);
        const ax = a[0] - p[0], ay = a[1] - p[1], az = a[2] - p[2];
        const bx = b[0] - p[0], by = b[1] - p[1], bz = b[2] - p[2];
        let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
        const len = Math.hypot(nx, ny, nz) || 1;
        const n = v.rot(nx / len, ny / len, nz / len);
        const lit = .12 + .8 * Math.abs(n[0] * LX + n[1] * LY + n[2] * LZ);
        v.plot(p[0], p[1], p[2], edge && edge(u, w) ? 1 : lit);
      }
    }
  }

  // Original donut.c torus, same constants as the earlier site.js renderer.
  function donut(t, buf) {
    const { W, H, depth, cells } = buf;
    const A = .36 + t * .78, B = .42 + t * .38, R = 12;
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    const kx = 36 * W / 62, ky = 29 * H / 34;
    for (let j = 0; j < TAU; j += .075) {
      const ct = Math.cos(j), st = Math.sin(j);
      for (let i = 0; i < TAU; i += .032) {
        const sp = Math.sin(i), cp = Math.cos(i), h = ct + 2;
        const D = 1 / (sp * h * sA + st * cA + 5), q = sp * h * cA - st * sA;
        const x = Math.round(W / 2 + kx * D * (cp * h * cB - q * sB));
        const y = Math.round(H / 2 + ky * D * (cp * h * sB + q * cB));
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        const o = y * W + x;
        if (D <= depth[o]) continue;
        depth[o] = D;
        const L = (st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB;
        cells[o] = Math.max(1, Math.min(R, Math.floor(Math.max(0, L / 1.42) * R) + 1));
      }
    }
  }

  // Hypotrochoid R=7, r=3 (closes after 3 turns) lifted into 3D, pen offset d breathes over time.
  function spirograph(t, buf) {
    const v = view(buf, t * .35, .55 + .25 * Math.sin(t * .21), 1.6);
    const R = 7, r = 3, k = (R - r) / r, d = 2.3 + 1.3 * Math.sin(t * .27), n = R - r + d;
    const N = 5200, head = ((t * .07) % 1) * N;
    for (let i = 0; i < N; i++) {
      const u = i / N * 3 * TAU;
      const x = ((R - r) * Math.cos(u) + d * Math.cos(k * u)) / n;
      const z = ((R - r) * Math.sin(u) - d * Math.sin(k * u)) / n;
      const y = .32 * Math.sin(u * 7 / 3) * Math.hypot(x, z);
      const behind = ((head - i) % N + N) % N / N;
      v.plot(x, y, z, behind < .07 ? 1 - behind * 4 : -1);
    }
  }

  // Aizawa attractor, integrated once (RK4) and normalized to the unit ball; a glowing head runs along it.
  let aizawaCache = null;
  function aizawaPoints() {
    if (aizawaCache) return aizawaCache;
    const a = .95, b = .7, c = .6, d = 3.5, e = .25, f = .1, dt = .01, N = 12000;
    const F = (x, y, z) => [(z - b) * x - d * y, d * x + (z - b) * y, c + a * z - z * z * z / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x];
    const pts = new Float32Array(N * 3);
    let x = .1, y = 0, z = 0;
    for (let i = -1500; i < N; i++) {
      const k1 = F(x, y, z), k2 = F(x + k1[0] * dt / 2, y + k1[1] * dt / 2, z + k1[2] * dt / 2);
      const k3 = F(x + k2[0] * dt / 2, y + k2[1] * dt / 2, z + k2[2] * dt / 2), k4 = F(x + k3[0] * dt, y + k3[1] * dt, z + k3[2] * dt);
      x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      z += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
      if (i >= 0) { pts[i * 3] = x; pts[i * 3 + 1] = z; pts[i * 3 + 2] = y; } // attractor axis -> screen vertical
    }
    return (aizawaCache = normalize(pts));
  }
  function aizawa(t, buf) {
    const v = view(buf, t * .3, .32 + .12 * Math.sin(t * .17), 1.45), P = aizawaPoints(), N = P.length / 3;
    const head = Math.floor(t * 240) % N;
    for (let i = 0; i < N; i++) {
      const behind = ((head - i) % N + N) % N;
      v.plot(P[i * 3], P[i * 3 + 1], P[i * 3 + 2], behind < 500 ? 1 - behind / 900 : -1);
    }
  }

  // Kleinian group limit set: Grandma's recipe with ta = tb = 2 (Apollonian gasket), sampled by a
  // seeded random walk over {a, b, A, B}, then lifted onto the Riemann sphere and rotated.
  const cm = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
  const cd = (p, q) => { const s = q[0] * q[0] + q[1] * q[1]; return [(p[0] * q[0] + p[1] * q[1]) / s, (p[1] * q[0] - p[0] * q[1]) / s]; };
  const ca = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const cs = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const csqrt = (p) => { const r = Math.hypot(p[0], p[1]), re = Math.sqrt((r + p[0]) / 2), im = Math.sqrt(Math.max(0, (r - p[0]) / 2)); return [re, p[1] < 0 ? -im : im]; };
  const inv = (m) => [m[3], [-m[1][0], -m[1][1]], [-m[2][0], -m[2][1]], m[0]];
  function grandma(ta, tb) {
    const two = [2, 0], four = [4, 0], i4 = [0, 4];
    const disc = cs(cm(cm(ta, ta), cm(tb, tb)), cm(four, ca(cm(ta, ta), cm(tb, tb))));
    const tab = cd(cs(cm(ta, tb), csqrt(disc)), two);
    const z0 = cd(cm(cs(tab, two), tb), ca(cs(cm(tb, tab), cm(two, ta)), cm([0, 2], tab)));
    const q = cs(cm(ta, tab), cm(two, tb));
    const a = [cd(ta, two), cd(ca(q, i4), cm(ca(cm(two, tab), four), z0)), cd(cm(cs(q, i4), z0), cs(cm(two, tab), four)), cd(ta, two)];
    const b = [cd(cs(tb, [0, 2]), two), cd(tb, two), cd(tb, two), cd(ca(tb, [0, 2]), two)];
    return [a, b, inv(a), inv(b)];
  }
  let kleinCache = null;
  function kleinPoints() {
    if (kleinCache) return kleinCache;
    const gens = grandma([2, 0], [2, 0]), N = 26000, pts = new Float32Array(N * 3);
    let seed = 0x52a, z = [.1, .2], last = -1, n = 0;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let it = 0; n < N && it < N * 3; it++) {
      let k; do k = Math.floor(rnd() * 4); while (last >= 0 && k === (last + 2) % 4);
      const g = gens[k];
      z = cd(ca(cm(g[0], z), g[1]), ca(cm(g[2], z), g[3]));
      last = k;
      if (!Number.isFinite(z[0]) || !Number.isFinite(z[1])) { z = [.1, .2]; last = -1; continue; }
      if (it < 60) continue;
      const s = z[0] * z[0] + z[1] * z[1] + 1; // inverse stereographic projection
      pts[n * 3] = 2 * z[0] / s; pts[n * 3 + 1] = (s - 2) / s; pts[n * 3 + 2] = 2 * z[1] / s; n++;
    }
    return (kleinCache = normalize(pts.subarray(0, n * 3)));
  }
  function kleinian(t, buf) {
    const v = view(buf, t * .28, .5 * Math.sin(t * .19) + .2, 1.75), P = kleinPoints();
    for (let i = 0; i < P.length; i += 3) v.plot(P[i], P[i + 1], P[i + 2], -1);
  }

  // Seifert surface of the trefoil (closed 2-braid σ1³): two stacked disks joined by three half-twisted bands.
  // The boundary of the surface (the trefoil itself) is drawn at full brightness.
  function seifert(t, buf) {
    const v = view(buf, t * .32, .22 + .14 * Math.sin(t * .23), 1.2);
    const R0 = .62, Y0 = .62, w = .3, bands = [0, TAU / 3, 2 * TAU / 3];
    const nearBand = (th) => bands.some((b) => { const d = Math.abs(((th - b) % TAU + TAU + Math.PI) % TAU - Math.PI); return d < w / R0; });
    for (const side of [Y0, -Y0]) {
      surface(v, (r, th, o) => { o[0] = r * Math.cos(th); o[1] = side; o[2] = r * Math.sin(th); },
        .02, R0, 16, 0, TAU, 120, (r, th) => r > R0 * .96 && !nearBand(th));
    }
    for (const phi of bands) {
      const cp = Math.cos(phi), sp = Math.sin(phi);
      surface(v, (s, q, o) => {
        const a = Math.PI * q, rr = R0 + .55 * Math.sin(a);
        const er = s * Math.sin(a), ef = s * Math.cos(a); // width direction rotates e_phi -> -e_phi: one half twist
        o[0] = (rr + er) * cp - ef * sp; o[1] = Y0 * Math.cos(a); o[2] = (rr + er) * sp + ef * cp;
      }, -w, w, 26, 0, 1, 80, (s) => Math.abs(s) > w * .95);
    }
  }

  function normalize(pts) {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pts.length; i++) { const k = i % 3; if (pts[i] < lo[k]) lo[k] = pts[i]; if (pts[i] > hi[k]) hi[k] = pts[i]; }
    const c = lo.map((l, k) => (l + hi[k]) / 2);
    let r = 0;
    for (let i = 0; i < pts.length; i += 3) r = Math.max(r, Math.hypot(pts[i] - c[0], pts[i + 1] - c[1], pts[i + 2] - c[2]));
    for (let i = 0; i < pts.length; i++) pts[i] = (pts[i] - c[i % 3]) / r;
    return pts;
  }

  const list = [
    { id: 'spirograph', name: 'Spirograph', zh: '繁花曲线', cmd: './spirograph --r=3/7', note: 'HYPOTROCHOID / 3 TURNS / REALTIME', render: spirograph },
    { id: 'aizawa', name: 'Aizawa Attractor', zh: 'Aizawa 吸引子', cmd: './aizawa --rk4', note: 'STRANGE ATTRACTOR / RK4 / REALTIME', render: aizawa },
    { id: 'kleinian', name: 'Kleinian Group', zh: '克莱因群极限集', cmd: './kleinian --ta=2 --tb=2', note: 'LIMIT SET / RIEMANN SPHERE / REALTIME', render: kleinian },
    { id: 'seifert', name: 'Seifert Surface', zh: '三叶结 Seifert 曲面', cmd: './seifert --knot=trefoil', note: 'SEIFERT SURFACE / TREFOIL / REALTIME', render: seifert },
    { id: 'donut', name: 'Donut', zh: '甜甜圈', cmd: './donut.c', note: 'ASCII TORUS / Z-BUFFER / REALTIME', render: donut },
  ];
  const get = (id) => list.find((s) => s.id === id) || list[list.length - 1];
  // Random shape that differs from the previous visit when possible.
  function pick(prev, rnd) {
    const pool = list.filter((s) => s.id !== prev);
    return pool[Math.floor((rnd || Math.random)() * pool.length) % pool.length].id;
  }
  const api = { list, get, pick };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RavenShapes = api;
})(typeof window !== 'undefined' ? window : globalThis);
