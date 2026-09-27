(() => {
  const { projects, resolveCommand } = window.RavenShell;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (selector) => document.querySelector(selector);

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  const chapterState = {};

  function makeLink(label, href) {
    const link = element('a', '', label);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function renderProject(project, group) {
    const panel = $(`#${group}-console`);
    panel.replaceChildren();
    panel.classList.remove('swap');
    void panel.offsetWidth;
    if (!reducedMotion.matches) panel.classList.add('swap');
    panel.setAttribute('aria-labelledby', `tab-${project.id}`);

    const bar = element('div', 'console-bar');
    bar.append(element('span', '', `/projects/${group}/${project.id}.sys`));
    const state = element('span');
    state.append(element('i'));
    state.append(document.createTextNode('PROCESS ONLINE'));
    bar.append(state);

    const main = element('div', 'console-main');
    main.append(element('p', 'console-eyebrow', `${group === 'agent' ? 'AGENT SYSTEMS' : 'INFORMATION FREEDOM'} // ${project.kind}`));
    main.append(element('h3', 'console-title', project.name));
    main.append(element('p', 'console-summary', project.summary));
    main.append(element('p', 'console-detail', project.detail));

    const lower = element('div', 'console-lower');
    const diagramSide = element('div');
    const diagramHeading = element('div', 'console-col-title');
    diagramHeading.append(element('span', '', 'SYSTEM TOPOLOGY'), element('span', '', 'LIVE TRACE'));
    const diagram = element('pre', 'console-diagram');
    project.diagram.forEach((line) => diagram.append(element('span', 'diagram-line', line)));
    diagramSide.append(diagramHeading, diagram);

    const factsSide = element('div');
    const factsHeading = element('div', 'console-col-title');
    factsHeading.append(element('span', '', 'CAPABILITIES'), element('span', '', '03 MODULES'));
    const facts = element('ul', 'console-facts');
    project.capabilities.forEach((fact) => facts.append(element('li', '', fact)));
    const stack = element('div', 'console-stack');
    project.stack.forEach((item) => stack.append(element('span', '', item)));
    factsSide.append(factsHeading, facts, stack);
    lower.append(diagramSide, factsSide);

    const footer = element('div', 'console-footer');
    footer.append(makeLink('READ README ↗', project.readme));
    if (project.source) footer.append(makeLink('VIEW SOURCE ↗', project.source));
    footer.append(element('span', 'console-index', `R/H :: ${project.id.toUpperCase()}`));
    panel.append(bar, main, lower, footer);
    chapterState[group].active = project.id;
    chapterState[group].diagram = [...diagram.children];
    chapterState[group].navFoot.textContent = `> inspect ${project.id}_`;
    chapterState[group].buttons.forEach((button) => {
      const selected = button.dataset.project === project.id;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function selectProject(id, scroll = false) {
    const project = projects.find((entry) => entry.id === id);
    if (!project) return;
    renderProject(project, project.group);
    if (scroll) document.getElementById(project.group === 'agent' ? 'agent' : 'protocol')
      .scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  for (const group of ['agent', 'protocol']) {
    const entries = projects.filter((project) => project.group === group);
    const tabs = $(`#${group}-tabs`);
    chapterState[group] = { active: null, buttons: [], diagram: [], navFoot: $(`#${group} .project-nav-foot`) };
    entries.forEach((project, index) => {
      const button = element('button', 'project-tab');
      button.id = `tab-${project.id}`;
      button.type = 'button';
      button.role = 'tab';
      button.dataset.project = project.id;
      button.setAttribute('aria-controls', `${group}-console`);
      const heading = element('span', 'project-tab-line');
      heading.append(element('span', 'project-tab-index', String(index + 1).padStart(2, '0')));
      heading.append(element('span', 'project-tab-name', project.name));
      heading.append(element('span', 'project-tab-arrow', '↗'));
      button.append(heading, element('span', 'project-tab-kind', project.kind), element('span', 'project-tab-summary', project.summary));
      button.addEventListener('click', () => selectProject(project.id));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const step = event.key === 'Home' ? -index : event.key === 'End' ? entries.length - index - 1 :
          ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
        const next = (index + step + entries.length) % entries.length;
        selectProject(entries[next].id);
        chapterState[group].buttons[next].focus();
      });
      tabs.append(button);
      chapterState[group].buttons.push(button);
    });
    selectProject(entries[0].id);
  }

  const output = $('#shell-output');
  const lines = $('#shell-lines');
  const input = $('#shell-input');
  const toggle = $('#toggle-shell');
  const commandHistory = [];
  let historyIndex = 0;

  function addLine(value, kind = '') {
    lines.append(element('div', `shell-line ${kind}`.trim(), value));
    while (lines.childElementCount > 80) lines.firstElementChild.remove();
    lines.scrollTop = lines.scrollHeight;
  }
  addLine('RavenHASH shell online. Type help to explore.');

  function setOutputOpen(open) {
    output.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    const label = open ? '收起 Shell 输出' : '展开 Shell 输出';
    toggle.title = label;
    toggle.setAttribute('aria-label', label);
  }
  toggle.addEventListener('click', () => setOutputOpen(output.hidden));
  $('#close-output').addEventListener('click', () => setOutputOpen(false));

  function runAction(action) {
    if (!action) return;
    if (action.type === 'open') window.open(action.target, '_blank', 'noopener,noreferrer');
    if (action.type === 'navigate') document.getElementById(action.target)?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    if (action.type === 'inspect') selectProject(action.target, true);
    if (action.type === 'theme') {
      document.documentElement.dataset.theme = action.target;
      if (reducedMotion.matches) drawAll(1.8);
    }
    if (action.type === 'clear') lines.replaceChildren();
    if (action.type === 'replay') { setOutputOpen(false); beginIntro(); }
  }

  $('#shell-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const command = input.value.trim();
    if (!command) return;
    commandHistory.push(command);
    historyIndex = commandHistory.length;
    input.value = '';
    setOutputOpen(true);
    addLine(`guest@raven:~$ ${command}`, 'command');
    const result = resolveCommand(command);
    result.lines.forEach((line) => addLine(line, line.startsWith('Unknown') || line.startsWith('Project not found') ? 'error' : ''));
    runAction(result.action);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && historyIndex > 0) {
      event.preventDefault();
      input.value = commandHistory[--historyIndex];
    } else if (event.key === 'ArrowDown' && historyIndex < commandHistory.length) {
      event.preventDefault();
      input.value = commandHistory[++historyIndex] || '';
    }
  });

  const intro = $('#intro');
  const introWordmark = $('.intro-wordmark');
  const introStages = [
    { at: 0, phase: 'INITIALIZING', command: '> init ravenhash --mode=operator', line: 'Locating operator...', status: 'LINK 00 // BOOT' },
    { at: 1400, phase: 'IDENTITY LOCK', command: '> auth --user Raven --handle RavenHASH', line: 'RAVEN // RAVENHASH // ACCESS VERIFIED', status: 'LINK 01 // IDENTITY' },
    { at: 2900, phase: 'RENDER ENGINE', command: '> ./donut.c --z-buffer --realtime', line: 'ASCII TORUS ONLINE // PROCESS ALIVE', status: 'LINK 02 // VISUAL CORE' },
    { at: 4800, phase: 'SYSTEM TOPOLOGY', command: '> mount agent:// && route freedom://', line: 'TWO SYSTEMS. ONE OPERATOR.', status: 'LINK 03 // NETWORK' },
    { at: 6600, phase: 'ACCESS GRANTED', command: '> enter ravenhash', line: 'WELCOME TO THE MACHINE, RAVEN.', status: 'LINK 04 // READY' },
  ];
  const bootLogs = [
    [200, '[ OK ] bootloader mounted'], [820, '[ OK ] operator: Raven'],
    [1510, '[ OK ] alias: RavenHASH'], [2320, '[ OK ] permissions: granted'],
    [3080, '[ OK ] donut.c: z-buffer online'], [4150, '[ OK ] render loop: 30 fps'],
    [5030, '[ OK ] agent systems: 03 processes'], [5910, '[ OK ] freedom routes: 03 protocols'],
    [6830, '[ OK ] shell: interactive'], [7600, '[ OK ] system ready'],
  ];
  const introDuration = 8400;
  let introStart = 0;
  let introFrame = 0;
  let introHideTimeout = 0;

  function finishIntro() {
    cancelAnimationFrame(introFrame);
    clearTimeout(introHideTimeout);
    intro.classList.remove('glitch');
    intro.classList.add('done');
    intro.setAttribute('aria-hidden', 'true');
    $('#page').inert = false;
    $('.shell-dock').inert = false;
    document.body.style.overflow = '';
    if (intro.contains(document.activeElement)) $('.header-brand').focus({ preventScroll: true });
    introHideTimeout = setTimeout(() => { intro.hidden = true; }, 520);
  }

  function introTick(now) {
    const elapsed = now - introStart;
    const progress = Math.min(1, elapsed / introDuration);
    const index = introStages.findLastIndex((stage) => elapsed >= stage.at);
    const stage = introStages[Math.max(0, index)];
    intro.dataset.stage = String(index);
    $('#intro-stage-count').textContent = `${String(index + 1).padStart(2, '0')} / 05`;
    $('#intro-phase').textContent = stage.phase;
    $('#intro-command').textContent = stage.command;
    $('#intro-line').textContent = stage.line;
    $('#intro-status').textContent = stage.status;
    $('#intro-progress').style.width = `${(progress * 100).toFixed(1)}%`;
    $('#intro-percent').textContent = `${String(Math.floor(progress * 100)).padStart(3, '0')}%`;
    $('#intro-time').textContent = `00:00:${String(Math.floor(elapsed / 1000)).padStart(2, '0')}`;
    $('#intro-logs').textContent = bootLogs.filter(([time]) => elapsed >= time).slice(-5).map(([, line]) => line).join('\n');
    const reveal = index === 0 ? Math.min(elapsed / 1250, 1) : 1;
    introWordmark.style.clipPath = `inset(0 ${100 - reveal * 100}% 0 0)`;
    intro.classList.toggle('glitch', [1420, 2900, 4800, 6610].some((time) => Math.abs(elapsed - time) < 160));
    if (window.RavenIntroFX) window.RavenIntroFX.draw(elapsed); else drawIntroField(elapsed);
    if (progress >= 1) finishIntro();
    else introFrame = requestAnimationFrame(introTick);
  }

  function beginIntro() {
    if (reducedMotion.matches) { finishIntro(); return; }
    clearTimeout(introHideTimeout);
    cancelAnimationFrame(introFrame);
    intro.hidden = false;
    intro.classList.remove('done', 'glitch');
    intro.removeAttribute('aria-hidden');
    intro.dataset.stage = '0';
    introWordmark.style.clipPath = 'inset(0 100% 0 0)';
    $('#page').inert = true;
    $('.shell-dock').inert = true;
    document.body.style.overflow = 'hidden';
    $('#skip-intro').focus({ preventScroll: true });
    resizeAll();
    if (window.RavenIntroFX) window.RavenIntroFX.fit();
    introStart = performance.now();
    introFrame = requestAnimationFrame(introTick);
  }

  $('#skip-intro').addEventListener('click', finishIntro);
  $('#replay-intro').addEventListener('click', beginIntro);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!intro.hidden && !intro.classList.contains('done')) finishIntro();
      else if (!output.hidden) setOutputOpen(false);
    }
    if (event.key === '/' && (intro.hidden || intro.classList.contains('done')) &&
      document.activeElement !== input && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      input.focus();
    }
  });

  const timeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  function updateClock() { $('#clock').textContent = `${timeFormatter.format(new Date())} CST`; }
  updateClock();
  setInterval(updateClock, 1000);
  $('#year').textContent = String(new Date().getFullYear());

  const canvases = {
    ambient: { canvas: $('#ambient') },
    donut: { canvas: $('#donut') },
    introField: { canvas: $('#intro-field') },
    introDonut: { canvas: $('#intro-donut') },
  };
  Object.values(canvases).forEach((item) => { item.context = item.canvas.getContext('2d'); });
  const glyphs = '01[]{}<>+=:*#';
  const particles = Array.from({ length: 165 }, (_, index) => ({
    x: (index * .61803398875) % 1,
    y: (index * .75487766625) % 1,
    speed: .006 + ((index * 17) % 13) * .0018,
    glyph: glyphs[index % glyphs.length],
    tone: index % 21,
  }));
  const ramp = '.,-~:;=!*#$@';
  const donutWidth = 62;
  const donutHeight = 34;
  const depth = new Float32Array(donutWidth * donutHeight);
  const cells = new Uint8Array(donutWidth * donutHeight);
  const palettes = {
    green: ['#1a4a35', '#226245', '#2d8057', '#3b9b68', '#4bb57a', '#60d491', '#7df1aa', '#a1f8c0', '#79dce2', '#b3eeec', '#ffe09d', '#ffffff'],
    amber: ['#4b351c', '#664925', '#89602d', '#ad7b3a', '#cd9447', '#e7ad5e', '#ffc77c', '#ffdda2', '#7dd9e4', '#aeedf0', '#ffe6bb', '#ffffff'],
    ice: ['#204650', '#28606a', '#317b84', '#3e9ca3', '#56b8bd', '#70d0d5', '#8de5ed', '#b6f2f4', '#dfbbd9', '#eee0e9', '#f9f0f4', '#ffffff'],
  };

  function resizeCanvas(item) {
    const rect = item.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (item.canvas.width !== width || item.canvas.height !== height) {
      item.canvas.width = width;
      item.canvas.height = height;
    }
    item.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    item.width = rect.width;
    item.height = rect.height;
  }
  function resizeAll() { Object.values(canvases).forEach(resizeCanvas); }
  window.addEventListener('resize', () => { resizeAll(); if (reducedMotion.matches) drawAll(1.8); }, { passive: true });
  resizeAll();

  function drawAmbient(seconds) {
    const { context, width, height } = canvases.ambient;
    context.clearRect(0, 0, width, height);
    context.font = '11px Consolas, monospace';
    context.textBaseline = 'middle';
    for (const particle of particles) {
      const x = particle.x * width;
      const y = ((particle.y + seconds * particle.speed) % 1) * height;
      context.fillStyle = particle.tone === 0 ? 'rgba(125,241,170,.43)' :
        particle.tone === 4 ? 'rgba(125,217,228,.32)' :
          particle.tone === 8 ? 'rgba(255,199,124,.22)' : 'rgba(125,241,170,.10)';
      context.fillText(particle.glyph, x, y);
    }
    const scan = (seconds * 22) % height;
    context.fillStyle = 'rgba(125,241,170,.055)';
    context.fillRect(0, scan, width, 1);
  }

  function drawTorus(item, seconds) {
    const { context, width, height } = item;
    if (!width || !height) return;
    const shade = palettes[document.documentElement.dataset.theme] || palettes.green;
    context.clearRect(0, 0, width, height);
    depth.fill(0);
    cells.fill(0);
    const A = .36 + seconds * .78;
    const B = .42 + seconds * .38;
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    for (let j = 0; j < Math.PI * 2; j += .075) {
      const ct = Math.cos(j), st = Math.sin(j);
      for (let i = 0; i < Math.PI * 2; i += .032) {
        const sp = Math.sin(i), cp = Math.cos(i);
        const h = ct + 2;
        const D = 1 / (sp * h * sA + st * cA + 5);
        const t = sp * h * cA - st * sA;
        const x = Math.round(donutWidth / 2 + 36 * D * (cp * h * cB - t * sB));
        const y = Math.round(donutHeight / 2 + 29 * D * (cp * h * sB + t * cB));
        if (x < 0 || x >= donutWidth || y < 0 || y >= donutHeight) continue;
        const index = y * donutWidth + x;
        if (D <= depth[index]) continue;
        depth[index] = D;
        const light = (st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB;
        cells[index] = Math.max(1, Math.min(ramp.length, Math.floor(Math.max(0, light / 1.42) * ramp.length) + 1));
      }
    }
    const cellWidth = width / donutWidth;
    const cellHeight = height / donutHeight;
    context.font = `${Math.max(6, Math.floor(cellHeight * .96))}px Consolas, monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (let y = 0; y < donutHeight; y++) {
      for (let x = 0; x < donutWidth; x++) {
        const value = cells[y * donutWidth + x];
        if (!value) continue;
        context.fillStyle = shade[value - 1];
        context.fillText(ramp[value - 1], (x + .5) * cellWidth, (y + .52) * cellHeight);
      }
    }
    if (item === canvases.donut) {
      $('#angle-a').textContent = (A % (Math.PI * 2)).toFixed(2);
      $('#angle-b').textContent = (B % (Math.PI * 2)).toFixed(2);
    }
  }

  function drawIntroField(elapsed) {
    const { context, width, height } = canvases.introField;
    context.clearRect(0, 0, width, height);
    context.font = '11px Consolas, monospace';
    context.textBaseline = 'middle';
    const count = Math.floor(width / 14);
    for (let column = 0; column < count; column++) {
      const speed = 40 + (column * 13) % 65;
      const lead = (elapsed / 1000 * speed + column * 61) % (height + 190) - 95;
      const x = column * 14 + 3;
      for (let trail = 0; trail < 9; trail++) {
        const y = lead - trail * 16;
        if (y < 40 || y > height - 55) continue;
        if (y > height * .27 && y < height * .68 && x > width * .12 && x < width * .9) continue;
        const glyph = glyphs[(column * 17 + trail * 11 + Math.floor(elapsed / 130)) % glyphs.length];
        context.fillStyle = trail === 0 ? 'rgba(141,245,190,.8)' : trail < 3 ? 'rgba(125,241,170,.38)' : 'rgba(125,241,170,.13)';
        context.fillText(glyph, x, y);
      }
    }
    context.fillStyle = 'rgba(125,217,228,.24)';
    context.fillRect(0, (elapsed * .14) % height, width, 1);
  }

  function drawAll(seconds) {
    drawAmbient(seconds);
    drawTorus(canvases.donut, seconds);
    if (!window.RavenIntroFX && !intro.hidden && ['2', '3'].includes(intro.dataset.stage)) drawTorus(canvases.introDonut, seconds * 1.4);
    for (const group of ['agent', 'protocol']) {
      const lines = chapterState[group].diagram;
      if (!lines.length) continue;
      const hot = Math.floor(seconds * 2) % lines.length;
      lines.forEach((line, index) => line.classList.toggle('is-hot', index === hot));
    }
  }
  let lastFrame = -Infinity;
  function animationFrame(now) {
    if (now - lastFrame > 33 && !document.hidden) {
      drawAll(reducedMotion.matches ? 1.8 : now / 1000);
      lastFrame = now;
    }
    if (!reducedMotion.matches) requestAnimationFrame(animationFrame);
  }
  requestAnimationFrame(animationFrame);

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.chapter-heading, .chapter-workspace').forEach((node) => {
      node.classList.add('reveal');
      observer.observe(node);
    });
  }

  if (reducedMotion.matches || new URLSearchParams(location.search).has('skipintro')) finishIntro();
  else beginIntro();
})();
