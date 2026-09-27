(() => {
  // Visual effects layer. Runs after site.js; does not touch the donut renderer.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;

  // Scroll progress + current nav item
  const bar = $('#scroll-progress');
  const navLinks = [...document.querySelectorAll('.header-nav a')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * .4) current = s;
    navLinks.forEach((a) => a.classList.toggle('is-current', current && a.getAttribute('href') === '#' + current.id));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Keep the donut centered directly behind the RAVENHASH title.
  const heroVisual = $('.hero--center .hero-visual'), heroTitle = $('#hero-title'), heroLayout = $('.hero--center .hero-layout');
  function alignDonut() {
    if (!heroVisual || !heroTitle || !heroLayout) return;
    const L = heroLayout.getBoundingClientRect(), T = heroTitle.getBoundingClientRect();
    heroVisual.style.top = (T.top + T.height / 2 - L.top) + 'px';
  }
  addEventListener('resize', alignDonut, { passive: true });
  if (document.fonts) document.fonts.ready.then(alignDonut);
  alignDonut();

  // Pointer spotlight, donut tilt, tab light
  const stage = $('.donut-stage');
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    let raf = 0, px = 0, py = 0;
    addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty('--mx', px + 'px');
        root.style.setProperty('--my', py + 'px');
        if (stage) {
          const r = stage.getBoundingClientRect();
          const dx = (px - (r.left + r.width / 2)) / innerWidth;
          const dy = (py - (r.top + r.height / 2)) / innerHeight;
          stage.style.setProperty('--rx', (dx * 14).toFixed(2) + 'deg');
          stage.style.setProperty('--ry', (-dy * 10).toFixed(2) + 'deg');
        }
      });
    }, { passive: true });
    document.addEventListener('pointermove', (e) => {
      const tab = e.target.closest && e.target.closest('.project-tab');
      if (!tab) return;
      const r = tab.getBoundingClientRect();
      tab.style.setProperty('--lx', (e.clientX - r.left) + 'px');
      tab.style.setProperty('--ly', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // Reveal for the Smooth lab (site.js already handles headings/workspaces)
  const lab = $('.smooth-lab');
  if (lab && !reduced && 'IntersectionObserver' in window) {
    lab.classList.add('reveal');
    new IntersectionObserver((entries, obs) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
    }), { threshold: .08 }).observe(lab);
  }

  // Smooth Context demo: watch -> slide -> compact -> splice
  const win = $('#smooth-window'), lane = $('#smooth-lane'), panel = $('.smooth-panel');
  if (!win || !lane || !panel) return;
  const SLOTS = 24, LIMIT = 20; // threshold at 85%
  const steps = [...document.querySelectorAll('#smooth-steps li')];
  const modeEl = $('#smooth-mode'), levelEl = $('#smooth-level'), jobEl = $('#smooth-job'), logEl = $('#smooth-log');
  const threshold = win.querySelector('.smooth-threshold');
  const modes = { watch: [0, 'WATCHING'], slide: [1, 'SLIDING'], compact: [2, 'SLIDING + COMPACTING'], splice: [3, 'SPLICED'] };
  let ctx = ['hist', 'hist', 'live'], queue = [], mode = 'watch', work = 0, hold = 0;

  function block(kind) { const b = document.createElement('i'); b.className = 'blk ' + kind; return b; }
  function render(log) {
    win.replaceChildren(...ctx.map(block), threshold);
    lane.replaceChildren(...queue.map(() => block('hist')));
    lane.classList.toggle('working', mode === 'compact');
    panel.dataset.mode = mode;
    const [idx, label] = modes[mode];
    steps.forEach((li, i) => li.classList.toggle('is-active', i === idx));
    modeEl.textContent = label;
    levelEl.textContent = String(Math.round(ctx.length / SLOTS * 100)).padStart(3, '0') + '%';
    jobEl.textContent = mode === 'compact' ? 'COMPACTING ' + queue.length + ' TURNS' : mode === 'splice' ? 'MERGED' : queue.length ? 'QUEUED' : 'IDLE';
    if (log) logEl.textContent = '> ' + log;
  }
  function pushTurn() {
    ctx = ctx.map((k) => (k === 'live' ? 'hist' : k));
    ctx.push('live');
  }
  function tick() {
    if (mode === 'watch') {
      pushTurn();
      if (ctx.length >= LIMIT) { mode = 'slide'; render('context.level >= 85% // switch to sliding window'); return; }
      render('turn appended // level ' + Math.round(ctx.length / SLOTS * 100) + '%');
    } else if (mode === 'slide' || mode === 'compact') {
      pushTurn();
      const at = ctx.findIndex((k) => k === 'hist');
      queue.push(ctx.splice(at, 1)[0]);
      if (mode === 'slide' && queue.length >= 2) { mode = 'compact'; work = 0; }
      if (mode === 'compact' && ++work >= 5) {
        mode = 'splice';
        ctx = ctx.filter((k) => k !== 'sum');
        ctx.unshift('sum');
        queue = []; hold = 0;
        render('compactor.done // summary spliced at head, raw recent turns intact');
        return;
      }
      render(mode === 'slide' ? 'oldest turn slid out // task keeps running' : 'background compaction ' + work + '/5 // no pause');
    } else if (mode === 'splice') {
      if (++hold >= 3) {
        // Restart once the window is near full again; keep the summary block at head.
        mode = 'watch';
        if (ctx.length >= LIMIT - 2) ctx = ['sum', 'hist', 'hist', 'live'];
      }
      render(mode === 'watch' ? 'context.watch()' : null);
    }
  }
  if (reduced) {
    ctx = ['sum', ...Array(15).fill('hist'), 'live']; mode = 'splice';
    render('summary spliced at head, raw recent turns intact');
    return;
  }
  render('context.watch()');
  let timer = 0;
  new IntersectionObserver(([en]) => {
    clearInterval(timer);
    if (en.isIntersecting) timer = setInterval(tick, 650);
  }).observe(panel);
})();
