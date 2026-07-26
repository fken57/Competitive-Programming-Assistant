import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GenerationHistory } from './GenerationHistory';

const item = {
  id: 'history-1',
  createdAt: '2026-07-27T00:00:00.000Z',
  expiresAt: '2026-07-28T00:00:00.000Z',
  killedFlag: false,
  recipe: { structureType: 'array', caseType: 'uniform', seed: '1' },
};

afterEach(() => jest.restoreAllMocks());

test('asks for confirmation before deleting history', () => {
  const onDelete = jest.fn();
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  render(
    <GenerationHistory
      history={[item]}
      pagination={{ page: 1, pageSize: 10, total: 1 }}
      onRegenerate={jest.fn()}
      onDelete={onDelete}
      onPageChange={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: '削除' }));
  expect(confirm).toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();

  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: '削除' }));
  expect(onDelete).toHaveBeenCalledWith(item);
});
