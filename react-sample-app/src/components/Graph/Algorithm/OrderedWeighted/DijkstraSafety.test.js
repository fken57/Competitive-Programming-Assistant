import { fireEvent, render, screen } from '@testing-library/react';
import { Dijkstra } from './Dijkstra';

const mockPostGraphData = jest.fn();

jest.mock(
  'react-router-dom',
  () => ({ Navigate: () => null }),
  { virtual: true },
);

jest.mock('../../GraphVisualizer', () => ({
  GraphVisualizer: () => <div data-testid="graph-visualizer" />,
}));

jest.mock('../../../../hooks/Graph/useWeightedGraphApi', () => ({
  useWeightedGraphApi: () => ({
    postGraphData: mockPostGraphData,
    loading: false,
    error: null,
    data: null,
  }),
}));

test('Dijkstra does not send a graph containing a negative edge weight', () => {
  render(
    <Dijkstra
      graphType="undirected"
      adjacentList={[[{ to: 1, weight: -1 }], [{ to: 0, weight: -1 }]]}
    />,
  );

  fireEvent.click(screen.getByRole('button'));

  expect(mockPostGraphData).not.toHaveBeenCalled();
});
