import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ArrayQueryAlgorithms } from './ArrayQueryAlgorithms';
import { ARRAY_QUERY_ENDPOINTS, postArrayQuery } from '../../../../util/ArrayQueryApi';

jest.mock('../../../../util/ArrayQueryApi', () => {
  const actual = jest.requireActual('../../../../util/ArrayQueryApi');
  return { ...actual, postArrayQuery: jest.fn() };
});

describe('ArrayQueryAlgorithms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    postArrayQuery.mockResolvedValue({ count: 0 });
  });

  test('renders all seven query algorithms', () => {
    const { container } = render(<ArrayQueryAlgorithms values={[3, 1, 2]} />);
    expect(container.querySelectorAll('.array-query-card')).toHaveLength(7);
    expect(screen.getByRole('heading', { name: '静的区間和' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '部分配列和 = K の個数' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '部分配列和 mod M = R の個数' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '固定長窓の最小値' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '固定長窓の最大値' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '和がK以下のペア数' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '差の絶対値がK以下のペア数' })).toBeInTheDocument();
  });

  test('converts a 1-based inclusive range to a 0-based half-open payload', async () => {
    postArrayQuery.mockResolvedValue({ sum: 5 });
    render(<ArrayQueryAlgorithms values={[5, -2, 7, 4]} />);
    const card = screen.getByRole('heading', { name: '静的区間和' }).closest('section');

    fireEvent.change(within(card).getByLabelText('左端（1-based）'), { target: { value: '2' } });
    fireEvent.change(within(card).getByLabelText('右端（1-based、両端を含む）'), { target: { value: '3' } });
    fireEvent.click(within(card).getByRole('button', { name: '実行' }));

    await waitFor(() => expect(postArrayQuery).toHaveBeenCalledWith(
      ARRAY_QUERY_ENDPOINTS.STATIC_RANGE_SUM_QUERY,
      { values: [5, -2, 7, 4], left: 1, right_exclusive: 3 },
    ));
    expect(await within(card).findByText('5')).toBeInTheDocument();
  });

  test('validates the canonical remainder before sending', () => {
    render(<ArrayQueryAlgorithms values={[-1, 2]} />);
    const card = screen.getByRole('heading', { name: '部分配列和 mod M = R の個数' }).closest('section');

    fireEvent.change(within(card).getByLabelText('法 M'), { target: { value: '3' } });
    fireEvent.change(within(card).getByLabelText('余り R'), { target: { value: '3' } });
    fireEvent.click(within(card).getByRole('button', { name: '実行' }));

    expect(within(card).getByText(/余りRは0以上M未満/)).toBeInTheDocument();
    expect(postArrayQuery).not.toHaveBeenCalled();
  });

  test('sends a validated window size', async () => {
    postArrayQuery.mockResolvedValue({ minimums: [1, 1] });
    render(<ArrayQueryAlgorithms values={[3, 1, 2]} />);
    const card = screen.getByRole('heading', { name: '固定長窓の最小値' }).closest('section');

    fireEvent.change(within(card).getByLabelText('窓幅 W'), { target: { value: '2' } });
    fireEvent.click(within(card).getByRole('button', { name: '実行' }));

    await waitFor(() => expect(postArrayQuery).toHaveBeenCalledWith(
      ARRAY_QUERY_ENDPOINTS.FIXED_WINDOW_MINIMUM,
      { values: [3, 1, 2], window_size: 2 },
    ));
    expect(await within(card).findByText('1 1')).toBeInTheDocument();
  });

  test('clears a displayed result when its parameter changes', async () => {
    postArrayQuery.mockResolvedValue({ count: 3 });
    render(<ArrayQueryAlgorithms values={[1, -1, 1]} />);
    const card = screen.getByRole('heading', { name: '部分配列和 = K の個数' }).closest('section');

    fireEvent.change(within(card).getByLabelText('目標値 K'), { target: { value: '1' } });
    fireEvent.click(within(card).getByRole('button', { name: '実行' }));
    expect(await within(card).findByText('3')).toBeInTheDocument();

    fireEvent.change(within(card).getByLabelText('目標値 K'), { target: { value: '2' } });
    expect(within(card).queryByText('3')).not.toBeInTheDocument();
    expect(within(card).getByText('パラメーターを入力して実行してください。')).toBeInTheDocument();
  });
});
