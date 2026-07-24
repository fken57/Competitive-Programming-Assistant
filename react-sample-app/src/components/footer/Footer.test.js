import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

jest.mock('react-router-dom', () => {
  const ReactModule = require('react');
  return {
    Link: ({ to, children }) => ReactModule.createElement('a', { href: to }, children),
    useLocation: () => ({ pathname: '/' }),
  };
}, { virtual: true });

test('links only to the current main pages', () => {
  render(<Footer />);

  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Graph Analyzer' })).toHaveAttribute('href', '/graph');
  expect(screen.getByRole('link', { name: 'Array Analyzer' })).toHaveAttribute('href', '/array');
  expect(screen.getByRole('link', { name: 'Random Gen' })).toHaveAttribute('href', '/random-gen');
  expect(screen.queryByRole('link', { name: 'String Analyzer' })).not.toBeInTheDocument();
});

test('describes the analyzer and random input generator that currently exist', () => {
  render(<Footer />);

  expect(screen.getByText(/グラフや配列の静的解析/)).toBeInTheDocument();
  expect(screen.getByText(/再現可能な競技プログラミング入力生成/)).toBeInTheDocument();
  expect(screen.queryByText(/文字列標準入力/)).not.toBeInTheDocument();
});
