import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompactAnalysisList } from './CompactAnalysisList';

test('renders human-readable fields instead of raw JSON', () => {
  const formatter = jest.fn((_id, _data, previewLimit) => [{
    label: '累積和',
    value: previewLimit === undefined ? '0, 1, 3' : '0, 1, 3',
  }]);

  render(
    <CompactAnalysisList
      results={[{
        id: 'build_prefix_sum',
        status: 'success',
        data: { prefix_sum: [0, 1, 3] },
      }]}
      titles={{ build_prefix_sum: '累積和' }}
      loading={false}
      error={null}
      formatResult={formatter}
    />,
  );

  expect(screen.getByText('完了')).toBeInTheDocument();
  expect(screen.getAllByText('0, 1, 3')).toHaveLength(2);
  expect(screen.queryByText('{"prefix_sum":[0,1,3]}')).not.toBeInTheDocument();
  expect(formatter).toHaveBeenCalledWith(
    'build_prefix_sum',
    { prefix_sum: [0, 1, 3] },
    20,
  );
  expect(formatter).toHaveBeenCalledWith(
    'build_prefix_sum',
    { prefix_sum: [0, 1, 3] },
  );
});

test('renders a localized skipped state without formatting data', () => {
  const formatter = jest.fn();

  render(
    <CompactAnalysisList
      results={[{
        id: 'tree_distance',
        status: 'skipped',
        reason: 'graph is not a tree',
      }]}
      titles={{ tree_distance: '木の直径' }}
      loading={false}
      error={null}
      formatResult={formatter}
    />,
  );

  expect(screen.getByText('省略')).toBeInTheDocument();
  expect(screen.getByText('入力グラフが木ではないため実行できません')).toBeInTheDocument();
  expect(formatter).not.toHaveBeenCalled();
});
