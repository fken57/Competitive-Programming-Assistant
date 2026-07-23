import React from 'react';
import { render, screen } from '@testing-library/react';
import { GraphVisualizer } from './GraphVisualizer';

jest.mock('d3', () => ({
  __esModule: true,
  select: jest.fn(() => ({
    selectAll: () => ({
      remove: jest.fn(),
    }),
  })),
}));

test('shows a summary instead of D3 for more than 100 vertices', () => {
  const graphData = {
    nodes: Array.from({ length: 101 }, (_, id) => ({ id, label: String(id + 1) })),
    edges: [{ source: 0, target: 1 }],
  };

  const { container } = render(
    <GraphVisualizer
      graphData={graphData}
      isDataLoaded={true}
      errorMessage=""
      graphType="undirected"
    />,
  );

  expect(screen.getByText('可視化を省略しました')).toBeInTheDocument();
  expect(screen.getByText(/頂点数: 101、辺数: 1/)).toBeInTheDocument();
  expect(container.querySelector('svg')).toHaveStyle({ opacity: '0' });
  expect(container.querySelectorAll('.graph-node')).toHaveLength(0);
});
