import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedControl } from './SegmentedControl';

function Harness() {
  const [value, setValue] = useState('array');
  return (
    <SegmentedControl
      legend="構造"
      value={value}
      options={[
        { value: 'array', label: '配列' },
        { value: 'tree', label: '木' },
        { value: 'graph', label: 'グラフ', disabled: true },
      ]}
      onChange={setValue}
    />
  );
}

test('changes one exclusive option and respects disabled options', () => {
  render(<Harness />);

  fireEvent.click(screen.getByLabelText('木'));
  expect(screen.getByLabelText('木')).toBeChecked();
  expect(screen.getByLabelText('配列')).not.toBeChecked();
  expect(screen.getByLabelText('グラフ')).toBeDisabled();
});
