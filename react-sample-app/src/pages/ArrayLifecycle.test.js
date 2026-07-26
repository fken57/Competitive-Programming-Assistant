import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ArrayPage from './Array';

jest.mock('../components/Array/ArrayAlgorithmFormOutline', () => {
  const React = require('react');
  return {
    ArrayAlgorithmFormOutline: ({ category, values }) => {
      const [resultState, setResultState] = React.useState('clean');
      return (
        <div
          data-testid="array-algorithm-panel"
          data-category={category}
          data-values={JSON.stringify(values)}
          data-result-state={resultState}
        >
          <button onClick={() => setResultState('has-result')}>simulate array result</button>
        </div>
      );
    },
  };
});

function submitArray(input) {
  fireEvent.change(screen.getByRole('textbox', { name: '配列の標準入力' }), {
    target: { value: input },
  });
  fireEvent.click(screen.getByRole('button', { name: '配列を読み込む' }));
}

test('valid standard input opens the static and query algorithm categories', () => {
  render(<ArrayPage />);
  submitArray('4\n3 1 2 1');

  const panels = screen.getAllByTestId('array-algorithm-panel');
  expect(panels).toHaveLength(2);
  expect(panels[0]).toHaveAttribute('data-category', 'static');
  expect(panels[1]).toHaveAttribute('data-category', 'query');
  expect(panels[0]).toHaveAttribute('data-values', '[3,1,2,1]');
  expect(panels[1]).toHaveAttribute('data-values', '[3,1,2,1]');
});

test('invalid replacement input clears the previous array and results', () => {
  render(<ArrayPage />);
  submitArray('3\n1 2 3');
  submitArray('3\n1 2');

  expect(screen.queryByTestId('array-algorithm-panel')).not.toBeInTheDocument();
  expect(screen.getByText(/入力エラー/)).toBeInTheDocument();
});

test('submitting a new array resets prior algorithm result state', () => {
  render(<ArrayPage />);
  submitArray('3\n1 2 3');
  screen.getAllByRole('button', { name: 'simulate array result' }).forEach((button) => {
    fireEvent.click(button);
  });
  screen.getAllByTestId('array-algorithm-panel').forEach((panel) => {
    expect(panel).toHaveAttribute('data-result-state', 'has-result');
  });

  submitArray('2\n8 5');
  screen.getAllByTestId('array-algorithm-panel').forEach((panel) => {
    expect(panel).toHaveAttribute('data-result-state', 'clean');
  });
});

test('changing the input source clears the loaded array', () => {
  render(<ArrayPage />);
  submitArray('3\n1 2 3');

  fireEvent.click(screen.getByRole('radio', { name: '.txt入力' }));

  expect(screen.queryByTestId('array-algorithm-panel')).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: '配列の標準入力' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('.txtファイル')).toBeInTheDocument();
});
