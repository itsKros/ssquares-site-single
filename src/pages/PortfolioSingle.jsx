import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import "../blog.css";

function ImageSlider({ images }) {
  const [cur, setCur] = useState(0);
  if (!images || images.length === 0) return null;
  const prev = () => setCur((c) => (c - 1 + images.length) % images.length);
  const next = () => setCur((c) => (c + 1) % images.length);
  return (
    <div className="pp-slider">
      {images.map((src, i) => (
        <div key={i} className={`pp-slide${i === cur ? " active" : ""}`}>
          <img src={src} alt={`Slide ${i + 1}`} />
        </div>
      ))}
      {images.length > 1 && (
        <>
          <button className="pp-slider-btn prev" onClick={prev} aria-label="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="pp-slider-btn next" onClick={next} aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="pp-slider-dots">
            {images.map((_, i) => (
              <button key={i} className={`pp-slider-dot${i === cur ? " active" : ""}`} onClick={() => setCur(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PortfolioSingle() {
  const { slug }   = useParams();
  const [item,     setItem]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true); setNotFound(false); setItem(null);
    fetch(`/api/portfolio/item.php?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setNotFound(true); else setItem(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <PublicLayout>
      <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p style={{ color:"#6b7280" }}>Loading…</p>
      </div>
    </PublicLayout>
  );

  if (notFound || !item) return (
    <PublicLayout>
      <div style={{ minHeight:"60vh", textAlign:"center", paddingTop:80 }}>
        <h2 style={{ fontFamily:"Poppins,sans-serif", fontSize:28, color:"#231f20" }}>Project not found</h2>
        <Link to="/portfolio" style={{ display:"inline-block", marginTop:24, color:"#747efe", fontWeight:600 }}>← Back to Portfolio</Link>
      </div>
    </PublicLayout>
  );

  const allImages = [
    ...(item.cover_image ? [item.cover_image] : []),
    ...(Array.isArray(item.images) ? item.images.filter((img) => img && img !== item.cover_image) : []),
  ];

  return (
    <PublicLayout>
      <ImageSlider images={allImages} />

      <div className="pp-wrap">
        <div className="pp-layout">

          {/* Main */}
          <div>
            <h1 className="pp-title">{item.title}</h1>
            {item.description
              ? <div className="pp-content" dangerouslySetInnerHTML={{ __html: item.description }} />
              : <p style={{ color:"#9ca3af" }}>No description available.</p>
            }
            {item.live_url && (
              <a href={item.live_url} target="_blank" rel="noreferrer" className="pp-live-btn">
                Visit Live Site
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </a>
            )}
          </div>

          {/* Sidebar */}
          <aside className="pp-sidebar">
            {item.categories?.length > 0 && (
              <div>
                <div className="pp-sw-title">Category</div>
                <ul className="pp-cat-list">
                  {item.categories.map((c) => (
                    <li key={c.id} className="pp-cat-item">
                      <Link to={`/portfolio?search=${encodeURIComponent(c.name)}`}>{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.tags?.length > 0 && (
              <div>
                <div className="pp-sw-title">Tags</div>
                <div className="pp-tag-list">
                  {item.tags.map((t) => (
                    <Link key={t.id} to={`/portfolio?search=${encodeURIComponent(t.name)}`} className="pp-tag">{t.name}</Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom prev / next navigation */}
        <div className="pp-bottom-nav">
          {item.prev ? (
            <Link to={`/portfolio/${item.prev.slug}`} className="pp-nav-item">
              <div className="pp-nav-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </div>
              <div>
                <span className="pp-nav-label">Previous</span>
                <span className="pp-nav-title">{item.prev.title}</span>
              </div>
            </Link>
          ) : <div style={{ flex:1 }} />}

          <Link to="/portfolio" className="pp-nav-grid" aria-label="All projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </Link>

          {item.next ? (
            <Link to={`/portfolio/${item.next.slug}`} className="pp-nav-item next">
              <div className="pp-nav-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
              <div>
                <span className="pp-nav-label">Next</span>
                <span className="pp-nav-title">{item.next.title}</span>
              </div>
            </Link>
          ) : <div style={{ flex:1 }} />}
        </div>
      </div>
    </PublicLayout>
  );
}
