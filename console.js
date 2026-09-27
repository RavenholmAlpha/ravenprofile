// console.js — DevTools easter egg: banner, contact, and a few words you can type into the console.
(() => {
  'use strict';
  // ANSI Shadow glyphs; each letter is 6 rows of equal width so they can be joined side by side.
  const G = {
    R: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██║  ██║', '╚═╝  ╚═╝'],
    A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
    V: ['██╗   ██╗', '██║   ██║', '██║   ██║', '╚██╗ ██╔╝', ' ╚████╔╝ ', '  ╚═══╝  '],
    E: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
    N: ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
    H: ['██╗  ██╗', '██║  ██║', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
    S: ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
  };
  const word = (s) => G.R.map((_, row) => [...s].map((c) => G[c][row]).join('')).join('\n');
  const mail = 'raven@nekocats.org';
  const mono = 'font-family: "Cascadia Mono", Consolas, monospace;';
  const green = mono + 'color:#7df1aa; font-size:11px; line-height:1.15;';
  const dim = mono + 'color:#91a39d; font-size:11px;';
  const cyan = mono + 'color:#7dd9e4; font-size:11px; font-weight:bold;';

  console.log('%c' + word('RAVEN') + '\n' + word('HASH'), green);
  console.log(
    '%c> 你打开了控制台。\n> 那我们大概是同一类人。\n\n%c  mail  %c' + mail + '\n%c  code  %chttps://github.com/RavenholmAlpha\n\n%c> 试试输入: whoami / hint / sudo',
    dim, dim, cyan, dim, cyan, dim,
  );

  // Typing these bare words into the console prints something. Getters only log, never navigate.
  const words = {
    whoami: () => console.log('%cRaven. 其余的你已经在看了。\n' + mail, dim),
    hint: () => console.log('%c> 首页的 RAVENHASH，选中它试试。\n> 页面底部的 shell 也能用，按 / 聚焦。', dim),
    sudo: () => console.log('%cguest is not in the sudoers file. This incident will be reported.', 'color:#ff5a6a;' + mono),
  };
  for (const [name, fn] of Object.entries(words)) {
    if (name in window) continue;
    Object.defineProperty(window, name, { configurable: true, get() { fn(); return undefined; } });
  }
})();
