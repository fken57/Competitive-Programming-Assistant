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
    results: [{ id: 'static_mex', status: 'success', data: { mex: 2 } }],
  });
  render(<StaticArrayAnalysisList values={[0, 1, 3]} />);

  await waitFor(() => expect(postArrayStaticAnalysis).toHaveBeenCalledWith([0, 1, 3]));
  expect(await screen.findByText('静的MEX')).toBeInTheDocument();
});

test('graph list automatically requests the selected graph mode', async () => {
  postGraphStaticAnalysis.mockResolvedValue({
    results: [{ id: 'scc', status: 'success', data: { sccs: [[0], [1]] } }],
  });
  const adjacentList = [[1], []];
  render(
    <GraphStaticAnalysisList
      graphType="directed"
      hasWeights={false}
      adjacentList={adjacentList}
    />,
  );

  await waitFor(() => expect(postGraphStaticAnalysis).toHaveBeenCalledWith(
    'directed',
    false,
    adjacentList,
  ));
  expect(await screen.findByText('SCC')).toBeInTheDocument();
});
