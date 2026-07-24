import { getApiErrorMessage } from './apiResponseUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/apis';

export type AuthUser = {
  id: string;
  username: string;
  createdAt: string;
};

async function authRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await authRequest('/users/me');
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(await getApiErrorMessage(response));
  return response.json();
}

export async function registerUser(username: string, password: string): Promise<AuthUser> {
  const response = await authRequest('/users/create', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(await getApiErrorMessage(response));
  return response.json();
}

export async function loginUser(username: string, password: string): Promise<AuthUser> {
  const response = await authRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(await getApiErrorMessage(response));
  return response.json();
}

export async function logoutUser(): Promise<void> {
  const response = await authRequest('/users/logout', { method: 'POST' });
  if (!response.ok) throw new Error(await getApiErrorMessage(response));
}
