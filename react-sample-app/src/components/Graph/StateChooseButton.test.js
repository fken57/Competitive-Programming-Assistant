import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { StateChooseToggle } from './StateChooseButton';

function ToggleHarness() {
  const [graphType, setGraphType] = useState('undirected');
  const [hasWeights, setHasWeights] = useState(false);
  return <StateChooseToggle graphType={graphType} setGraphType={setGraphType} hasWeights={hasWeights} setHasWeights={setHasWeights} />;
}

test('does not offer Functional Graph and always offers a weight choice', () => {
  render(<ToggleHarness />);
  expect(screen.queryByLabelText('Functional')).not.toBeInTheDocument();
  expect(screen.getByLabelText('重みなし')).toBeInTheDocument();
  expect(screen.getByLabelText('重み付き')).toBeInTheDocument();
});
