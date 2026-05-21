import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import "../blog.css";

function fmtLong(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtShort(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function BlogPost() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [post,     setPost]     = useState(null);
  const [recent,   setRecent]   = useState([]);
  const [cats,     setCats]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setPost(null);

    fetch(`/api/blog/item.php?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setNotFound(true); else setPost(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    fetch("/api/blog/index.php?status=published&page=1&limit=7")
      .then((r) => r.json())
      .then((d) => setRecent(Array.isArray(d.posts) ? d.posts : []));

    fetch("/api/categories/index.php?type=blog")
      .then((r) => r.json())
      .then((d) => setCats(Array.isArray(d) ? d : []));
  }, [slug]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/blog?search=${encodeURIComponent(search.trim())}`);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b7280" }}>Loading…</p>
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !post) {
    return (
      <PublicLayout>
        <div style={{ minHeight: "60vh", textAlign: "center", paddingTop: 80 }}>
          <h2 style={{ fontFamily: "Poppins,sans-serif", fontSize: 28, color: "#231f20" }}>Post not found</h2>
          <p style={{ color: "#6b7280", marginTop: 12 }}>This post doesn't exist or has been removed.</p>
          <Link to="/blog" style={{ display: "inline-block", marginTop: 24, color: "#747efe", fontWeight: 600 }}>← Back to Blog</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bp-wrap">
        <div className="bp-layout">

          {/* ── Main content ── */}
          <article>
            {/* Featured image — full width, above everything */}
            {post.cover_image
              ? <img
                  className="bp-hero-img"
                  src={post.cover_image}
                  alt={post.title}
                  onError={(e) => {
                    // Image failed: show the URL in console so we can debug the path
                    console.warn("Cover image failed to load:", post.cover_image);
                    e.currentTarget.style.display = "none";
                  }}
                />
              : null
            }

            {/* Date label */}
            <div className="bp-date-label">
              {new Date(post.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </div>

            {/* Title */}
            <h1 className="bp-title">{post.title}</h1>

            {/* Meta: Posted at [time] in [categories] by [author] */}
            <div className="bp-meta">
              <span>Posted at {fmtTime(post.created_at)}h</span>

              {post.categories?.length > 0 && (
                <>
                  <span className="bp-meta-sep">in</span>
                  {post.categories.map((c, i) => (
                    <span key={c.id}>
                      <Link to={`/blog?search=${encodeURIComponent(c.name)}`}>{c.name}</Link>
                      {i < post.categories.length - 1 && ", "}
                    </span>
                  ))}
                </>
              )}

              {post.author && (
                <>
                  <span className="bp-meta-sep">by</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>

            {/* Content */}
            {post.content
              ? <div className="bp-content" dangerouslySetInnerHTML={{ __html: post.content }} />
              : post.excerpt
                ? <div className="bp-content"><p>{post.excerpt}</p></div>
                : <p style={{ color: "#9ca3af" }}>No content available.</p>
            }

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="bp-tags">
                {post.tags.map((t) => (
                  <Link key={t.id} to={`/blog?search=${encodeURIComponent(t.name)}`} className="bp-tag">
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            <div style={{ marginTop: 36 }}>
              <Link to="/blog" style={{ color: "#747efe", fontWeight: 600, fontSize: 14 }}>← Back to Blog</Link>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="bp-sidebar">

            {/* Search */}
            <form className="bp-sw-search" onSubmit={handleSearch}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Here"
              />
              <button type="submit" aria-label="Search"><SearchIcon /></button>
            </form>

            {/* Recent posts */}
            {recent.filter((r) => r.slug !== slug).length > 0 && (
              <div>
                <div className="bp-sw-title">Recent Posts</div>
                <ul className="bp-recent-list">
                  {recent.filter((r) => r.slug !== slug).slice(0, 6).map((r) => (
                    <li key={r.id}>
                      <Link to={`/blog/${r.slug}`} className="bp-recent-item">
                        {r.cover_image
                          ? <img className="bp-recent-thumb" src={r.cover_image} alt={r.title} />
                          : <div className="bp-recent-thumb-empty" />}
                        <div>
                          <span className="bp-recent-title">{r.title}</span>
                          <span className="bp-recent-date">{fmtShort(r.created_at)}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categories */}
            {cats.length > 0 && (
              <div>
                <div className="bp-sw-title">Categories</div>
                <ul className="bp-cat-list">
                  {cats.map((c) => (
                    <li key={c.id} className="bp-cat-item">
                      <Link to={`/blog?search=${encodeURIComponent(c.name)}`} className="bp-cat-link">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
