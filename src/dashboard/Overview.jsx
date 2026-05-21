import { useState, useEffect } from "react";
import { apiFetch } from "./api.js";

export default function Overview() {
  const [stats, setStats] = useState({ posts: 0, portfolio: 0, users: 0, categories: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/blog/index.php"),
      apiFetch("/api/portfolio/index.php"),
      apiFetch("/api/categories/index.php"),
    ]).then(([posts, portfolio, cats]) => {
      setStats({
        posts:      Array.isArray(posts)     ? posts.length     : 0,
        portfolio:  Array.isArray(portfolio) ? portfolio.length : 0,
        categories: Array.isArray(cats)      ? cats.length      : 0,
      });
      if (Array.isArray(posts)) {
        setRecent(posts.slice(0, 5));
      }
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="db-stat-grid">
        <div className="db-stat">
          <div className="db-stat-num">{stats.posts}</div>
          <div className="db-stat-label">Blog Posts</div>
        </div>
        <div className="db-stat">
          <div className="db-stat-num">{stats.portfolio}</div>
          <div className="db-stat-label">Portfolio Items</div>
        </div>
        <div className="db-stat">
          <div className="db-stat-num">{stats.categories}</div>
          <div className="db-stat-label">Categories</div>
        </div>
      </div>

      <div className="db-card">
        <div className="db-toolbar">
          <span className="db-toolbar-title">Recent Blog Posts</span>
        </div>
        {recent.length === 0 ? (
          <div className="db-empty"><p>No posts yet.</p></div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Title</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td><span className={`db-badge db-badge-${p.status}`}>{p.status}</span></td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
