import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToggleSwitch } from './ToggleSwitch';

function Harness() {
  const [checked, setChecked] = useState(false);
  return <ToggleSwitch label="Tを付ける" checked={checked} onChange={setChecked} />;
}

test('exposes an accessible switch and changes its state', () => {
  render(<Harness />);
  const toggle = screen.getByRole('switch', { name: 'Tを付ける' });

  expect(toggle).not.toBeChecked();
  fireEvent.click(toggle);
  expect(toggle).toBeChecked();
});
