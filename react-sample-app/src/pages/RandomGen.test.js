import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RandomGenPage from './RandomGen';
import {
  deleteServerHistory,
  listGeneratorPresets,
  listKilledCases,
  listServerHistory,
  postGenerateRandomCase,
} from '../util/RandomGenApi';
import { RANDOM_GEN_HISTORY_KEY } from '../util/randomGenHistoryStorage';

let mockAuthUser = null;

jest.mock('../util/RandomGenApi', () => ({
  deleteKilledCase: jest.fn(),
  deleteServerHistory: jest.fn(),
  postGenerateRandomCase: jest.fn(),
  listGeneratorPresets: jest.fn(),
  listKilledCases: jest.fn(),
  listServerHistory: jest.fn(),
  saveGeneratorPreset: jest.fn(),
  saveKilledCase: jest.fn(),
  saveServerHistory: jest.fn(),
}));
jest.mock('../hooks/Auth/useAuth', () => ({
  useAuth: () => ({ user: mockAuthUser, loading: false }),
}));

beforeEach(() => {
  mockAuthUser = null;
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => jest.restoreAllMocks());

test('generates a case and stores only its recipe in guest history', async () => {
  const generated = {
    recipe: {
      generatorVersion: '0.1.0',
      rngAlgorithm: 'splitmix64-v1',
      seed: '123456789',
      structureType: 'array',
      caseType: 'uniform',
      params: { N: 10, minValue: 0, maxValue: 100 },
      outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
    },
    inputText: '10\n1 2 3 4 5 6 7 8 9 10\n',
  };
  postGenerateRandomCase.mockResolvedValue(generated);
  render(<RandomGenPage />);

  fireEvent.click(screen.getByRole('button', { name: '入力を生成' }));

  expect(await screen.findByText('生成結果')).toBeInTheDocument();
  await waitFor(() => expect(postGenerateRandomCase).toHaveBeenCalledTimes(1));
  const stored = JSON.parse(localStorage.getItem(RANDOM_GEN_HISTORY_KEY));
  expect(stored[0].recipe).toEqual(generated.recipe);
  expect(stored[0]).not.toHaveProperty('inputText');
});

test('paginates guest history by ten and returns after deleting the last item on page two', async () => {
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  const items = Array.from({ length: 11 }, (_, index) => ({
    id: `history-${index}`,
    createdAt: new Date(Date.now() - index * 1_000).toISOString(),
    expiresAt,
    killedFlag: false,
    recipe: {
      generatorVersion: '0.1.0',
      rngAlgorithm: 'splitmix64-v1',
      seed: String(index),
      structureType: 'array',
      caseType: 'uniform',
      params: { N: 1, minValue: 0, maxValue: 0 },
      outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
    },
  }));
  localStorage.setItem(RANDOM_GEN_HISTORY_KEY, JSON.stringify(items));
  jest.spyOn(window, 'confirm').mockReturnValue(true);

  render(<RandomGenPage />);
  fireEvent.click(await screen.findByRole('button', { name: '次のページ' }));
  expect(await screen.findByText('seed: 10')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '削除' }));

  await waitFor(() => expect(screen.getByText('seed: 0')).toBeInTheDocument());
  expect(screen.queryByText('1 / 2 ページ')).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(RANDOM_GEN_HISTORY_KEY))).toHaveLength(10);
});

test('returns to the previous server page after deleting its last history item', async () => {
  mockAuthUser = { id: 'user-1' };
  const makeHistory = (index) => ({
    id: `server-history-${index}`,
    createdAt: '2026-07-27T00:00:00.000Z',
    expiresAt: '2026-07-28T00:00:00.000Z',
    killedFlag: false,
    recipe: {
      generatorVersion: '0.1.0',
      rngAlgorithm: 'splitmix64-v1',
      seed: String(index),
      structureType: 'array',
      caseType: 'uniform',
      params: { N: 1, minValue: 0, maxValue: 0 },
      outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
    },
  });
  const firstPage = Array.from({ length: 10 }, (_, index) => makeHistory(index));
  listServerHistory
    .mockResolvedValueOnce({
      history: firstPage,
      pagination: { page: 1, pageSize: 10, total: 11 },
    })
    .mockResolvedValueOnce({
      history: [makeHistory(10)],
      pagination: { page: 2, pageSize: 10, total: 11 },
    })
    .mockResolvedValueOnce({
      history: firstPage,
      pagination: { page: 1, pageSize: 10, total: 10 },
    });
  listKilledCases.mockResolvedValue({
    killedCases: [],
    pagination: { page: 1, pageSize: 10, total: 0 },
  });
  listGeneratorPresets.mockResolvedValue([]);
  deleteServerHistory.mockResolvedValue(undefined);
  jest.spyOn(window, 'confirm').mockReturnValue(true);

  render(<RandomGenPage />);
  fireEvent.click(await screen.findByRole('button', { name: '次のページ' }));
  expect(await screen.findByText('seed: 10')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '削除' }));

  await waitFor(() => expect(deleteServerHistory).toHaveBeenCalledWith('server-history-10'));
  await waitFor(() => expect(listServerHistory).toHaveBeenLastCalledWith(1));
  expect(await screen.findByText('seed: 0')).toBeInTheDocument();
});

test('ignores saved data that resolves after the authenticated user changes', async () => {
  let resolveOldHistory;
  let resolveOldKilledCases;
  let resolveOldPresets;
  mockAuthUser = { id: 'user-a' };
  listServerHistory
    .mockImplementationOnce(() => new Promise((resolve) => { resolveOldHistory = resolve; }))
    .mockResolvedValueOnce({
      history: [{
        id: 'history-b',
        createdAt: '2026-07-27T00:00:00.000Z',
        expiresAt: '2026-07-28T00:00:00.000Z',
        killedFlag: false,
        recipe: { structureType: 'array', caseType: 'uniform', seed: 'user-b' },
      }],
      pagination: { page: 1, pageSize: 10, total: 1 },
    });
  listKilledCases
    .mockImplementationOnce(() => new Promise((resolve) => { resolveOldKilledCases = resolve; }))
    .mockResolvedValueOnce({
      killedCases: [],
      pagination: { page: 1, pageSize: 10, total: 0 },
    });
  listGeneratorPresets
    .mockImplementationOnce(() => new Promise((resolve) => { resolveOldPresets = resolve; }))
    .mockResolvedValueOnce([]);

  const { rerender } = render(<RandomGenPage />);
  mockAuthUser = { id: 'user-b' };
  rerender(<RandomGenPage />);
  expect(await screen.findByText('seed: user-b')).toBeInTheDocument();

  await act(async () => {
    resolveOldHistory({
      history: [{
        id: 'history-a',
        createdAt: '2026-07-27T00:00:00.000Z',
        expiresAt: '2026-07-28T00:00:00.000Z',
        killedFlag: false,
        recipe: { structureType: 'array', caseType: 'uniform', seed: 'user-a' },
      }],
      pagination: { page: 1, pageSize: 10, total: 1 },
    });
    resolveOldKilledCases({
      killedCases: [],
      pagination: { page: 1, pageSize: 10, total: 0 },
    });
    resolveOldPresets([]);
    await Promise.resolve();
  });

  expect(screen.getByText('seed: user-b')).toBeInTheDocument();
  expect(screen.queryByText('seed: user-a')).not.toBeInTheDocument();
});

test('does not refresh the next user with a deletion started by the previous user', async () => {
  let resolveDelete;
  mockAuthUser = { id: 'user-a' };
  const historyItem = (userID) => ({
    id: `history-${userID}`,
    createdAt: '2026-07-27T00:00:00.000Z',
    expiresAt: '2026-07-28T00:00:00.000Z',
    killedFlag: false,
    recipe: { structureType: 'array', caseType: 'uniform', seed: userID },
  });
  listServerHistory
    .mockResolvedValueOnce({
      history: [historyItem('user-a')],
      pagination: { page: 1, pageSize: 10, total: 1 },
    })
    .mockResolvedValueOnce({
      history: [historyItem('user-b')],
      pagination: { page: 1, pageSize: 10, total: 1 },
    });
  listKilledCases.mockResolvedValue({
    killedCases: [],
    pagination: { page: 1, pageSize: 10, total: 0 },
  });
  listGeneratorPresets.mockResolvedValue([]);
  deleteServerHistory.mockImplementation(() => new Promise((resolve) => { resolveDelete = resolve; }));
  jest.spyOn(window, 'confirm').mockReturnValue(true);

  const { rerender } = render(<RandomGenPage />);
  expect(await screen.findByText('seed: user-a')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '削除' }));
  await waitFor(() => expect(deleteServerHistory).toHaveBeenCalledWith('history-user-a'));

  mockAuthUser = { id: 'user-b' };
  rerender(<RandomGenPage />);
  expect(await screen.findByText('seed: user-b')).toBeInTheDocument();

  await act(async () => {
    resolveDelete();
    await Promise.resolve();
  });

  expect(listServerHistory).toHaveBeenCalledTimes(2);
  expect(screen.getByText('seed: user-b')).toBeInTheDocument();
});

test('locks killed-case filtering and paging until the requested tag is applied', async () => {
  let resolveFilteredCases;
  mockAuthUser = { id: 'user-1' };
  listServerHistory.mockResolvedValue({
    history: [],
    pagination: { page: 1, pageSize: 10, total: 0 },
  });
  listKilledCases
    .mockResolvedValueOnce({
      killedCases: [],
      pagination: { page: 1, pageSize: 10, total: 20 },
    })
    .mockImplementationOnce(() => new Promise((resolve) => { resolveFilteredCases = resolve; }));
  listGeneratorPresets.mockResolvedValue([]);

  render(<RandomGenPage />);
  const tagInput = await screen.findByLabelText('タグ検索（完全一致）');
  await waitFor(() => expect(screen.getByRole('button', { name: '次のページ' })).toBeEnabled());
  fireEvent.change(tagInput, { target: { value: 'boundary' } });
  fireEvent.click(screen.getByRole('button', { name: '検索' }));

  expect(tagInput).toBeDisabled();
  expect(screen.getByRole('button', { name: '検索' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '次のページ' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '次のページ' }));
  expect(listKilledCases).toHaveBeenCalledTimes(2);
  expect(listKilledCases).toHaveBeenLastCalledWith(1, 'boundary');

  await act(async () => {
    resolveFilteredCases({
      killedCases: [],
      pagination: { page: 1, pageSize: 10, total: 20 },
    });
  });

  await waitFor(() => expect(tagInput).toBeEnabled());
  expect(tagInput).toHaveValue('boundary');
});
