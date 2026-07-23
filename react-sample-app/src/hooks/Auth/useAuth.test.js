import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';
import { getCurrentUser, loginUser, logoutUser } from '../../util/AuthApi';

jest.mock('../../util/AuthApi', () => ({
  getCurrentUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  registerUser: jest.fn(),
}));

function Consumer() {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <span>loading</span>;
  return (
    <>
      <span>{user?.username ?? 'guest'}</span>
      <button onClick={() => void login('tester', 'password123')}>login</button>
      <button onClick={() => void logout()}>logout</button>
    </>
  );
}

beforeEach(() => jest.clearAllMocks());

test('restores, logs in, and logs out the current user', async () => {
  getCurrentUser.mockResolvedValue(null);
  loginUser.mockResolvedValue({ id: '1', username: 'tester', createdAt: 'now' });
  logoutUser.mockResolvedValue(undefined);
  render(<AuthProvider><Consumer /></AuthProvider>);

  expect(await screen.findByText('guest')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'login' }));
  expect(await screen.findByText('tester')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'logout' }));
  await waitFor(() => expect(screen.getByText('guest')).toBeInTheDocument());
  expect(logoutUser).toHaveBeenCalledTimes(1);
});
