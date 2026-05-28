import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

export type LoggedInUser = {
  id: string;
  username: string;
  time: string;
};

export function useAuth() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cpa_auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('cpa_auth_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/apis/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ログインに失敗しました');
      }

      const userData: LoggedInUser = data.user;
      setUser(userData);
      localStorage.setItem('cpa_auth_user', JSON.stringify(userData));
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown authentication error';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/apis/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '新規登録に失敗しました');
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown registration error';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cpa_auth_user');
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  };
}
