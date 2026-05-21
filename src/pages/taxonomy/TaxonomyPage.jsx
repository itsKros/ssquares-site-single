import { useState, useEffect } from "react";
import { apiFetch } from "../../dashboard/api.js";

/*
 * Reusable page for categories AND tags, for portfolio OR blog.
 * Props:
 *   taxonomy  "category" | "tag"
 *   type      "portfolio" | "blog"
 */
export default function TaxonomyPage({ taxonomy, type }) {
  const apiBase = taxonomy === "category" ? "/api/categories/index.php" : "/api/tags/index.php";

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ name: "" });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch(`${apiBase}?type=${type}`)
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [taxonomy, type]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    const data = await apiFetch(apiBase, {
      method: "POST",
      body: JSON.stringify({ name: form.name.trim(), type }),
    });
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    setForm({ name: "" });
    load();
  };

  const del = async () => {
    await apiFetch(`${apiBase}?id=${confirm}`, { method: "DELETE" });
    setConfirm(null);
    load();
  };

  const noun = taxonomy === "category" ? "categor" : "tag";
  const plural = taxonomy === "category" ? "categories" : "tags";
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

      {/* ── List ── */}
      <div className="db-card">
        <div className="db-toolbar">
          <span className="db-toolbar-title">
            {items.length} {typeLabel} {items.length !== 1 ? plural : noun + "y"}
          </span>
        </div>

        {loading ? (
          <div className="db-loading">Loading…</div>
        ) : items.length === 0 ? (
          <div className="db-empty">
            <p>No {plural} yet. Use the form to add the first one.</p>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Name</th><th>Slug</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>{item.slug}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="db-btn db-btn-danger db-btn-sm" onClick={() => setConfirm(item.id)}>
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

      {/* ── Add form ── */}
      <div className="db-card">
        <div className="db-toolbar-title" style={{ marginBottom: 18 }}>
          Add {typeLabel} {taxonomy === "category" ? "Category" : "Tag"}
        </div>

        {error && <div className="db-alert db-alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="db-form-group" style={{ marginBottom: 14 }}>
            <label>Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder={taxonomy === "tag" ? "e.g. react" : "e.g. WordPress"}
              required
            />
          </div>
          <div className="db-form-actions">
            <button type="submit" className="db-btn db-btn-primary" disabled={saving}>
              {saving ? "Adding…" : `Add ${taxonomy === "category" ? "Category" : "Tag"}`}
            </button>
          </div>
        </form>

        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16 }}>
          {taxonomy === "tag"
            ? "You can also create tags directly from the post/portfolio form."
            : "You can also create categories directly from the post/portfolio form."}
        </p>
      </div>

      {/* ── Confirm delete ── */}
      {confirm && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <h3>Delete {taxonomy === "category" ? "Category" : "Tag"}?</h3>
            <p>
              {taxonomy === "category"
                ? "Existing posts/items in this category will have it removed."
                : "This tag will be removed from all posts/items that use it."}
            </p>
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
