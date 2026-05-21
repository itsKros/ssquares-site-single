// Shared layout for blog pages — uses the EXACT same header as the homepage
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../blog.css";

const NAV = [
  { label: "Home",    href: "/#home" },
  { label: "About",   href: "/#about" },
  { label: "Work",    href: "/#work" },
  { label: "Ongoing", href: "/#ongoing" },
  { label: "News",    href: "/#news" },
  { label: "Blog",    href: "/blog",  router: true },
  { label: "Contact", href: "/#contact" },
];

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

export default function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrollY() > 60;

  return (
    <>
      {/* ── Same header as homepage ────────────────────────── */}
      <header className={`sh${scrolled ? " scrolled" : ""}`}>
        <div className="sh-inner">
          <button
            className={`sh-burger${open ? " open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

          <a href="/" className="sh-logo">
            <img src="/assets/imgs/NewLogo-small.png" alt="Ssquares Tech" />
          </a>

          <nav className="sh-nav">
            <ul>
              {NAV.map((n) =>
                n.router
                  ? <li key={n.label}><Link to={n.href}>{n.label}<span className="nl" /></Link></li>
                  : <li key={n.label}><a href={n.href}>{n.label}<span className="nl" /></a></li>
              )}
            </ul>
          </nav>

          <button className="sh-search" aria-label="Search">
            <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeLinecap="round">
              <circle cx="9.5" cy="9.5" r="7.2" />
              <line x1="14.8" y1="14.8" x2="20.5" y2="20.5" />
            </svg>
          </button>
        </div>

        <nav className={`mob-nav${open ? " open" : ""}`}>
          <ul>
            {NAV.map((n) =>
              n.router
                ? <li key={n.label}><Link to={n.href} onClick={() => setOpen(false)}>{n.label}</Link></li>
                : <li key={n.label}><a href={n.href} onClick={() => setOpen(false)}>{n.label}</a></li>
            )}
          </ul>
        </nav>
      </header>

      <main style={{ paddingTop: "82px" }}>{children}</main>

      <footer className="site-footer">
        <p className="footer-copy">
          © 2026 | All Rights Reserved | <a href="/">Ssquares Tech.</a>
        </p>
      </footer>
    </>
  );
}
