import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import "../blog.css";

const PER_PAGE = 9;

function fmt(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function PortfolioCard({ item }) {
  return (
    <Link to={`/portfolio/${item.slug}`} className="news-card" style={{ textDecoration: "none" }}>
      <div className="news-thumb">
        {item.cover_image
          ? <img src={item.cover_image} alt={item.title} loading="lazy" />
          : <div style={{ width:"100%", height:"100%", background:"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", fontSize:12 }}>No image</div>
        }
      </div>
      {item.categories?.length > 0 && (
        <div className="ba-card-cats">
          {item.categories.map((c) => <span key={c.id} className="ba-card-cat">{c.name}</span>)}
        </div>
      )}
      <h3 className="news-title">{item.title}</h3>
      <time className="news-date">{fmt(item.created_at)}</time>
    </Link>
  );
}

function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav className="ba-pagination">
      <button className="ba-pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} style={{ padding:"0 4px", color:"#9ca3af" }}>…</span>
          : <button key={p} className={`ba-pg-btn${p === page ? " active" : ""}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="ba-pg-btn" disabled={page === Math.ceil(total / limit)} onClick={() => onChange(page + 1)}>›</button>
    </nav>
  );
}

export default function PortfolioArchive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const query = searchParams.get("search") || "";
  const page  = parseInt(searchParams.get("page") || "1", 10);
  const [input, setInput] = useState(query);

  useEffect(() => { setInput(query); }, [query]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page, limit: PER_PAGE });
    if (query) params.set("search", query);
    fetch(`/api/portfolio/index.php?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(`Error: ${d.error}`); return; }
        setItems(Array.isArray(d.items) ? d.items : []);
        setTotal(typeof d.total === "number" ? d.total : 0);
      })
      .catch((e) => setError(`Failed to load portfolio: ${e.message}`))
      .finally(() => setLoading(false));
  }, [query, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = input.trim();
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    p.set("page", "1");
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPage = (pg) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", pg);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PublicLayout>
      <div className="ba-hero">
        <h1>Portfolio</h1>
        <p>Our work — websites, apps and digital experiences</p>
      </div>

      <div className="ba-wrap">
        <div className="ba-search-row">
          <form className="ba-search-form" onSubmit={handleSearch}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search projects…" />
            <button type="submit" aria-label="Search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </div>

        {query && (
          <p className="ba-results-info">
            {total} result{total !== 1 ? "s" : ""} for "<strong>{query}</strong>"
            &nbsp;·&nbsp;
            <button onClick={() => { setInput(""); setSearchParams({ page:"1" }); }}>Clear</button>
          </p>
        )}

        {loading ? (
          <div className="ba-loading">Loading portfolio…</div>
        ) : error ? (
          <div className="ba-empty">{error}</div>
        ) : (
          <div className="news-grid" style={{ padding: 0 }}>
            {items.length === 0
              ? <div className="ba-empty">{query ? `No projects found for "${query}".` : "No portfolio items yet."}</div>
              : items.map((item) => <PortfolioCard key={item.id} item={item} />)
            }
          </div>
        )}

        {!loading && items.length > 0 && (
          <Pagination page={page} total={total} limit={PER_PAGE} onChange={goPage} />
        )}
      </div>
    </PublicLayout>
  );
}
