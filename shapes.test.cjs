const test = require('node:test');
const assert = require('node:assert/strict');

const shapes = require('./tui/shapes.js');

function render(shape, t) {
  const W = 62, H = 34;
  const buf = { W, H, asp: .6, depth: new Float32Array(W * H), cells: new Uint8Array(W * H) };
  shape.render(t, buf);
  return buf;
}

test('registers the five hero shapes', () => {
  assert.deepEqual(shapes.list.map((s) => s.id), ['spirograph', 'aizawa', 'kleinian', 'seifert', 'donut']);
});

for (const shape of shapes.list) {
  test(`${shape.id} fills a visible share of the grid with valid levels`, () => {
    for (const t of [0, 3.7, 41.2]) {
      const { cells, depth } = render(shape, t);
      const filled = cells.filter((c) => c > 0).length;
      assert.ok(filled > cells.length * .04, `${shape.id} @${t}: only ${filled} cells`);
      assert.ok(filled < cells.length * .9, `${shape.id} @${t}: grid is flooded`);
      assert.ok(cells.every((c) => c <= 12));
      assert.ok(depth.every((d) => Number.isFinite(d)));
    }
  });
}

test('pick never repeats the previous shape', () => {
  for (const prev of shapes.list.map((s) => s.id)) {
    for (let i = 0; i < 20; i++) assert.notEqual(shapes.pick(prev, () => i / 20), prev);
  }
  assert.equal(shapes.get('nope').id, 'donut');
});
