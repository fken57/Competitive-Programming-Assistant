import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

test('switches between fixed-size pages and disables boundary buttons', () => {
  const onPageChange = jest.fn();
  render(
    <Pagination
      page={1}
      pageSize={10}
      total={21}
      onPageChange={onPageChange}
      label="履歴ページ"
    />,
  );

  expect(screen.getByRole('button', { name: '前のページ' })).toBeDisabled();
  expect(screen.getByText('1 / 3 ページ')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '次のページ' }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

test('does not render controls for a single page', () => {
  const { container } = render(
    <Pagination page={1} pageSize={10} total={10} onPageChange={jest.fn()} label="履歴ページ" />,
  );
  expect(container).toBeEmptyDOMElement();
});

test('disables page changes while an operation is in progress', () => {
  const onPageChange = jest.fn();
  render(
    <Pagination
      page={2}
      pageSize={10}
      total={30}
      onPageChange={onPageChange}
      label="履歴ページ"
      disabled
    />,
  );

  const previous = screen.getByRole('button', { name: '前のページ' });
  const next = screen.getByRole('button', { name: '次のページ' });
  expect(previous).toBeDisabled();
  expect(next).toBeDisabled();
  fireEvent.click(previous);
  fireEvent.click(next);
  expect(onPageChange).not.toHaveBeenCalled();
});
