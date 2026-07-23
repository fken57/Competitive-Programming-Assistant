import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { StaticArrayAnalysisList } from './Array/Algorithm/Static/StaticArrayAnalysisList';
import { GraphStaticAnalysisList } from './Graph/Algorithm/Static/GraphStaticAnalysisList';
import { postArrayStaticAnalysis } from '../util/ArraySendApis';
import { postGraphStaticAnalysis } from '../util/GraphStaticAnalysisApi';

jest.mock('../util/ArraySendApis', () => ({
  postArrayStaticAnalysis: jest.fn(),
}));
jest.mock('../util/GraphStaticAnalysisApi', () => ({
  postGraphStaticAnalysis: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('array list automatically requests all static analyses', async () => {
  postArrayStaticAnalysis.mockResolvedValue({
    results: [{
      id: 'build_prefix_sum',
      status: 'success',
      data: { prefix_sum: [0, 1, 3] },
    }],
  });
  render(<StaticArrayAnalysisList values={[0, 1, 3]} />);

  await waitFor(() => expect(postArrayStaticAnalysis).toHaveBeenCalledWith([0, 1, 3]));
  expect(await screen.findAllByText('0, 1, 3')).toHaveLength(2);
  expect(screen.queryByText('{"prefix_sum":[0,1,3]}')).not.toBeInTheDocument();
});

test('graph list automatically requests the selected graph mode', async () => {
  postGraphStaticAnalysis.mockResolvedValue({
    results: [{
      id: 'union_find',
      status: 'success',
      data: { parents: [0, 0], components: [[0, 1]] },
    }],
  });
  const adjacentList = [[1], [0]];
  render(
    <GraphStaticAnalysisList
      graphType="undirected"
      hasWeights={false}
      adjacentList={adjacentList}
    />,
  );

  await waitFor(() => expect(postGraphStaticAnalysis).toHaveBeenCalledWith(
    'undirected',
    false,
    adjacentList,
  ));
  expect(await screen.findAllByText('1, 1')).toHaveLength(2);
  expect(screen.getAllByText('1, 2')).toHaveLength(2);
  expect(screen.queryByText('{"parents":[0,0],"components":[[0,1]]}'))
    .not.toBeInTheDocument();
});
