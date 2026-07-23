import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RandomGenPage from './RandomGen';
import { postGenerateRandomCase } from '../util/RandomGenApi';
import { RANDOM_GEN_HISTORY_KEY } from '../util/randomGenHistoryStorage';

jest.mock('../util/RandomGenApi', () => ({
  postGenerateRandomCase: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

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
