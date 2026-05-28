export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div>
        &copy; {currentYear} Competitive Programming Assistant (CPA). All rights reserved.
      </div>
      <div className="footer-links">
        <a className="footer-link" href="https://react.dev" target="_blank" rel="noopener noreferrer">
          React Docs
        </a>
        <a className="footer-link" href="https://go.dev" target="_blank" rel="noopener noreferrer">
          Go API
        </a>
        <a className="footer-link" href="https://github.com" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  );
}
