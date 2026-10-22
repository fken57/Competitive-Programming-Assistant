import { render, screen } from '@testing-library/react';
import App from './App';
import { ScrollToTop } from './components/common/ScrollToTop';
import { getCurrentUser } from './util/AuthApi';

jest.mock('./components/header/header', () => {
  const { useAuth } = require('./hooks/Auth/useAuth');
  return function Header() {
    const { user, loading } = useAuth();
    return <header>{loading ? '認証確認中' : user?.username ?? 'ゲスト'}</header>;
  };
});
jest.mock('./components/router/MainRouter', () => ({
  MainRouter: () => <main>ページ本文</main>,
}));
jest.mock('./components/footer/Footer', () => ({
  Footer: () => <footer>フッター</footer>,
}));
jest.mock('./components/common/ScrollToTop', () => ({
  ScrollToTop: jest.fn(),
}));
jest.mock('./util/AuthApi', () => ({
  getCurrentUser: jest.fn(),
}));

test('composes the frontend shell inside the authentication provider', async () => {
  getCurrentUser.mockResolvedValue(null);
  ScrollToTop.mockReturnValue(null);
  render(<App />);

  expect(screen.getByRole('banner')).toHaveTextContent('認証確認中');
  expect(await screen.findByText('ゲスト')).toBeInTheDocument();
  expect(getCurrentUser).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('main')).toHaveTextContent('ページ本文');
  expect(screen.getByRole('contentinfo')).toHaveTextContent('フッター');
  expect(ScrollToTop).toHaveBeenCalled();
});
