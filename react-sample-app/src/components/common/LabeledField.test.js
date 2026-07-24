import React from 'react';
import { render, screen } from '@testing-library/react';
import { LabeledField } from './LabeledField';

test('connects its visible label and hint to the wrapped control', () => {
  render(
    <LabeledField label="開始頂点" hint="1以上の頂点番号">
      <input type="number" defaultValue="1" />
    </LabeledField>,
  );

  expect(screen.getByRole('spinbutton', { name: '開始頂点' })).toHaveValue(1);
  expect(screen.getByText('1以上の頂点番号')).toBeInTheDocument();
});
