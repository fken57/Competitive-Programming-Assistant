import { getCurrentUser, loginUser, logoutUser, registerUser } from './AuthApi';

beforeEach(() => {
  global.fetch = jest.fn();
});

test('all auth requests include credentials', async () => {
  const user = { id: '1', username: 'tester', createdAt: '2026-07-24T00:00:00Z' };
  fetch.mockResolvedValue({ ok: true, status: 200, json: async () => user });

  await getCurrentUser();
  await registerUser('tester', 'password123');
  await loginUser('tester', 'password123');
  fetch.mockResolvedValueOnce({ ok: true, status: 204 });
  await logoutUser();

  expect(fetch).toHaveBeenCalledTimes(4);
  fetch.mock.calls.forEach(([, options]) => {
    expect(options.credentials).toBe('include');
  });
});

test('me returns null for an unauthenticated response', async () => {
  fetch.mockResolvedValue({ ok: false, status: 401 });
  await expect(getCurrentUser()).resolves.toBeNull();
});
