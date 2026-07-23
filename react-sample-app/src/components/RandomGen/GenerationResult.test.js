import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GenerationResult } from './GenerationResult';

const result = {
  recipe: {
    generatorVersion: '0.1.0',
    rngAlgorithm: 'splitmix64-v1',
    seed: '123',
    structureType: 'array',
    caseType: 'uniform',
    params: { N: 2, minValue: 0, maxValue: 1 },
    outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
  },
  inputText: '2\n0 1\n',
};

test('copies input and regenerates from the displayed recipe', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  const regenerate = jest.fn();

  render(
    <GenerationResult
      result={result}
      loading={false}
      authenticated={false}
      onRegenerate={regenerate}
      onSaveRecipe={jest.fn()}
      onMarkKilled={jest.fn()}
      onSavePreset={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(result.inputText));
  fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));
  expect(regenerate).toHaveBeenCalledTimes(1);
  expect(screen.getByText('splitmix64-v1')).toBeInTheDocument();
});

test('offers authentication-only actions as disabled before auth exists', () => {
  render(
    <GenerationResult
      result={result}
      loading={false}
      authenticated={false}
      onRegenerate={jest.fn()}
      onSaveRecipe={jest.fn()}
      onMarkKilled={jest.fn()}
      onSavePreset={jest.fn()}
    />,
  );

  expect(screen.getByRole('button', { name: 'Mark as killed' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save as preset' })).toBeDisabled();
});
