import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './header';

let mockCurrentPath = '/';

jest.mock('react-router-dom', () => {
  const ReactModule = require('react');
  return {
    Link: ({ to, children, ...props }) => ReactModule.createElement(
      'a',
      { ...props, href: to },
      children,
    ),
    NavLink: ({ to, end, className, children }) => {
      const isActive = end ? mockCurrentPath === to : mockCurrentPath.startsWith(to);
      return ReactModule.createElement(
        'a',
        {
          href: to,
          className: typeof className === 'function' ? className({ isActive }) : className,
          'aria-current': isActive ? 'page' : undefined,
        },
        children,
      );
    },
  };
}, { virtual: true });

jest.mock('../../hooks/Auth/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    logout: jest.fn(),
  }),
}));

test.each([
  ['/', 'Home'],
  ['/graph', 'Graph'],
  ['/array', 'Array'],
  ['/random-gen', 'Random Gen'],
])('shows %s as the current header destination', (path, label) => {
  mockCurrentPath = path;
  render(<Header />);

  expect(screen.getByRole('navigation', { name: 'ページ切替' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
});

test('offers links to every main page and the title returns home', () => {
  mockCurrentPath = '/random-gen';
  render(<Header />);

  expect(screen.getByRole('link', { name: 'Competitive Programming Assistant' }))
    .toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Graph' })).toHaveAttribute('href', '/graph');
  expect(screen.getByRole('link', { name: 'Array' })).toHaveAttribute('href', '/array');
  expect(screen.getByRole('link', { name: 'Random Gen' })).toHaveAttribute('href', '/random-gen');
});
