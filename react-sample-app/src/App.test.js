import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the feature-based frontend shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /機能ごとに分けて、壊れにくい react アプリへ/i })).toBeInTheDocument();
  expect(screen.getByText(/auth/i)).toBeInTheDocument();
  expect(screen.getByText(/graph/i)).toBeInTheDocument();
});
