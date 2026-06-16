import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // pathname（URLのパス部分）が変更されたら、画面のスクロール位置を一番上にリセットする
    window.scrollTo(0, 0);
  }, [pathname]);

  // UIとして描画するものは何もないのでnullを返す
  return null;
}
