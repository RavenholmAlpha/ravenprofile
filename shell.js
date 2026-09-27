(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RavenShell = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const projects = [
    {
      id: 'corvusai', name: 'CorvusAI', group: 'agent', kind: 'AGENT RUNTIME',
      summary: '面向多项目软件工程的持久化 AI Agent 运行时。',
      detail: '终端界面、本地 WebUI、SQLite 状态、专家 Agent 与 MCP 互操作；完整接入 Vault 做任务交接与项目记忆，并以 Smooth Context 在上下文将满时无缝切换滑动窗口、后台压缩后再拼接。',
      stack: ['Node.js', 'SQLite', 'MCP', 'TUI', 'Vault'],
      capabilities: ['跨项目编排', '完整接入 Vault', 'Smooth Context 无损续航'],
      diagram: [
        'USER / IDE / WEBHOOK',
        '        |',
        'TUI --- WEBUI --- CLI',
        '        |',
        'GLOBAL ORCHESTRATOR',
        '  +-- PROJECT AGENTS',
        '  +-- TOOLS / MCP / SKILLS',
        '        |',
        'SMOOTH CONTEXT ~ SLIDE + COMPACT',
        '        |',
        'VAULT / SQLITE / MEMORY',
      ],
      readme: './CorvusAI_README_zh.md',
      source: 'https://github.com/RavenholmAlpha/CorvusAI',
    },
    {
      id: 'tsunami-ai', name: 'TSUNAMI AI', group: 'agent', kind: 'DESKTOP AGENT',
      summary: 'Windows 优先的桌面 Coding Agent Harness。',
      detail: 'Electron UI 连接独立常驻的 Runtime Host，提供真实工具循环与多 Agent 协作；完整接入 Vault 保存任务、快照与跨会话记忆，Smooth Context 让长任务在上下文临界时不断档、不失真。',
      stack: ['Electron', 'TypeScript', 'Pi RPC', 'Vault'],
      capabilities: ['常驻 Runtime Host', '完整接入 Vault', 'Smooth Context 无损续航'],
      diagram: [
        'ELECTRON UI',
        '    | IPC / NAMED PIPE',
        'RUNTIME HOST [PERSISTENT]',
        '  +-- AGENT ENGINE / PI RPC',
        '  +-- GOALS / MULTI-AGENT',
        '  +-- SMOOTH CONTEXT / SLIDE + COMPACT',
        '    |',
        'VAULT + SQLITE + MEMORY',
      ],
      readme: './TusnamiAI_README.md', source: null,
    },
    {
      id: 'vault', name: 'Vault', group: 'agent', kind: 'AGENT INFRASTRUCTURE',
      summary: '多 Agent 协作的结构化状态与任务交接服务。',
      detail: '用 Commit、Scope Lease、Snapshot 与 Artifact 保存可追溯的协作状态，降低跨 Agent 交接和冲突成本。CorvusAI 与 TSUNAMI AI 均已完整接入。',
      stack: ['SQLite', 'MCP', 'HTTP API', 'CLI'],
      capabilities: ['Scope Lease', '结构化 Commit', 'Snapshot / Artifact'],
      diagram: [
        'CORVUSAI     TSUNAMI AI',
        '    |         |',
        '  CLAIM SCOPE / LEASE',
        '          |',
        'TASK -> COMMIT -> SNAPSHOT',
        '          |',
        '      ARTIFACTS',
        '          |',
        '    SQLITE + FILE STORE',
      ],
      readme: './VAULT_README.md',
      source: 'https://github.com/RavenholmAlpha/vault',
    },
    {
      id: 'tsunami', name: 'tsunami / protocol', group: 'protocol', kind: 'TLS TRANSPORT',
      summary: '基于 TLS 1.3 的高性能多路复用代理协议。',
      detail: '以 TLS 1.3、uTLS 指纹、透明回退与可编程填充实现多路复用 TCP/UDP 传输。',
      stack: ['Go', 'TLS 1.3', 'uTLS', 'Multiplexing'],
      capabilities: ['TLS 1.3 / uTLS', '单连接多路复用', '认证失败透明回退'],
      diagram: [
        'CLIENT / uTLS HELLO',
        '        | TLS 1.3',
        '        v',
        '   TSUNAMI SERVER',
        '    +-- AUTH  -> MUX TCP / UDP',
        '    +-- OTHER -> REAL WEBSITE',
        '        |',
        '  PADDING / SURGE / FALLBACK',
      ],
      readme: './tsunami_README.zh.md',
      source: 'https://github.com/RavenholmAlpha/tsunami',
    },
    {
      id: 'wave', name: 'Wave', group: 'protocol', kind: 'WEBSOCKET TRANSPORT',
      summary: '伪装为真实 WebSocket 应用的隧道协议。',
      detail: '通过插件化编码、流量整形、主动探测回落与连接轮换，让 WebSocket 隧道贴近正常业务流量。',
      stack: ['WebSocket', 'ChaCha20-Poly1305', 'SOCKS5'],
      capabilities: ['WebSocket 应用伪装', '流量整形与噪声', '连接池轮换'],
      diagram: [
        'SOCKS5 / HTTP CONNECT',
        '         |',
        'WAVE CLIENT == WS / TLS ==',
        '         |         WAVE SERVER',
        '  ENCODE / SHAPE / NOISE',
        '         |',
        '  APP-LIKE FRAMES -> TARGET',
        '  INVALID AUTH -> REAL SITE',
      ],
      readme: './WAVE_README.md', source: null,
    },
    {
      id: 'segment', name: 'SEGMENT', group: 'protocol', kind: 'HTTP/2 TRANSPORT',
      summary: '藏在功能型视频流媒体站点后的加密多路复用代理。',
      detail: '普通访客获得真实 HLS/DASH 内容；认证客户端通过媒体形态的 HTTP/2 流使用加密 TCP 与 UDP 隧道。',
      stack: ['Go', 'HTTP/2', 'HLS / DASH', 'AES-256-GCM'],
      capabilities: ['真实 HLS / DASH 伪站', 'HTTP/2 媒体形态', '加密 TCP / UDP'],
      diagram: [
        'BROWSER -> MEDIA PORTAL',
        '           HLS / DASH / MP4',
        '                |',
        'CLIENT -> HTTP/2 MEDIA STREAM',
        '                | AUTH',
        '          AES-256-GCM',
        '             /     /',
        '           TCP     UDP',
      ],
      readme: './SEGMENT_README.zh.md',
      source: 'https://github.com/RavenholmAlpha/SEGMENT',
    },
  ];

  const aliases = {
    corvus: 'corvusai', 'tsunamiai': 'tsunami-ai', 'tsunami_ai': 'tsunami-ai',
    'tsunami-protocol': 'tsunami', 'tsunami/protocol': 'tsunami',
  };

  function findProject(value) {
    const key = value.toLowerCase().trim().replace(/\s+/g, '-');
    return projects.find((project) => project.id === (aliases[key] || key));
  }

  function resolveCommand(input) {
    const value = String(input || '').trim();
    if (!value) return { lines: [] };
    const [command, ...rest] = value.toLowerCase().split(/\s+/);
    const argument = rest.join(' ');

    if (command === 'help' || command === '?') return { lines: [
      'help                 show commands',
      'whoami               identify the operator',
      'ls [agent|protocol]  list the two systems',
      'cat <project>        read project details',
      'inspect <project>    focus project console',
      'open <project>       open source or README',
      'goto <section>       home / agent / smooth / freedom / contact',
      'smooth               explain Smooth Context',
      'theme <name>         green / amber / ice',
      'clear                clear shell output',
      'replay               restart boot sequence',
    ] };

    if (command === 'whoami') return { lines: [
      'Raven // RavenHASH',
      'Leet programmer. Builds agents that keep working and protocols for information freedom.',
    ] };

    if (command === 'ls' || command === 'projects') {
      if (argument && !['all', 'agent', 'protocol', 'freedom'].includes(argument)) {
        return { lines: ['Use ls, ls agent or ls protocol.'] };
      }
      const group = argument === 'freedom' ? 'protocol' : argument;
      const list = (name, items) => [name, ...items.map((project, index) =>
        `${String(index + 1).padStart(2, '0')}  ${project.name.padEnd(20, ' ')} ${project.kind}`)];
      const agents = projects.filter((project) => project.group === 'agent');
      const protocols = projects.filter((project) => project.group === 'protocol');
      return { lines: [
        ...(group !== 'protocol' ? list('/01 AGENT SYSTEMS', agents) : []),
        ...(group !== 'agent' ? list('/02 INFORMATION FREEDOM', protocols) : []),
      ] };
    }

    if (command === 'cat' || command === 'open' || command === 'inspect') {
      const project = findProject(argument);
      if (!project) return { lines: [`Project not found: ${argument || '(missing)'}`, 'Run ls to see available projects.'] };
      if (command === 'inspect') return { lines: [`Inspecting ${project.name}...`], action: {
        type: 'inspect', target: project.id,
      } };
      if (command === 'cat') return { lines: [
        `${project.name} // ${project.kind}`,
        project.summary,
        project.detail,
        `systems: ${project.capabilities.join(' / ')}`,
        `stack: ${project.stack.join(' / ')}`,
      ] };
      return { lines: [`Opening ${project.name}...`], action: {
        type: 'open', target: project.source || project.readme,
      } };
    }

    if (command === 'goto' || command === 'cd') {
      const sections = { projects: 'agent', builds: 'agent', work: 'agent', top: 'home', freedom: 'protocol', network: 'protocol', about: 'home' };
      const target = sections[argument] || argument;
      if (['home', 'agent', 'smooth', 'protocol', 'contact'].includes(target)) {
        return { lines: [`Moving to /${target}`], action: { type: 'navigate', target } };
      }
      return { lines: ['Unknown section. Use home, agent, smooth, freedom or contact.'] };
    }

    if (command === 'filter') {
      if (['agent', 'protocol', 'freedom'].includes(argument)) {
        const target = argument === 'freedom' ? 'protocol' : argument;
        return { lines: [`Moving to /${target}`], action: { type: 'navigate', target } };
      }
      return { lines: ['Use goto agent or goto freedom.'] };
    }

    if (command === 'theme') {
      if (['green', 'amber', 'ice'].includes(argument)) {
        return { lines: [`Theme: ${argument}`], action: { type: 'theme', target: argument } };
      }
      return { lines: ['Use theme green, theme amber or theme ice.'] };
    }

    if (command === 'smooth' || (command === 'cat' && argument === 'smooth')) return { lines: [
      'SMOOTH CONTEXT // CorvusAI + TSUNAMI AI',
      '1. watch   上下文水位接近阈值时触发',
      '2. slide   立即切换为滑动上下文，最近轮次原文保留，任务不暂停',
      '3. compact 后台压缩被滑出的历史，保留决策、约束与引用',
      '4. splice  压缩完成后把摘要拼接回窗口头部，回到常规上下文',
    ], action: { type: 'navigate', target: 'smooth' } };

    if (command === 'clear' || command === 'cls') return { lines: [], action: { type: 'clear' } };
    if (command === 'replay' || command === 'boot') return { lines: ['Reinitializing...'], action: { type: 'replay' } };
    if (command === 'github' || command === 'contact') return {
      lines: ['Opening RavenHASH on GitHub...'],
      action: { type: 'open', target: 'https://github.com/RavenholmAlpha' },
    };
    return { lines: [`Unknown command: ${command}`, 'Type help for available commands.'] };
  }

  return { projects, findProject, resolveCommand };
});
