import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { StaticArrayAlgorithms } from './StaticArrayAlgorithms';

const mockPostArrayData = jest.fn();

jest.mock('../../../../hooks/Array/useArrayApi', () => ({
  useArrayApi: () => ({
    loading: false,
    error: null,
    data: {
      prefix_sum: [0, 3, 4],
      compressed_values: [1, 0],
      distinct_values: [1, 3],
      inversion_count: 1,
      mex: 0,
      runs: [{ value: 3, count: 1 }, { value: 1, count: 1 }],
      next_indices: [1, -1],
      next_values: [3, null],
      length: 2,
      left: 0,
      right_exclusive: 2,
      values: [3, 1],
    },
    postArrayData: mockPostArrayData,
  }),
}));

test('renders eight parameter-free static algorithm cards', () => {
  render(<StaticArrayAlgorithms values={[3, 1]} />);

  expect(screen.getAllByRole('button', { name: '実行' })).toHaveLength(8);
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getAllByText('累積和')).not.toHaveLength(0);
  expect(screen.getByText('座標圧縮')).toBeInTheDocument();
  expect(screen.getByText('最長distinct部分配列')).toBeInTheDocument();
});

test('passes the loaded array to a selected endpoint', () => {
  render(<StaticArrayAlgorithms values={[3, 1]} />);
  fireEvent.click(screen.getAllByRole('button', { name: '実行' })[0]);

  expect(mockPostArrayData).toHaveBeenCalledWith('/array/build_prefix_sum', [3, 1]);
});

test('formats sequence, nullable and interval results for display', () => {
  render(<StaticArrayAlgorithms values={[3, 1]} />);

  expect(screen.getByText('0 3 4')).toBeInTheDocument();
  expect(screen.getAllByText('2 -1')).not.toHaveLength(0);
  expect(screen.getAllByText('3 -')).toHaveLength(2);
  expect(screen.getByText('(3, 1) (1, 1)')).toBeInTheDocument();
  expect(screen.getByText('区間（1-based、両端を含む）')).toBeInTheDocument();
});
