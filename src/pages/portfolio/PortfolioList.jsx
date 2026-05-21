import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../dashboard/api.js";

export default function PortfolioList() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch("/api/portfolio/index.php")
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const del = async () => {
    await apiFetch(`/api/portfolio/item.php?id=${confirm}`, { method: "DELETE" });
    setConfirm(null);
    load();
  };

  if (loading) return <div className="db-loading">Loading…</div>;

  return (
    <div>
      <div className="db-toolbar">
        <span className="db-toolbar-title">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        <div style={{ display:"flex", gap:8 }}>
          <a href="/portfolio" target="_blank" rel="noreferrer" className="db-btn db-btn-ghost">View Portfolio →</a>
          <Link to="/dashboard/portfolio/new" className="db-btn db-btn-primary">+ New Item</Link>
        </div>
      </div>

      <div className="db-card">
        {items.length === 0 ? (
          <div className="db-empty"><p>No portfolio items yet. <Link to="/dashboard/portfolio/new">Add one.</Link></p></div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Cover</th><th>Title</th><th>Categories</th><th>Live URL</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.cover_image
                        ? <img src={item.cover_image} alt="" style={{ width:60, height:40, objectFit:"cover", borderRadius:4 }} />
                        : <div style={{ width:60, height:40, background:"#f3f4f6", borderRadius:4 }} />}
                    </td>
                    <td><strong>{item.title}</strong></td>
                    <td>
                      {item.categories?.length > 0
                        ? item.categories.map((c) => c.name).join(", ")
                        : <span style={{ color:"#9ca3af" }}>—</span>}
                    </td>
                    <td>
                      {item.live_url
                        ? <a href={item.live_url} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#747efe" }}>Visit</a>
                        : "—"}
                    </td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign:"right", whiteSpace:"nowrap" }}>
                      <a
                        href={`/portfolio/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="db-btn db-btn-ghost db-btn-sm"
                        style={{ marginRight:6 }}
                      >
                        View
                      </a>
                      <Link to={`/dashboard/portfolio/edit/${item.id}`} className="db-btn db-btn-ghost db-btn-sm" style={{ marginRight:6 }}>Edit</Link>
                      <button className="db-btn db-btn-danger db-btn-sm" onClick={() => setConfirm(item.id)}>Delete</button>
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
            <h3>Delete Portfolio Item?</h3>
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
