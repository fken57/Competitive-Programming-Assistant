import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BFS } from './UnorderedUnweighted/BFS';
import { DFS } from './UnorderedUnweighted/DFS';
import { Dijkstra } from './OrderedWeighted/Dijkstra';

const mockPostUnweighted = jest.fn();
const mockPostWeighted = jest.fn();

jest.mock('../../../hooks/Graph/useUnweightedGraphApi', () => ({
  useUnweightedGraphApi: () => ({
    postGraphData: mockPostUnweighted,
    loading: false,
    error: null,
    data: null,
  }),
}));
jest.mock('../../../hooks/Graph/useWeightedGraphApi', () => ({
  useWeightedGraphApi: () => ({
    postGraphData: mockPostWeighted,
    loading: false,
    error: null,
    data: null,
  }),
}));
jest.mock('../GraphVisualizer', () => ({
  GraphVisualizer: () => null,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test.each([
  ['BFS', BFS, mockPostUnweighted],
  ['DFS', DFS, mockPostUnweighted],
])('%s sends the selected one-based vertex as zero-based', (name, Component, postGraph) => {
  render(<Component adjacentList={[[1], [0, 2], [1]]} />);
  fireEvent.change(screen.getByRole('spinbutton', { name: `${name}の開始頂点` }), {
    target: { value: '3' },
  });
  fireEvent.click(screen.getByRole('button'));

  expect(postGraph).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ start_vertex: 2 }),
  );
});

test('Dijkstra sends the selected start vertex', () => {
  const adjacentList = [
    [{ to: 1, weight: 2 }],
    [{ to: 0, weight: 2 }, { to: 2, weight: 3 }],
    [{ to: 1, weight: 3 }],
  ];
  render(<Dijkstra adjacentList={adjacentList} graphType="undirected" />);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Dijkstraの開始頂点' }), {
    target: { value: '2' },
  });
  fireEvent.click(screen.getByRole('button'));

  expect(mockPostWeighted).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ start_vertex: 1 }),
  );
});

test('an out-of-range start vertex is rejected before the API call', () => {
  render(<BFS adjacentList={[[1], [0]]} />);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'BFSの開始頂点' }), {
    target: { value: '3' },
  });
  fireEvent.click(screen.getByRole('button'));

  expect(mockPostUnweighted).not.toHaveBeenCalled();
  expect(screen.getByText(/1以上2以下/)).toBeInTheDocument();
});
