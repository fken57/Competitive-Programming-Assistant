import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SavedCaseLibrary } from './SavedCaseLibrary';

const killedCase = {
  id: 'killed-1',
  title: '境界値',
  failureType: 'WA',
  reasonTags: ['boundary'],
  notes: '',
  recipe: { structureType: 'array', caseType: 'uniform' },
};

afterEach(() => jest.restoreAllMocks());

test('submits an exact tag filter and confirms killed-case deletion', () => {
  const onKilledTagChange = jest.fn();
  const onDeleteKilled = jest.fn();
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  render(
    <SavedCaseLibrary
      killedCases={[killedCase]}
      presets={[]}
      killedPagination={{ page: 1, pageSize: 10, total: 1 }}
      killedTag=""
      onKilledPageChange={jest.fn()}
      onKilledTagChange={onKilledTagChange}
      onDeleteKilled={onDeleteKilled}
      onRegenerateKilled={jest.fn()}
      onRegeneratePreset={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('タグ検索（完全一致）'), {
    target: { value: ' boundary ' },
  });
  fireEvent.click(screen.getByRole('button', { name: '検索' }));
  expect(onKilledTagChange).toHaveBeenCalledWith('boundary');

  fireEvent.click(screen.getByRole('button', { name: '削除' }));
  expect(onDeleteKilled).toHaveBeenCalledWith(killedCase);
});

test('locks filtering and paging while a killed case is being deleted', () => {
  render(
    <SavedCaseLibrary
      killedCases={[killedCase]}
      presets={[]}
      killedPagination={{ page: 2, pageSize: 10, total: 30 }}
      killedTag="boundary"
      onKilledPageChange={jest.fn()}
      onKilledTagChange={jest.fn()}
      onDeleteKilled={jest.fn()}
      onRegenerateKilled={jest.fn()}
      onRegeneratePreset={jest.fn()}
      deletingKilledId="killed-1"
    />,
  );

  expect(screen.getByLabelText('タグ検索（完全一致）')).toBeDisabled();
  expect(screen.getByRole('button', { name: '検索' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '解除' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '前のページ' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '次のページ' })).toBeDisabled();
});

test('locks filtering and paging while a filtered page is loading', () => {
  render(
    <SavedCaseLibrary
      killedCases={[killedCase]}
      presets={[]}
      killedPagination={{ page: 2, pageSize: 10, total: 30 }}
      killedTag="boundary"
      onKilledPageChange={jest.fn()}
      onKilledTagChange={jest.fn()}
      onDeleteKilled={jest.fn()}
      onRegenerateKilled={jest.fn()}
      onRegeneratePreset={jest.fn()}
      loadingKilledCases
    />,
  );

  expect(screen.getByLabelText('タグ検索（完全一致）')).toBeDisabled();
  expect(screen.getByRole('button', { name: '検索' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '前のページ' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '次のページ' })).toBeDisabled();
});
