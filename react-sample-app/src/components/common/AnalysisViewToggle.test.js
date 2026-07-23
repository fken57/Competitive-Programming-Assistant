import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnalysisViewToggle } from './AnalysisViewToggle';

test('switches between container and list views', () => {
  const onChange = jest.fn();
  render(<AnalysisViewToggle mode="container" onChange={onChange} />);
  fireEvent.click(screen.getByRole('radio', { name: '一覧（自動実行）' }));
  expect(onChange).toHaveBeenCalledWith('list');
});

test('can disable list mode', () => {
  render(<AnalysisViewToggle mode="container" onChange={jest.fn()} listDisabled={true} />);
  expect(screen.getByRole('radio', { name: '一覧（自動実行）' })).toBeDisabled();
});
