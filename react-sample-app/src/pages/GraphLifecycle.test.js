import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import GraphPage from './Graph';

jest.mock(
  'react-router-dom',
  () => ({ useNavigate: () => jest.fn() }),
  { virtual: true },
);

jest.mock('../components/Graph/GraphVisualizer', () => ({
  GraphVisualizer: ({ isDataLoaded, graphType }) => (
    <div data-testid="graph-visualizer" data-loaded={String(isDataLoaded)} data-graph-type={graphType} />
  ),
}));

jest.mock('../components/Graph/AlgorithmFormOutLine', () => {
  const React = require('react');
  return {
    AlgorithmFormOutline: ({ hasWeights, graphType, adjacentList }) => {
      const [resultState, setResultState] = React.useState('clean');
      return (
        <div data-testid="algorithm-panel" data-result-state={resultState} data-has-weights={String(hasWeights)} data-graph-type={graphType} data-adjacency={JSON.stringify(adjacentList)}>
          <button onClick={() => setResultState('has-result')}>simulate algorithm result</button>
        </div>
      );
    },
  };
});

function renderGraphPage() { render(<GraphPage />); }
function submitGraph(input) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: input } });
  fireEvent.click(screen.getAllByRole('button')[0]);
}

test('changing the weight mode invalidates the previously parsed graph', () => {
  renderGraphPage();
  submitGraph('3 2\n1 2\n2 3');
  fireEvent.click(screen.getByRole('radio', { name: '重み付き' }));
  expect(screen.queryByTestId('algorithm-panel')).not.toBeInTheDocument();
  expect(screen.getByTestId('graph-visualizer')).toHaveAttribute('data-loaded', 'false');
});

test('changing the direction mode invalidates the previously parsed graph', () => {
  renderGraphPage();
  submitGraph('3 2\n1 2\n2 3');
  fireEvent.click(screen.getByRole('radio', { name: '有向' }));
  expect(screen.queryByTestId('algorithm-panel')).not.toBeInTheDocument();
  expect(screen.getByTestId('graph-visualizer')).toHaveAttribute('data-loaded', 'false');
});

test('submitting a new graph resets prior algorithm result state', () => {
  renderGraphPage();
  submitGraph('3 2\n1 2\n2 3');
  fireEvent.click(screen.getByRole('button', { name: 'simulate algorithm result' }));
  expect(screen.getByTestId('algorithm-panel')).toHaveAttribute('data-result-state', 'has-result');
  submitGraph('4 1\n1 4');
  expect(screen.getByTestId('algorithm-panel')).toHaveAttribute('data-result-state', 'clean');
});
