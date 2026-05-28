import type { ReactNode } from 'react';

type HyperlinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

function Hyperlink({ href, children, className }: HyperlinkProps) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default Hyperlink;
