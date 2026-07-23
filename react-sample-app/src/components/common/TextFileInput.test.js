import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MAX_TEXT_FILE_BYTES, TextFileInput } from './TextFileInput';

const makeFile = ({ name = 'input.txt', size = 10, text = '3\n1 2 3' } = {}) => ({
  name,
  size,
  text: jest.fn().mockResolvedValue(text),
});

test('loads UTF-8 text and removes a BOM', async () => {
  const onTextLoaded = jest.fn();
  render(<TextFileInput onTextLoaded={onTextLoaded} onError={jest.fn()} />);

  fireEvent.change(screen.getByLabelText('.txtファイル'), {
    target: { files: [makeFile({ text: '\uFEFF3\n1 2 3' })] },
  });

  await waitFor(() => expect(onTextLoaded).toHaveBeenLastCalledWith('3\n1 2 3'));
  expect(screen.getByText('input.txt')).toBeInTheDocument();
});

test.each([
  [makeFile({ name: 'input.csv' }), '.txtファイル'],
  [makeFile({ size: MAX_TEXT_FILE_BYTES + 1 }), '10 MiB以下'],
])('rejects an invalid file', async (file, message) => {
  const onError = jest.fn();
  render(<TextFileInput onTextLoaded={jest.fn()} onError={onError} />);

  fireEvent.change(screen.getByLabelText('.txtファイル'), {
    target: { files: [file] },
  });

  await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.stringContaining(message)));
  expect(file.text).not.toHaveBeenCalled();
});

test('accepts a file exactly at the size limit', async () => {
  const file = makeFile({ size: MAX_TEXT_FILE_BYTES });
  const onTextLoaded = jest.fn();
  render(<TextFileInput onTextLoaded={onTextLoaded} onError={jest.fn()} />);

  fireEvent.change(screen.getByLabelText('.txtファイル'), {
    target: { files: [file] },
  });

  await waitFor(() => expect(onTextLoaded).toHaveBeenLastCalledWith('3\n1 2 3'));
});
