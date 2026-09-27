const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveCommand, projects } = require('./shell.js');

test('lists the two project systems separately', () => {
  const result = resolveCommand('ls');
  assert.equal(projects.length, 6);
  assert.equal(projects.filter((project) => project.group === 'agent').length, 3);
  assert.equal(projects.filter((project) => project.group === 'protocol').length, 3);
  assert.match(result.lines.join('\n'), /AGENT SYSTEMS/);
  assert.match(result.lines.join('\n'), /INFORMATION FREEDOM/);
  assert.match(result.lines.join('\n'), /CorvusAI/);
  assert.match(result.lines.join('\n'), /TSUNAMI AI/);
  assert.match(result.lines.join('\n'), /tsunami \/ protocol/);
  assert.match(result.lines.join('\n'), /SEGMENT/);
  assert.doesNotMatch(resolveCommand('ls agent').lines.join(' '), /SEGMENT/);
  assert.doesNotMatch(resolveCommand('ls protocol').lines.join(' '), /CorvusAI/);
});

test('distinguishes the desktop agent from the transport protocol', () => {
  assert.match(resolveCommand('cat tsunami-ai').lines.join(' '), /桌面 Coding Agent/);
  assert.match(resolveCommand('cat tsunami').lines.join(' '), /TLS 1\.3/);
});

test('opens a known repository and uses the local README when no repository URL was supplied', () => {
  assert.deepEqual(resolveCommand('open segment').action, {
    type: 'open',
    target: 'https://github.com/RavenholmAlpha/SEGMENT',
  });
  assert.deepEqual(resolveCommand('open wave').action, {
    type: 'open',
    target: './WAVE_README.md',
  });
});

test('navigates both chapters and inspects a project', () => {
  assert.deepEqual(resolveCommand('goto agent').action, { type: 'navigate', target: 'agent' });
  assert.deepEqual(resolveCommand('goto freedom').action, { type: 'navigate', target: 'protocol' });
  assert.deepEqual(resolveCommand('inspect wave').action, { type: 'inspect', target: 'wave' });
  assert.deepEqual(resolveCommand('replay').action, { type: 'replay' });
  assert.deepEqual(resolveCommand('clear').action, { type: 'clear' });
});

test('documents Vault integration and Smooth Context for both agents', () => {
  for (const id of ['corvusai', 'tsunami-ai']) {
    const text = resolveCommand(`cat ${id}`).lines.join(' ');
    assert.match(text, /Vault/);
    assert.match(text, /Smooth Context/);
  }
  const smooth = resolveCommand('smooth');
  assert.deepEqual(smooth.action, { type: 'navigate', target: 'smooth' });
  assert.match(smooth.lines.join(' '), /slide/);
  assert.match(smooth.lines.join(' '), /splice/);
  assert.deepEqual(resolveCommand('goto smooth').action, { type: 'navigate', target: 'smooth' });
});

test('reports unsupported commands without an action', () => {
  const result = resolveCommand('rm -rf /');
  assert.equal(result.action, undefined);
  assert.match(result.lines.join(' '), /Unknown command/);
});
