// App.jsx
import { useState, useEffect, useRef } from "react";
import Contact from "./Contact.jsx";
import "./contact-extra.css";

/* ═══════════════════════════════════════════════════════════════════
   ALL STYLES — injected via <style> tag (single-file approach)
   Palette  : #231f20 dark · #747efe purple · #c30c19 red · #f5f0eb warm
   Fonts    : Poppins (headings) · Roboto (body)
═══════════════════════════════════════════════════════════════════ */


/* ─── LOCAL IMAGE PATHS ──────────────────────────────────────────────────── */
// All images live in /public/assets/imgs/ — Vite serves /public at root
const IMG = {
  logo:          "/assets/imgs/NewLogo-small.png",
  wordmark:      "/assets/imgs/h1-rev-img-02-1-blue.png",
  developer:     "/assets/imgs/Developer.png",
  aboutBanner:   "/assets/imgs/h1-img-07.png",
  aboutPhoto:    "/assets/imgs/h1-img-01-v3.png",
  worksBanner:   "/assets/imgs/h1-img-03v2.png",
  ongoingBanner: "/assets/imgs/h1-img-08.png",
  newsBanner:    "/assets/imgs/h1-img-05.png",
  contactBanner: "/assets/imgs/h1-img-06.png",
};

/* ─── DATA ───────────────────────────────────────────────────────────────── */

const NAV = [
  { label: "Home",    href: "#home" },
  { label: "About",   href: "#about" },
  { label: "Work",    href: "#work" },
  { label: "Ongoing", href: "#ongoing" },
  { label: "News",    href: "#news" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  { num: "01.", title: "New Website Design" },
  { num: "02.", title: "Custom Web\u00a0Development" },
  { num: "03.", title: "Custom App Development" },
  { num: "04.", title: "Digital Marketing" },
];

const PORTFOLIO = [
  {
    title: "Cosmic Clean Energy",
    cat:   "ecommerce, elementor, product catalogue",
    img:   "/assets/imgs/Cosmic-large.png",
    href:  "https://www.ssquares.co.in/portfolio_page/cosmic-clean-energy/",
  },
  {
    title: "iBG Finance",
    cat:   "blockchain, business, elementor",
    img:   "/assets/imgs/iBG-Featured.png",
    href:  "https://www.ssquares.co.in/portfolio_page/ibg-finance/",
  },
  {
    title: "Content Stadium",
    cat:   "blog, business, elementor, portfolio, product catalogue",
    img:   "/assets/imgs/Content-Stadium-Featured.png",
    href:  "https://www.ssquares.co.in/portfolio_page/content-stadium/",
  },
  {
    title: "Cake Land",
    cat:   "blog, business, multilingual, product catalogue, wp bakery",
    img:   "/assets/imgs/Cakeland-Featured.png",
    href:  "https://www.ssquares.co.in/portfolio_page/cake-land/",
  },
  {
    title: "Influencer Launch",
    cat:   "blog, business, community",
    img:   "/assets/imgs/Influencer-Launch-Featured.png",
    href:  "https://www.ssquares.co.in/portfolio_page/influencer-launch/",
  },
  {
    title: "Seny Beauty",
    cat:   "business, elementor, product catalogue, wp bakery",
    img:   "/assets/imgs/Seany-Beauty-1.jpg",
    href:  "https://www.ssquares.co.in/portfolio_page/seny-beauty/",
  },
];

const TECH_SLIDES = [
  { label: "App Development", img: "/assets/imgs/App-dev.jpg" },
  { label: "SEO",             img: "/assets/imgs/SEO.jpg" },
  { label: "WordPress",       img: "/assets/imgs/Wordpress.jpg" },
];

const NEWS = [
  {
    title: "Web Design Trends 2022 By Ssquares",
    date:  "16 July, 2022",
    img:   "/assets/imgs/Wd-700x371.jpg",
    href:  "https://www.ssquares.co.in/2022/07/16/web-design-trends-2022-by-ssquares/",
  },
  {
    title: "Choose WordPress for Website Design",
    date:  "16 July, 2022",
    img:   "/assets/imgs/WP-700x371.jpg",
    href:  "https://www.ssquares.co.in/2022/07/16/choose-wordpress-for-website-design/",
  },
  {
    title: "How To Increase Your ROI Through Scientific SEM",
    date:  "16 July, 2022",
    img:   "/assets/imgs/SEO-1-700x371.jpg",
    href:  "https://www.ssquares.co.in/2022/07/16/how-to-increase-your-roi-through-scientific-sem/",
  },
];

/* ─── HOOKS ──────────────────────────────────────────────────────────────── */

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── SECTION BANNER ─────────────────────────────────────────────────────── */

function SB({ src, alt }) {
  const [ref, inView] = useInView(0.04);
  return (
    <div ref={ref} className={`sb${inView ? " in" : ""}`}>
      <img src={src} alt={alt} />
    </div>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────────────── */

function Header({ open, setOpen }) {
  const scrolled = useScrollY() > 60;
  return (
    <header className={`sh${scrolled ? " scrolled" : ""}`}>
      <div className="sh-inner">
        <button
          className={`sh-burger${open ? " open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <a href="#home" className="sh-logo">
          <img src={IMG.logo} alt="Ssquares Tech" />
        </a>

        <nav className="sh-nav">
          <ul>
            {NAV.map((l) => (
              <li key={l.label}>
                <a href={l.href}>
                  {l.label}
                  <span className="nl" />
                </a>
              </li>
            ))}
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
          {NAV.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-wrap">
        <div className="hero-left">          
          <h1 className="hero-h1">
            <span className="hero-h1-l1">WEB DEVELOPMENT</span>           
          </h1>
          <img className="hero-wordmark" src={IMG.wordmark} alt="Ssquares" />
        </div>
        <div className="hero-right">
          <img className="hero-illus" src={IMG.developer} alt="Developer illustration" />
        </div>
        <div className="hero-bottom">
          
          <p className="hero-tagline">
            Offering affordable custom{" "}
            <span style={{ color: "var(--purple)" }}>website design</span>
          </p>
          <div className="hero-social">
            
            <a className="hero-social-link" href="https://www.linkedin.com/company/ssquares-interactive" target="_blank" rel="noreferrer">Linkedin,</a>
            {" "}
            <a className="hero-social-link" href="https://www.facebook.com/SsquaresInteractive" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        

          
        </div> 
      </div>
    </section>
  );
}

/* ─── SERVICES BAR ───────────────────────────────────────────────────────── */

function ServicesBar() {
  return (
    <section className="svc-bar">
      <div className="svc-row">
        {SERVICES.map((s) => (
          <div className="svc-item" key={s.num}>
            <span className="svc-num">{s.num}</span>
            <h4 className="svc-lbl">{s.title}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── ABOUT ──────────────────────────────────────────────────────────────── */

function About() {
  const [ref, inView] = useInView();
  return (
    <section id="about" className="about-section">
      <SB src={IMG.aboutBanner} alt="About" />
      <div ref={ref} className={`about-grid${inView ? " fu" : ""}`}>
        <div className="about-img">
          <img src={IMG.aboutPhoto} alt="About Ssquares" />
        </div>
        <div className="about-right">
          <h2 className="sec-h2">Quality services for every client on every project</h2>
          <p className="sec-body">
            We're Ssquares Tech, a well-known Web Development Company in Bhilai.
            We offer IT services in Customized Web Design Solutions, Software
            Design &amp; Development, Search Engine Optimization, Mobile
            Application Development to clients all over the world.
          </p>
          <a href="#contact" className="outline-btn">Contact Us</a>
        </div>
      </div>
    </section>
  );
}

/* ─── WORKS / PORTFOLIO ──────────────────────────────────────────────────── */

function Works() {
  return (
    <section id="work" className="works-section">
      <SB src={IMG.worksBanner} alt="Works" />
      <div className="pf-grid">
        {PORTFOLIO.map((item) => (
          <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="pf-card">
            <img src={item.img} alt={item.title} loading="lazy" />
            <div className="pf-overlay">
              <h5 className="pf-title">{item.title}</h5>
              <span className="pf-cat">{item.cat}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ─── TECHNOLOGIES ───────────────────────────────────────────────────────── */

function Technologies() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView();
  const n = TECH_SLIDES.length;

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % n), 3800);
    return () => clearInterval(id);
  }, [n]);

  return (
    <section id="ongoing" className="tech-section">
      <SB src={IMG.ongoingBanner} alt="Ongoing" />
      <div ref={ref} className={`tech-grid${inView ? " fu" : ""}`}>
        <div className="tech-left">
          <h2 className="sec-h2">Technologies</h2>
          <p className="sec-body">
            We design, develop, implement and maintain the websites for small,
            medium, large and complex entities with ease and effectiveness.
            <br /><br />
            Besides WordPress web development services we also provide website
            maintenance, SEO, SMO, and web designing services. The skilled
            developers of Ssquares use revolutionary techniques to meet the
            ever growing demand to survive in the online world.
          </p>
          <a href="#contact" className="outline-btn">Contact Us</a>
        </div>
        <div className="tech-slider">
          {TECH_SLIDES.map((s, i) => (
            <div
              key={s.label}
              className={[
                "tc",
                i === active               ? "tc-active" : "",
                i === (active - 1 + n) % n ? "tc-prev"   : "",
                i === (active + 1) % n     ? "tc-next"   : "",
              ].filter(Boolean).join(" ")}
            >
              <img src={s.img} alt={s.label} />
            </div>
          ))}
          <div className="tc-dots">
            {TECH_SLIDES.map((_, i) => (
              <button key={i} className={`tc-dot${i === active ? " on" : ""}`} onClick={() => setActive(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── NEWS ───────────────────────────────────────────────────────────────── */

function NewsSection() {
  const [ref, inView] = useInView();
  return (
    <section id="news" className="news-section">
      <SB src={IMG.newsBanner} alt="News" />
      <div ref={ref} className={`news-grid${inView ? " fu" : ""}`}>
        {NEWS.map((p) => (
          <a key={p.title} href={p.href} target="_blank" rel="noreferrer" className="news-card">
            <div className="news-thumb">
              <img src={p.img} alt={p.title} loading="lazy" />
            </div>
            <h3 className="news-title">{p.title}</h3>
            <time className="news-date">{p.date}</time>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ─── CONTACT ────────────────────────────────────────────────────────────── */



/* ─── FOOTER ─────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="site-footer">
      <p className="footer-copy">
        © 2026 | All Rights Reserved | <a href="/">Ssquares Tech.</a>
      </p>
    </footer>
  );
}

/* ─── BACK TO TOP ────────────────────────────────────────────────────────── */

function BackToTop() {
  const show = useScrollY() > 320;
  return (
    <button
      className={`btt${show ? " show" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      
      <Header open={open} setOpen={setOpen} />
      <main>
        <Hero />
        <ServicesBar />
        <About />
        <Works />
        <Technologies />
        <NewsSection />
        {/* <Contact /> */}
        <Contact bannerSrc={IMG.contactBanner} />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}