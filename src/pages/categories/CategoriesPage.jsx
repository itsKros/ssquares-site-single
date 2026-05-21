import { useState, useEffect } from "react";
import { apiFetch } from "../../dashboard/api.js";

const EMPTY_FORM = { name: "", type: "portfolio" };

export default function CategoriesPage() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter]   = useState("all");

  const load = () => {
    setLoading(true);
    apiFetch("/api/categories/index.php")
      .then((d) => setCats(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    const data = await apiFetch("/api/categories/index.php", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    setForm(EMPTY_FORM);
    load();
  };

  const del = async () => {
    await apiFetch(`/api/categories/index.php?id=${confirm}`, { method: "DELETE" });
    setConfirm(null);
    load();
  };

  const visible = filter === "all" ? cats : cats.filter((c) => c.type === filter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

      {/* ── List ── */}
      <div className="db-card">
        <div className="db-toolbar">
          <span className="db-toolbar-title">{visible.length} categor{visible.length !== 1 ? "ies" : "y"}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "portfolio", "blog"].map((t) => (
              <button
                key={t}
                className={`db-btn db-btn-sm ${filter === t ? "db-btn-primary" : "db-btn-ghost"}`}
                onClick={() => setFilter(t)}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="db-loading">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="db-empty"><p>No categories yet. Add one →</p></div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>Slug</th><th></th></tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>
                      <span className={`db-badge ${c.type === "portfolio" ? "db-badge-admin" : "db-badge-editor"}`}>
                        {c.type}
                      </span>
                    </td>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>{c.slug}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="db-btn db-btn-danger db-btn-sm" onClick={() => setConfirm(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add form ── */}
      <div className="db-card">
        <div className="db-toolbar-title" style={{ marginBottom: 18 }}>Add Category</div>
        {error && <div className="db-alert db-alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="db-form-grid">
            <div className="db-form-group">
              <label>Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. WordPress"
                required
              />
            </div>
            <div className="db-form-group">
              <label>Type *</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="portfolio">Portfolio</option>
                <option value="blog">Blog</option>
              </select>
            </div>
          </div>
          <div className="db-form-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="db-btn db-btn-primary" disabled={saving}>
              {saving ? "Adding…" : "Add Category"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Confirm delete ── */}
      {confirm && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <h3>Delete Category?</h3>
            <p>Any portfolio items or blog posts in this category will have their category cleared.</p>
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
