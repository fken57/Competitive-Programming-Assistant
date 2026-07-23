import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnweightedUnorderedAlgorithm } from './UnorderedUnweighted/UnweightedUnordered';
import { OrderedWeightedAlgorithm } from './OrderedWeighted/OrderedWeighted';

jest.mock('./UnorderedUnweighted/BFS', () => ({ BFS: () => <div>BFS</div> }));
jest.mock('./UnorderedUnweighted/DFS', () => ({ DFS: () => <div>DFS</div> }));
jest.mock('./UnorderedUnweighted/ConnectedComponents', () => ({ ConnectedComponents: () => <div>Connected components</div> }));
jest.mock('./UnorderedUnweighted/UnionFind', () => ({ UnionFind: () => <div>Union-Find</div> }));
jest.mock('./UnorderedUnweighted/LowLink', () => ({ LowLink: () => <div>Low-Link</div> }));
jest.mock('./UnorderedUnweighted/IsBinaryTree', () => ({ IsBinaryTree: () => <div>Binary tree</div> }));
jest.mock('./UnorderedUnweighted/IsTree', () => ({ IsTree: () => <div>Is tree</div> }));
jest.mock('./UnorderedUnweighted/UnweightedTreeDistance', () => ({ UnweightedTreeDistance: () => <div>Unweighted diameter</div> }));
jest.mock('./UnorderedUnweighted/LCA', () => ({ LCA: () => <div>LCA</div> }));
jest.mock('./OrderedWeighted/Dijkstra', () => ({ Dijkstra: () => <div>Dijkstra</div> }));
jest.mock('./OrderedWeighted/Prim', () => ({ Prim: () => <div>Prim</div> }));
jest.mock('./OrderedWeighted/WeightedTreeDiameter', () => ({ WeightedTreeDiameter: () => <div>Weighted diameter</div> }));

describe('tree-only algorithm eligibility', () => {
  test('a non-tree keeps general checks but hides unweighted tree algorithms', () => {
    render(<UnweightedUnorderedAlgorithm adjacentList={[[1], [0], []]} />);

    expect(screen.getByText('Is tree')).toBeInTheDocument();
    expect(screen.queryByText('Unweighted diameter')).not.toBeInTheDocument();
    expect(screen.queryByText('LCA')).not.toBeInTheDocument();
  });

  test('an unweighted tree shows its tree-only algorithms', () => {
    render(<UnweightedUnorderedAlgorithm adjacentList={[[1], [0, 2], [1]]} />);

    expect(screen.getByText('Unweighted diameter')).toBeInTheDocument();
    expect(screen.getByText('LCA')).toBeInTheDocument();
  });

  test('a non-tree keeps Prim but hides weighted tree diameter', () => {
    const adjacencyList = [
      [{ to: 1, weight: 1 }],
      [{ to: 0, weight: 1 }],
      [],
    ];
    render(<OrderedWeightedAlgorithm adjacentList={adjacencyList} graphType="undirected" />);

    expect(screen.getByText('Prim')).toBeInTheDocument();
    expect(screen.queryByText('Weighted diameter')).not.toBeInTheDocument();
  });

  test('a weighted tree shows weighted tree diameter', () => {
    const adjacencyList = [
      [{ to: 1, weight: 1 }],
      [{ to: 0, weight: 1 }, { to: 2, weight: 2 }],
      [{ to: 1, weight: 2 }],
    ];
    render(<OrderedWeightedAlgorithm adjacentList={adjacencyList} graphType="undirected" />);

    expect(screen.getByText('Weighted diameter')).toBeInTheDocument();
  });
});
