import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../dashboard/api.js";

export default function BlogList() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch("/api/blog/index.php")
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const del = async () => {
    await apiFetch(`/api/blog/item.php?id=${confirm}`, { method: "DELETE" });
    setConfirm(null);
    load();
  };

  if (loading) return <div className="db-loading">Loading…</div>;

  return (
    <div>
      <div className="db-toolbar">
        <span className="db-toolbar-title">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/blog" target="_blank" rel="noreferrer" className="db-btn db-btn-ghost">View Blog →</a>
          <Link to="/dashboard/blog/new" className="db-btn db-btn-primary">+ New Post</Link>
        </div>
      </div>

      <div className="db-card">
        {posts.length === 0 ? (
          <div className="db-empty">
            <p>No blog posts yet. <Link to="/dashboard/blog/new">Create the first one.</Link></p>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Title</th><th>Categories</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td>
                      {p.categories?.length > 0
                        ? p.categories.map((c) => c.name).join(", ")
                        : <span style={{ color: "#9ca3af" }}>—</span>}
                    </td>
                    <td><span className={`db-badge db-badge-${p.status}`}>{p.status}</span></td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="db-btn db-btn-ghost db-btn-sm"
                        style={{ marginRight: 6 }}
                      >
                        View
                      </a>
                      <Link to={`/dashboard/blog/edit/${p.id}`} className="db-btn db-btn-ghost db-btn-sm" style={{ marginRight: 6 }}>
                        Edit
                      </Link>
                      <button className="db-btn db-btn-danger db-btn-sm" onClick={() => setConfirm(p.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <h3>Delete Post?</h3>
            <p>This action cannot be undone.</p>
            <div className="db-modal-actions">
              <button className="db-btn db-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="db-btn db-btn-danger" onClick={del}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
