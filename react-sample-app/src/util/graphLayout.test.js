import { applyStaticGraphLayout, resolveStaticGraphLinks } from './graphLayout';

test('linear layout follows orderIndex', () => {
  const nodes = [
    { id: 0, label: '1', attributes: { orderIndex: 2 } },
    { id: 1, label: '2', attributes: { orderIndex: 0 } },
    { id: 2, label: '3', attributes: { orderIndex: 1 } },
  ];

  applyStaticGraphLayout(nodes, 300, 200, 'linear');

  expect(nodes[1]).toMatchObject({ x: 60, y: 100, fx: 60, fy: 100 });
  expect(nodes[2]).toMatchObject({ x: 150, y: 100, fx: 150, fy: 100 });
  expect(nodes[0]).toMatchObject({ x: 240, y: 100, fx: 240, fy: 100 });
});

test('tree layout groups nodes by depth and preserves level order', () => {
  const nodes = [
    { id: 0, label: '1', attributes: { depth: 0 } },
    { id: 1, label: '2', attributes: { depth: 1, orderInLevel: 1 } },
    { id: 2, label: '3', attributes: { depth: 1, orderInLevel: 0 } },
  ];

  applyStaticGraphLayout(nodes, 300, 200, 'tree');

  expect(nodes[0]).toMatchObject({ x: 150, y: 50 });
  expect(nodes[2]).toMatchObject({ x: 60, y: 150 });
  expect(nodes[1]).toMatchObject({ x: 240, y: 150 });
});

test('static links resolve numeric endpoint ids to positioned nodes', () => {
  const nodes = [{ id: 0, label: '1' }, { id: 1, label: '2' }];
  const links = [{ source: 0, target: 1 }];
  applyStaticGraphLayout(nodes, 300, 200, 'linear');

  resolveStaticGraphLinks(nodes, links);

  expect(links[0].source).toBe(nodes[0]);
  expect(links[0].target).toBe(nodes[1]);
  expect(links[0].source.x).toBe(60);
});
