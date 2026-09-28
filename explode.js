(() => {
  // Exploded-assembly view: what's on screen is split into layers (backgrounds, header,
  // content blocks) that fan out along Z and are seen from the side, like a parts diagram.
  // Each layer gets the same camera (perspective + rotation about the viewport centre),
  // so no ancestor needs preserve-3d. Drag to orbit, wheel to change spacing, ESC to exit.
  const btn = document.getElementById('explode-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const MAX_DEPTH = 4;
  let on = false, layers = [], guides = null;
  let ay = -38, ax = 10, gap = 0, drag = null;

  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  };
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };

  // Split an element into its visible children until blocks are small enough to read as parts.
  function split(el, depth, out) {
    const kids = [...el.children].filter(visible);
    const big = el.getBoundingClientRect().height > innerHeight * 0.18;
    if (depth < MAX_DEPTH && kids.length >= 2 && big) kids.forEach((k) => split(k, depth + 1, out));
    else if (depth < MAX_DEPTH && kids.length === 1 && big) split(kids[0], depth + 1, out);
    else if (inView(el)) out.push(el);
  }

  function collect() {
    const out = [];
    // Backdrop layers first (fixed canvases / overlays behind the page).
    [...document.body.children].forEach((el) => {
      if (el.classList.contains('page') || el.matches('.shell-dock, .intro, .grain, .screen-noise, .spotlight, .ex-hud')) return;
      if (visible(el) && inView(el)) out.push(el);
    });
    const header = document.querySelector('.site-header');
    // Walk every section: pinned/sticky content can be on screen while its section box is not.
    const sections = [...document.querySelectorAll('main > section')].filter(visible);
    sections.forEach((s) => split(s, 0, out));
    if (header && visible(header) && inView(header)) out.push(header);
    const dock = document.querySelector('.shell-dock');
    if (dock && visible(dock) && inView(dock)) out.push(dock);
    return out;
  }

  function apply() {
    const n = layers.length;
    layers.forEach((l, i) => {
      const z = (i - (n - 1) / 2) * gap;
      l.el.style.setProperty('transform-origin', `${innerWidth / 2 - l.left}px ${innerHeight / 2 - l.top}px`, 'important');
      l.el.style.setProperty('transform',
        `perspective(3200px) scale(.58) rotateX(${ax}deg) rotateY(${ay}deg) translateZ(${z}px)`, 'important');
    });
  }

  function enter() {
    // Lock scroll first (overflow change can shift layout), then measure before transforming.
    // Also cancels any in-flight smooth scroll so measurements stay valid.
    const sy = scrollY;
    root.style.scrollBehavior = 'auto';
    // Exploded CSS lifts overflow clipping, which can re-activate sticky content,
    // so apply it first and measure the resulting layout.
    root.classList.add('is-exploded');
    scrollTo(0, sy);
    const els = collect();
    // Our transform replaces any existing one, so measure the untransformed box.
    els.forEach((el) => { el.style.setProperty('transition', 'none', 'important'); el.style.setProperty('transform', 'none', 'important'); });
    layers = els.map((el) => {
      const r = el.getBoundingClientRect();
      // transform-origin is relative to the element's own box, which already includes any prior transform offset.
      return { el, left: r.left, top: r.top };
    });
    gap = Math.min(110, 1000 / Math.max(layers.length, 1));
    layers.forEach((l, i) => {
      l.el.classList.add('ex-layer');
      // Label ::after needs a containing block; only touch elements that are static.
      if (getComputedStyle(l.el).position === 'static') l.el.classList.add('ex-static');
      l.el.dataset.exLayer = String(i).padStart(2, '0');
      // Ancestors stay flat on screen; strip their paint so only the layers are visible.
      for (let a = l.el.parentElement; a && a !== document.body; a = a.parentElement) a.classList.add('ex-host');
    });
    guides = document.createElement('div');
    guides.className = 'ex-hud';
    guides.innerHTML = `<span>EXPLODED VIEW // ${layers.length} LAYERS</span><span>DRAG 旋转 · WHEEL 间距 · ESC 退出</span><button type="button" class="ex-exit">EXIT ×</button>`;
    guides.querySelector('.ex-exit').addEventListener('click', () => set(false));
    document.body.appendChild(guides);
    document.body.offsetWidth;
    els.forEach((el) => el.style.removeProperty('transition'));
    requestAnimationFrame(apply);
  }

  function exit() {
    layers.forEach(({ el }) => {
      el.classList.remove('ex-layer', 'ex-static');
      delete el.dataset.exLayer;
      el.style.removeProperty('transform');
      el.style.removeProperty('transform-origin');
    });
    layers = [];
    document.querySelectorAll('.ex-host').forEach((a) => a.classList.remove('ex-host'));
    guides?.remove();
    root.classList.remove('is-exploded');
    root.style.scrollBehavior = '';
  }

  function set(state) {
    on = state;
    on ? enter() : exit();
    btn.setAttribute('aria-pressed', String(on));
    btn.title = on ? '退出 3D 拆解视图 [ESC]' : '3D 拆解视图';
  }

  btn.addEventListener('click', () => set(!on));
  addEventListener('keydown', (e) => { if (on && e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (on) { set(false); set(true); } });

  addEventListener('pointerdown', (e) => {
    if (!on || e.button !== 0 || e.target.closest('#explode-toggle, .ex-hud')) return;
    drag = { x: e.clientX, y: e.clientY, ax, ay };
    e.preventDefault();
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    ay = Math.max(-89, Math.min(89, drag.ay + (e.clientX - drag.x) * 0.2));
    ax = Math.max(-60, Math.min(60, drag.ax - (e.clientY - drag.y) * 0.2));
    apply();
  });
  addEventListener('pointerup', () => { drag = null; });
  addEventListener('wheel', (e) => {
    if (!on) return;
    e.preventDefault();
    gap = Math.max(10, Math.min(400, gap - Math.sign(e.deltaY) * 15));
    apply();
  }, { passive: false });
})();
