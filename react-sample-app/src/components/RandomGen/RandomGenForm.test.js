import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RandomGenForm } from './RandomGenForm';

test('uses one segmented structure choice and accessible boolean switches', () => {
  render(<RandomGenForm loading={false} onGenerate={jest.fn()} />);

  expect(screen.getByLabelText('配列')).toBeChecked();
  fireEvent.click(screen.getByLabelText('グラフ'));
  expect(screen.getByLabelText('グラフ')).toBeChecked();
  expect(screen.getByRole('switch', { name: '有向' })).toBeInTheDocument();
  expect(screen.getByRole('switch', { name: '連結' })).toBeChecked();
});

test('includes test count only when hasT is enabled', () => {
  const onGenerate = jest.fn();
  render(<RandomGenForm loading={false} onGenerate={onGenerate} />);

  expect(screen.queryByLabelText('T')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('switch', { name: 'Tを付ける' }));
  expect(screen.getByLabelText('T')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '入力を生成' }));

  expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({
    params: expect.objectContaining({ testCount: 3 }),
    outputFormat: expect.objectContaining({ hasT: true }),
  }));
});
