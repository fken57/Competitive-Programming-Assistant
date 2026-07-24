import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  GenerationResult,
  getOutputDisplayDecision,
} from './GenerationResult';

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

test.each([
  ['a line wider than the layout limit', `2\n${'1'.repeat(121)}\n`],
  ['too many lines', `${Array.from({ length: 51 }, () => '1').join('\n')}\n`],
  ['more than four KiB', `${Array.from({ length: 50 }, () => '1'.repeat(100)).join('\n')}\n`],
])('offers download only for %s', (_label, inputText) => {
  const largeResult = { ...result, inputText };

  render(
    <GenerationResult
      result={largeResult}
      loading={false}
      authenticated={false}
      onRegenerate={jest.fn()}
      onSaveRecipe={jest.fn()}
      onMarkKilled={jest.fn()}
      onSavePreset={jest.fn()}
    />,
  );

  expect(screen.getByText('出力が大きいため、画面表示を省略しました。')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download .txt' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
  expect(document.querySelector('.random-gen-output')).not.toBeInTheDocument();
});

test('keeps compact output inline at the configured limits', () => {
  const inputText = `${Array.from({ length: 50 }, () => '1'.repeat(80)).join('\n')}\n`;
  expect(getOutputDisplayDecision(inputText)).toMatchObject({
    inline: true,
    lines: 50,
    maxLineLength: 80,
  });
});
