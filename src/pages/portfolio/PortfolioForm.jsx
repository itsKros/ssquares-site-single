import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../dashboard/api.js";
import CategorySelector from "../../dashboard/CategorySelector.jsx";
import TagSelector      from "../../dashboard/TagSelector.jsx";
import ImageUpload      from "../../dashboard/ImageUpload.jsx";

const EMPTY = {
  title: "", description: "", live_url: "", cover_image: "",
  category_ids: [], tag_ids: [], images: [],
};

export default function PortfolioForm() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [form, setForm]     = useState(EMPTY);
  const [slug, setSlug]     = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/portfolio/item.php?id=${id}`).then((d) => {
      if (d.error) { setError(d.error); return; }
      setSlug(d.slug ?? "");
      setForm({
        title:        d.title        ?? "",
        description:  d.description  ?? "",
        live_url:     d.live_url     ?? "",
        cover_image:  d.cover_image  ?? "",
        images:       Array.isArray(d.images)     ? d.images     : [],
        category_ids: (d.categories  ?? []).map((c) => c.id),
        tag_ids:      (d.tags        ?? []).map((t) => t.id),
      });
    });
  }, [id]);

  const set    = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const change = (e) => set(e.target.name, e.target.value);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError("");
    const url    = id ? `/api/portfolio/item.php?id=${id}` : "/api/portfolio/index.php";
    const method = id ? "PUT" : "POST";
    const data   = await apiFetch(url, { method, body: JSON.stringify(form) });
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    if (data.slug) setSlug(data.slug);
    navigate("/dashboard/portfolio");
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="db-alert db-alert-error">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* ── Main column ── */}
        <div className="db-card">
          <div className="db-form-grid">
            <div className="db-form-group">
              <label>Title *</label>
              <input name="title" value={form.title} onChange={change} required placeholder="Project name" />
            </div>

            <div className="db-form-group">
              <label>Live URL</label>
              <input name="live_url" value={form.live_url} onChange={change} placeholder="https://example.com" />
            </div>

            <div className="db-form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={change} rows={8}
                placeholder="Project description, technologies used, results achieved…" />
            </div>
          </div>
        </div>

        {/* ── Side column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Save */}
          <div className="db-card">
            <div className="db-form-actions">
              <button type="submit" className="db-btn db-btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                {saving ? "Saving…" : id ? "Update Item" : "Save Item"}
              </button>
              <button type="button" className="db-btn db-btn-ghost" onClick={() => navigate("/dashboard/portfolio")}>
                Cancel
              </button>
            </div>
            {id && slug && (
              <a
                href={`/portfolio/${slug}`}
                target="_blank"
                rel="noreferrer"
                style={{ display:"block", textAlign:"center", marginTop:10, fontSize:13, color:"#747efe", textDecoration:"none" }}
              >
                View Item →
              </a>
            )}
          </div>

          {/* Cover image */}
          <div className="db-card">
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>Cover Image</label>
            <ImageUpload value={form.cover_image} onChange={(v) => set("cover_image", v)} label="cover image" />
          </div>

          {/* Categories */}
          <div className="db-card">
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>Categories</label>
            <CategorySelector type="portfolio" value={form.category_ids} onChange={(v) => set("category_ids", v)} />
          </div>

          {/* Tags */}
          <div className="db-card">
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>Tags</label>
            <TagSelector type="portfolio" value={form.tag_ids} onChange={(v) => set("tag_ids", v)} />
          </div>

        </div>
      </div>
    </form>
  );
}
